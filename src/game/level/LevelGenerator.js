import { Grid } from '../Grid.js'
import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
} from '../../config/constants.js'
import { TERRAIN_REGION } from '../../config/terrainTypes.js'
import { buildFragmentPlan, normalizeFragmentSlots } from '../../config/crafting.js'
import { clonePuzzleReward } from '../../config/puzzleTypes.js'
import { createTrap, DART_MIN_DISTANCE } from '../../config/trapTypes.js'

const RADII = {
  small: 8,
  medium: 17,
  large: 25,
}

const ROLE_DESTRUCTIBLE_DENSITY = {
  vein: 0.45,
  den: 0.20,
  mixed: 0.35,
  relic: 0.25,
  agora: 0.10,
}

const NOISE_SCALE = {
  small: 5,
  medium: 8,
  large: 11,
}

const CORRIDOR_BASE_LENGTH = {
  small: 10,
  medium: 15,
  large: 25,
}

const CORRIDOR_DESTRUCTIBLE_DENSITY = 0.08
const PROXIMITY_GAP = 10
const WALL_LIGHT_SPACING = 6
const WALL_LIGHT_TILE_BUDGET = 80
const CORRIDOR_LIGHT_TILE_BUDGET = 40

const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
]

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomInt(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1))
}

function shuffle(values, rand) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return values
}

function key(x, y) {
  return `${x},${y}`
}

function parseKey(cellKey) {
  const [x, y] = cellKey.split(',').map(Number)
  return { x, y }
}

function nodeTerrainRegion(node, exitNodeId) {
  if (node.id === 0) return TERRAIN_REGION.entry
  if (node.id === exitNodeId) return TERRAIN_REGION.exit
  return TERRAIN_REGION[node.role] ?? TERRAIN_REGION.agora
}

function chooseWallLightSpawns(
  grid,
  carvedMask,
  corridorCells,
  protectedCells,
  rand,
) {
  const reserved = new Set(protectedCells)
  const corridorMask = new Set(
    [...corridorCells.values()].flatMap((cells) => [...cells]),
  )
  const candidates = []

  for (const cellKey of carvedMask) {
    if (reserved.has(cellKey)) continue
    const { x, y } = parseKey(cellKey)
    if (grid.get(x, y) !== TILE_EMPTY) continue

    const adjacentWalls = DIRECTIONS
      .map((dir) => ({ dir, x: x + dir.x, y: y + dir.y }))
      .filter(({ x: wx, y: wy }) => grid.get(wx, wy) === TILE_WALL)

    if (!adjacentWalls.length) continue
    candidates.push({
      x,
      y,
      adjacentWalls,
      location: corridorMask.has(cellKey) ? 'corridor' : 'room',
    })
  }

  const targetCount = Math.max(1, Math.floor(carvedMask.size / WALL_LIGHT_TILE_BUDGET))
  const corridorTarget = Math.floor(corridorMask.size / CORRIDOR_LIGHT_TILE_BUDGET)
  const corridorCandidates = shuffle(
    candidates.filter((candidate) => candidate.location === 'corridor'),
    rand,
  )
  const remainingCandidates = shuffle(
    candidates.filter((candidate) => candidate.location !== 'corridor'),
    rand,
  )

  const selected = []
  function trySelect(candidate) {
    const tooClose = selected.some((light) => (
      Math.abs(light.x - candidate.x) + Math.abs(light.y - candidate.y) < WALL_LIGHT_SPACING
    ))
    if (tooClose) return false

    const wall = candidate.adjacentWalls[Math.floor(rand() * candidate.adjacentWalls.length)]
    let orientation = 'east'
    if (wall.dir.x === 1) orientation = 'east'
    else if (wall.dir.x === -1) orientation = 'west'
    else if (wall.dir.y === 1) orientation = 'south'
    else if (wall.dir.y === -1) orientation = 'north'

    selected.push({
      x: candidate.x,
      y: candidate.y,
      wallX: wall.x,
      wallY: wall.y,
      orientation,
      location: candidate.location,
    })
    return true
  }

  let selectedCorridorLights = 0
  for (const candidate of corridorCandidates) {
    if (selectedCorridorLights >= corridorTarget) break
    if (trySelect(candidate)) selectedCorridorLights++
  }

  const generalCandidates = shuffle(
    [
      ...corridorCandidates.filter((candidate) => (
        !selected.some((light) => light.x === candidate.x && light.y === candidate.y)
      )),
      ...remainingCandidates,
    ],
    rand,
  )
  for (const candidate of generalCandidates) {
    if (selected.length >= targetCount) break
    trySelect(candidate)
  }

  return selected
}

function resolveNodeSizes(spec, rand) {
  if (spec.nodeSizes?.length) return [...spec.nodeSizes]

  const [min, max] = spec.nodeCount ?? [1, 1]
  const count = randomInt(rand, min, max)
  const sizes = [...(spec.fixedNodeSizes ?? [])]
  while (sizes.length < count) sizes.push(spec.fillNodeSize ?? 'small')
  return sizes
}

function assignRoles(count, resourceCap, recipeFragments, rand) {
  if (count === 1) return ['agora']
  if (resourceCap > 0 && count === 3) return ['vein', 'vein', 'vein']

  const required = count >= 6
    ? ['vein', 'den', 'relic']
    : resourceCap > 0
      ? ['vein', 'mixed', ...(recipeFragments > 0 ? ['relic'] : [])]
      : ['agora']
  const pool = ['mixed', 'agora', 'vein', 'den']
  const roles = [...required]

  while (roles.length < count) roles.push(pool[Math.floor(rand() * pool.length)])
  return shuffle(roles, rand)
}

function hasEdge(edges, a, b) {
  return edges.some((edge) => (
    (edge.a === a && edge.b === b) || (edge.a === b && edge.b === a)
  ))
}

function corridorLengthRange(nodeA, nodeB) {
  const largestSize = nodeA.radius >= nodeB.radius ? nodeA.size : nodeB.size
  const base = CORRIDOR_BASE_LENGTH[largestSize] ?? CORRIDOR_BASE_LENGTH.small
  return { min: base - 5, max: base + 5 }
}

function randomCorridorLength(nodeA, nodeB, rand) {
  const { min, max } = corridorLengthRange(nodeA, nodeB)
  return randomInt(rand, min, max)
}

function borderGap(nodeA, nodeB) {
  return Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y) - nodeA.radius - nodeB.radius
}

function createGraph(spec, rand) {
  const traversalSizes = resolveNodeSizes(spec, rand)
  const roles = assignRoles(
    traversalSizes.length,
    spec.resourceCap ?? 0,
    normalizeFragmentSlots(spec).length,
    rand,
  )
  const nodes = [
    { id: 0, size: 'small', radius: RADII.small, role: 'entry', x: 0, y: 0 },
    ...traversalSizes.map((size, index) => ({
      id: index + 1,
      size,
      radius: RADII[size] ?? RADII.small,
      role: roles[index],
      x: 0,
      y: 0,
    })),
  ]
  const edges = []
  const degree = new Array(nodes.length).fill(0)

  // Árbol de expansión: cada nuevo nodo enlaza con uno ya colocado.
  for (let child = 1; child < nodes.length; child++) {
    let parents = []
    for (let parent = 0; parent < child; parent++) {
      if (degree[parent] < 3) parents.push(parent)
    }
    if (!parents.length) {
      const minDegree = Math.min(...degree.slice(0, child))
      parents = degree
        .slice(0, child)
        .map((value, index) => ({ value, index }))
        .filter(({ value }) => value === minDegree)
        .map(({ index }) => index)
    }

    const parent = parents[Math.floor(rand() * parents.length)]
    edges.push({
      a: parent,
      b: child,
      length: randomCorridorLength(nodes[parent], nodes[child], rand),
      width: nodes[parent].size === 'large' || nodes[child].size === 'large' ? 5 : 3,
      horizontalFirst: rand() < 0.5,
      tree: true,
    })
    degree[parent]++
    degree[child]++
  }

  const [cycleMin, cycleMax] = spec.extraCycles ?? [0, 0]
  const targetCycles = randomInt(rand, cycleMin, cycleMax)
  return { nodes, edges, cycles: 0, targetCycles, proximityEdges: 0 }
}

function overlapsAny(graph, node, x, y, placed) {
  return placed.some((other) => {
    const edge = graph.edges.find((candidate) => (
      (candidate.a === node.id && candidate.b === other.id)
      || (candidate.b === node.id && candidate.a === other.id)
    ))
    const involvesLarge = node.size === 'large' || other.size === 'large'
    const involvesMedium = node.size === 'medium' || other.size === 'medium'
    const margin = edge?.length ?? (involvesLarge ? 5 : involvesMedium ? 4 : 3)
    const minDistance = node.radius + other.radius + margin
    return ((x - other.x) ** 2 + (y - other.y) ** 2) < minDistance ** 2
  })
}

function boundingArea(nodes) {
  const minX = Math.min(...nodes.map((node) => node.x - node.radius))
  const maxX = Math.max(...nodes.map((node) => node.x + node.radius))
  const minY = Math.min(...nodes.map((node) => node.y - node.radius))
  const maxY = Math.max(...nodes.map((node) => node.y + node.radius))
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  return width ** 2 + height ** 2
}

function placeGraph(graph, rand) {
  const placed = [graph.nodes[0]]

  for (let id = 1; id < graph.nodes.length; id++) {
    const node = graph.nodes[id]
    const edge = graph.edges.find((candidate) => candidate.tree && candidate.b === id)
    const parent = graph.nodes[edge.a]
    const directions = shuffle([...DIRECTIONS], rand)
    let best = null

    for (const direction of directions) {
      for (const lateral of shuffle([-8, -4, 0, 4, 8], rand)) {
        const distance = parent.radius + node.radius + edge.length
        const x = parent.x + direction.x * distance - direction.y * lateral
        const y = parent.y + direction.y * distance + direction.x * lateral
        if (overlapsAny(graph, node, x, y, placed)) continue

        const candidate = { x, y }
        const area = boundingArea([...placed, { ...node, ...candidate }])
        if (!best || area < best.area) best = { ...candidate, area }
      }
    }

    if (!best) {
      const distance = parent.radius + node.radius + edge.length
      for (let step = 0; step < 32; step++) {
        const angle = (Math.PI * 2 * step) / 32
        const x = parent.x + Math.round(Math.cos(angle) * distance)
        const y = parent.y + Math.round(Math.sin(angle) * distance)
        if (overlapsAny(graph, node, x, y, placed)) continue
        const area = boundingArea([...placed, { ...node, x, y }])
        if (!best || area < best.area) best = { x, y, area }
      }
    }

    if (!best) {
      for (let radius = 40; radius <= 360 && !best; radius += 4) {
        for (let x = -radius; x <= radius; x += 4) {
          for (const y of [-radius, radius]) {
            if (overlapsAny(graph, node, x, y, placed)) continue
            const area = boundingArea([...placed, { ...node, x, y }])
            if (!best || area < best.area) best = { x, y, area }
          }
        }
        for (let y = -radius + 4; y < radius; y += 4) {
          for (const x of [-radius, radius]) {
            if (overlapsAny(graph, node, x, y, placed)) continue
            const area = boundingArea([...placed, { ...node, x, y }])
            if (!best || area < best.area) best = { x, y, area }
          }
        }
      }
    }
    if (!best) throw new Error(`No se pudo colocar el nodo procedural ${node.id}`)
    node.x = best.x
    node.y = best.y
    placed.push(node)
  }
}

function addCycles(graph, rand) {
  const degree = new Array(graph.nodes.length).fill(0)
  for (const edge of graph.edges) {
    degree[edge.a]++
    degree[edge.b]++
  }

  const candidates = []
  for (let a = 0; a < graph.nodes.length; a++) {
    for (let b = a + 1; b < graph.nodes.length; b++) {
      if (degree[a] >= 3 || degree[b] >= 3 || hasEdge(graph.edges, a, b)) continue
      const nodeA = graph.nodes[a]
      const nodeB = graph.nodes[b]
      const gap = borderGap(nodeA, nodeB)
      const { min, max } = corridorLengthRange(nodeA, nodeB)
      if (gap < min || gap > max) continue
      candidates.push({ a, b, gap })
    }
  }

  shuffle(candidates, rand)
  for (const candidate of candidates) {
    if (graph.cycles >= graph.targetCycles) break
    if (degree[candidate.a] >= 3 || degree[candidate.b] >= 3) continue
    const nodeA = graph.nodes[candidate.a]
    const nodeB = graph.nodes[candidate.b]
    graph.edges.push({
      a: candidate.a,
      b: candidate.b,
      length: Math.round(candidate.gap),
      width: nodeA.size === 'large' || nodeB.size === 'large' ? 5 : 3,
      horizontalFirst: rand() < 0.5,
      tree: false,
    })
    degree[candidate.a]++
    degree[candidate.b]++
    graph.cycles++
  }
}

/** Conecta todo par de nodos con separación entre bordes ≤ PROXIMITY_GAP. */
function addProximityEdges(graph, rand) {
  for (let a = 0; a < graph.nodes.length; a++) {
    for (let b = a + 1; b < graph.nodes.length; b++) {
      if (hasEdge(graph.edges, a, b)) continue
      const nodeA = graph.nodes[a]
      const nodeB = graph.nodes[b]
      const gap = borderGap(nodeA, nodeB)
      if (gap > PROXIMITY_GAP || gap < 0) continue
      graph.edges.push({
        a,
        b,
        length: Math.max(1, Math.round(gap)),
        width: nodeA.size === 'large' || nodeB.size === 'large' ? 5 : 3,
        horizontalFirst: rand() < 0.5,
        tree: false,
        proximity: true,
      })
      graph.proximityEdges++
    }
  }
}

function carveCircle(mask, roomCells, node) {
  const cells = []
  for (let y = node.y - node.radius; y <= node.y + node.radius; y++) {
    for (let x = node.x - node.radius; x <= node.x + node.radius; x++) {
      if ((x - node.x) ** 2 + (y - node.y) ** 2 > node.radius ** 2) continue
      mask.add(key(x, y))
      cells.push({ x, y })
    }
  }
  roomCells.set(node.id, cells)
}

function carveBand(mask, reserved, corridorCells, from, to, width) {
  const half = Math.floor(width / 2)
  if (from.y === to.y) {
    const [start, end] = from.x <= to.x ? [from.x, to.x] : [to.x, from.x]
    for (let x = start; x <= end; x++) {
      for (let offset = -half; offset <= half; offset++) {
        const cellKey = key(x, from.y + offset)
        mask.add(cellKey)
        corridorCells.add(cellKey)
        if (offset === 0) reserved.add(cellKey)
      }
    }
  } else {
    const [start, end] = from.y <= to.y ? [from.y, to.y] : [to.y, from.y]
    for (let y = start; y <= end; y++) {
      for (let offset = -half; offset <= half; offset++) {
        const cellKey = key(from.x + offset, y)
        mask.add(cellKey)
        corridorCells.add(cellKey)
        if (offset === 0) reserved.add(cellKey)
      }
    }
  }
}

function carveCorridor(mask, reserved, corridorCells, a, b, edge) {
  const corner = edge.horizontalFirst
    ? { x: b.x, y: a.y }
    : { x: a.x, y: b.y }
  carveBand(mask, reserved, corridorCells, a, corner, edge.width)
  carveBand(mask, reserved, corridorCells, corner, b, edge.width)
}

function reserveRoomCross(reserved, node) {
  for (let delta = -node.radius; delta <= node.radius; delta++) {
    reserved.add(key(node.x + delta, node.y))
    reserved.add(key(node.x, node.y + delta))
  }
}

function farthestNode(graph, start) {
  const distances = new Array(graph.nodes.length).fill(-1)
  distances[start] = 0
  const queue = [start]
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]
    for (const edge of graph.edges) {
      const next = edge.a === current ? edge.b : edge.b === current ? edge.a : -1
      if (next < 0 || distances[next] >= 0) continue
      distances[next] = distances[current] + 1
      queue.push(next)
    }
  }

  let farthest = 1
  for (let id = 2; id < distances.length; id++) {
    if (distances[id] > distances[farthest]) farthest = id
  }
  return farthest
}

function collectCorridorMouths(graph, roomCells, corridorCells) {
  const mouths = new Map(graph.nodes.map((node) => [node.id, new Set()]))
  const roomKeys = new Map(
    [...roomCells].map(([nodeId, cells]) => [
      nodeId,
      new Set(cells.map((cell) => key(cell.x, cell.y))),
    ]),
  )

  for (const [edgeId, cells] of corridorCells) {
    const edge = graph.edges[edgeId]
    for (const nodeId of [edge.a, edge.b]) {
      const inRoom = roomKeys.get(nodeId) ?? new Set()
      for (const cellKey of cells) {
        if (!inRoom.has(cellKey)) continue
        const { x, y } = parseKey(cellKey)
        // Boca = casilla de cámara que toca un tile de pasillo fuera de la cámara.
        const exitsRoom = DIRECTIONS.some((direction) => {
          const outside = key(x + direction.x, y + direction.y)
          return cells.has(outside) && !inRoom.has(outside)
        })
        if (exitsRoom) mouths.get(nodeId).add(cellKey)
      }
    }
  }
  return mouths
}

function expandForbidden(mouths, radius = 1) {
  const forbidden = new Set(mouths)
  for (const cellKey of mouths) {
    const { x, y } = parseKey(cellKey)
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue
        forbidden.add(key(x + dx, y + dy))
      }
    }
  }
  return forbidden
}

function doorSpan(center, orientation) {
  return [-1, 0, 1].map((offset) => (
    orientation === 'north' || orientation === 'south'
      ? { x: center.x + offset, y: center.y }
      : { x: center.x, y: center.y + offset }
  ))
}

function inwardVector(orientation) {
  switch (orientation) {
    case 'north': return { x: 0, y: 1 }
    case 'south': return { x: 0, y: -1 }
    case 'west': return { x: 1, y: 0 }
    case 'east': return { x: -1, y: 0 }
    default: return { x: 0, y: 0 }
  }
}

function offsetTiles(tiles, vector, amount) {
  return tiles.map((tile) => ({
    x: tile.x + vector.x * amount,
    y: tile.y + vector.y * amount,
  }))
}

function configureDoorGeometry(door) {
  const tiles = doorSpan(door.center, door.orientation)
  const inward = inwardVector(door.orientation)
  return {
    ...door,
    tiles,
    trigger: { ...door.center },
    triggerTiles: [{ ...door.center }],
    sideTiles: [tiles[0], tiles[2]],
    backingTiles: offsetTiles(tiles, inward, -1),
    frontTiles: offsetTiles(tiles, inward, 1),
  }
}

function doorCandidates(node, mask) {
  const candidates = []
  const r = node.radius
  const sides = [
    { orientation: 'north', centers: Array.from({ length: r * 2 - 1 }, (_, i) => ({
      x: node.x - r + 1 + i,
      y: node.y - r,
    })) },
    { orientation: 'south', centers: Array.from({ length: r * 2 - 1 }, (_, i) => ({
      x: node.x - r + 1 + i,
      y: node.y + r,
    })) },
    { orientation: 'west', centers: Array.from({ length: r * 2 - 1 }, (_, i) => ({
      x: node.x - r,
      y: node.y - r + 1 + i,
    })) },
    { orientation: 'east', centers: Array.from({ length: r * 2 - 1 }, (_, i) => ({
      x: node.x + r,
      y: node.y - r + 1 + i,
    })) },
  ]

  for (const side of sides) {
    for (const center of side.centers) {
      const tiles = doorSpan(center, side.orientation)
      if (!tiles.every((tile) => mask.has(key(tile.x, tile.y)))) continue
      candidates.push({
        orientation: side.orientation,
        center,
        tiles,
        width: 3,
      })
    }
  }
  return candidates
}

function scoreDoorAwayFromMouths(candidate, forbidden) {
  if (candidate.tiles.some((tile) => forbidden.has(key(tile.x, tile.y)))) return -1
  if (!forbidden.size) return 1000
  let minDistance = Infinity
  for (const tile of candidate.tiles) {
    for (const cellKey of forbidden) {
      const mouth = parseKey(cellKey)
      const distance = Math.abs(tile.x - mouth.x) + Math.abs(tile.y - mouth.y)
      if (distance < minDistance) minDistance = distance
    }
  }
  return minDistance
}

function sideOfPoint(node, point) {
  const dx = point.x - node.x
  const dy = point.y - node.y
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'east' : 'west'
  return dy >= 0 ? 'south' : 'north'
}

function createDoorAwayFromMouths(node, mouths, kind, mask) {
  const mouthSides = { north: 0, south: 0, east: 0, west: 0 }
  for (const cellKey of mouths) {
    mouthSides[sideOfPoint(node, parseKey(cellKey))]++
  }

  const sideOrder = Object.entries(mouthSides)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(([side]) => side)

  const forbidden = expandForbidden(mouths, 1)
  const candidates = doorCandidates(node, mask)
    .filter((candidate) => sideOrder.includes(candidate.orientation))
    .sort((a, b) => {
      const sideDiff = sideOrder.indexOf(a.orientation) - sideOrder.indexOf(b.orientation)
      if (sideDiff !== 0) return sideDiff
      return scoreDoorAwayFromMouths(b, forbidden) - scoreDoorAwayFromMouths(a, forbidden)
    })

  for (const candidate of candidates) {
    if (scoreDoorAwayFromMouths(candidate, forbidden) >= 2) {
      return {
        kind,
        orientation: candidate.orientation,
        width: 3,
        center: candidate.center,
        tiles: candidate.tiles,
      }
    }
  }

  // Nicho exterior: empuja la puerta fuera del círculo en el lado más libre.
  // Si ese lado aún tiene bocas, se usa radio+2 para no quedar adyacente.
  const orientation = sideOrder[0]
  const outward = {
    north: { x: 0, y: -1 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 },
    east: { x: 1, y: 0 },
  }[orientation]
  const push = mouthSides[orientation] === 0 ? 1 : 2
  const center = {
    x: node.x + outward.x * (node.radius + push),
    y: node.y + outward.y * (node.radius + push),
  }
  const tiles = doorSpan(center, orientation)
  for (const tile of tiles) mask.add(key(tile.x, tile.y))
  for (let depth = 1; depth <= push; depth++) {
    for (const tile of tiles) {
      mask.add(key(tile.x - outward.x * depth, tile.y - outward.y * depth))
    }
  }
  return { kind, orientation, width: 3, center, tiles }
}

function hashNoise(x, y, seed) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295
}

function smoothstep(value) {
  return value * value * (3 - 2 * value)
}

function valueNoise(x, y, scale, seed) {
  const sx = x / scale
  const sy = y / scale
  const x0 = Math.floor(sx)
  const y0 = Math.floor(sy)
  const tx = smoothstep(sx - x0)
  const ty = smoothstep(sy - y0)
  const top = hashNoise(x0, y0, seed) * (1 - tx) + hashNoise(x0 + 1, y0, seed) * tx
  const bottom = hashNoise(x0, y0 + 1, seed) * (1 - tx) + hashNoise(x0 + 1, y0 + 1, seed) * tx
  return top * (1 - ty) + bottom * ty
}

function fractalNoise(x, y, scale, seed) {
  let total = 0
  let amplitude = 0.57
  let normalization = 0
  for (let octave = 0; octave < 3; octave++) {
    total += valueNoise(x, y, Math.max(1, scale / (2 ** octave)), seed + octave * 1013) * amplitude
    normalization += amplitude
    amplitude *= 0.5
  }
  return total / normalization
}

function floodReachable(grid, start, { destructiblesPassable = false } = {}) {
  const visited = new Set()
  const queue = [start]
  visited.add(key(start.x, start.y))

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]
    for (const direction of DIRECTIONS) {
      const x = current.x + direction.x
      const y = current.y + direction.y
      const cellKey = key(x, y)
      if (visited.has(cellKey) || !grid.inBounds(x, y)) continue
      const tile = grid.get(x, y)
      const passable = tile === TILE_EMPTY
        || (destructiblesPassable && tile === TILE_DESTRUCTIBLE)
      if (!passable) continue
      visited.add(cellKey)
      queue.push({ x, y })
    }
  }
  return visited
}

function excavateConnection(grid, start, targets, allowed, organicWalls, immutableWalls) {
  const targetKeys = new Set(targets.map((target) => key(target.x, target.y)))
  const startKey = key(start.x, start.y)
  const visited = new Set([startKey])
  const parents = new Map()
  const queue = [start]
  let reached = null

  for (let index = 0; index < queue.length && !reached; index++) {
    const current = queue[index]
    for (const direction of DIRECTIONS) {
      const next = { x: current.x + direction.x, y: current.y + direction.y }
      const nextKey = key(next.x, next.y)
      if (
        visited.has(nextKey)
        || !allowed.has(nextKey)
        || immutableWalls.has(nextKey)
      ) continue
      visited.add(nextKey)
      parents.set(nextKey, key(current.x, current.y))
      if (targetKeys.has(nextKey)) {
        reached = nextKey
        break
      }
      queue.push(next)
    }
  }

  if (!reached) return false
  let currentKey = reached
  while (currentKey !== startKey) {
    const { x, y } = parseKey(currentKey)
    grid.set(x, y, TILE_EMPTY)
    organicWalls.delete(currentKey)
    currentKey = parents.get(currentKey)
  }
  return true
}

function nearestCarvableCell(node, grid) {
  const candidates = [
    { x: node.x, y: node.y },
    ...DIRECTIONS.map((direction) => ({
      x: node.x + direction.x,
      y: node.y + direction.y,
    })),
  ]
  return candidates.find((cell) => (
    grid.inBounds(cell.x, cell.y) && grid.get(cell.x, cell.y) !== null
  ))
}

/** Impide toda ventana excavada 2×2 sin al menos un indestructible. */
function enforceOrganicCoverage(
  grid,
  carvedMask,
  protectedCells,
  mandatoryOpen,
  connectivityStart,
  connectivityTargets,
  seed,
  organicWalls,
) {
  let changed = true
  let iterations = 0
  while (changed && iterations < 64) {
    changed = false
    iterations++
    for (const cellKey of carvedMask) {
      const { x, y } = parseKey(cellKey)
      let allCarved = true
      let hasWall = false
      for (let oy = 0; oy < 2 && allCarved; oy++) {
        for (let ox = 0; ox < 2; ox++) {
          const windowKey = key(x + ox, y + oy)
          if (!carvedMask.has(windowKey)) {
            allCarved = false
            break
          }
          if (grid.get(x + ox, y + oy) === TILE_WALL) hasWall = true
        }
      }
      if (!allCarved || hasWall) continue

      const candidates = []
      for (let oy = 0; oy < 2; oy++) {
        for (let ox = 0; ox < 2; ox++) {
          const cx = x + ox
          const cy = y + oy
          const candidateKey = key(cx, cy)
          if (protectedCells.has(candidateKey) || mandatoryOpen.has(candidateKey)) continue
          const score = fractalNoise(cx, cy, 6, seed + 4243)
          candidates.push({ x: cx, y: cy, score, key: candidateKey, protected: false })
        }
      }
      // Si dos esqueletos se solapan, sacrifica la celda protegida menos ruidosa.
      if (!candidates.length) {
        for (let oy = 0; oy < 2; oy++) {
          for (let ox = 0; ox < 2; ox++) {
            const cx = x + ox
            const cy = y + oy
            const candidateKey = key(cx, cy)
            if (mandatoryOpen.has(candidateKey)) continue
            const score = fractalNoise(cx, cy, 6, seed + 4243)
            candidates.push({ x: cx, y: cy, score, key: candidateKey, protected: true })
          }
        }
      }
      candidates.sort((a, b) => b.score - a.score)
      for (const candidate of candidates) {
        grid.set(candidate.x, candidate.y, TILE_WALL)
        // Fuera del esqueleto, colocar muro no puede cortar sus rutas.
        // Solo las excepciones sobre esqueletos solapados requieren flood fill.
        let remainsConnected = true
        if (candidate.protected) {
          const reachable = floodReachable(grid, connectivityStart)
          remainsConnected = connectivityTargets.every((target) => (
            reachable.has(key(target.x, target.y))
          ))
        }
        if (remainsConnected) {
          if (candidate.protected) protectedCells.delete(candidate.key)
          organicWalls.add(candidate.key)
          changed = true
          break
        }
        grid.set(candidate.x, candidate.y, TILE_EMPTY)
      }
    }
  }
}

function hasOrganicCoverageViolation(grid, carvedMask) {
  for (const cellKey of carvedMask) {
    const { x, y } = parseKey(cellKey)
    const window = [
      { x, y },
      { x: x + 1, y },
      { x, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ]
    if (!window.every((cell) => carvedMask.has(key(cell.x, cell.y)))) continue
    if (window.every((cell) => grid.get(cell.x, cell.y) !== TILE_WALL)) return true
  }
  return false
}

function applyOrganicNoise(grid, roomCells, protectedCells, seed, organicWalls) {
  for (const [nodeId, cells] of roomCells) {
    const scale = NOISE_SCALE[
      [...cells].length > 600 ? 'large' : [...cells].length > 200 ? 'medium' : 'small'
    ]
    for (const cell of cells) {
      const cellKey = key(cell.x, cell.y)
      if (grid.get(cell.x, cell.y) !== TILE_EMPTY || protectedCells.has(cellKey)) continue
      if (fractalNoise(cell.x, cell.y, scale, seed + Number(nodeId) * 7919) > 0.62) {
        grid.set(cell.x, cell.y, TILE_WALL)
        organicWalls.add(cellKey)
      }
    }
  }
}

function shiftPoint(point, offsetX, offsetY) {
  return { x: point.x + offsetX, y: point.y + offsetY }
}

function shiftDoor(door, offsetX, offsetY) {
  return {
    ...door,
    center: shiftPoint(door.center, offsetX, offsetY),
    tiles: door.tiles.map((tile) => shiftPoint(tile, offsetX, offsetY)),
    trigger: shiftPoint(door.trigger, offsetX, offsetY),
    triggerTiles: door.triggerTiles.map((tile) => shiftPoint(tile, offsetX, offsetY)),
    sideTiles: door.sideTiles.map((tile) => shiftPoint(tile, offsetX, offsetY)),
    backingTiles: door.backingTiles.map((tile) => shiftPoint(tile, offsetX, offsetY)),
    frontTiles: door.frontTiles.map((tile) => shiftPoint(tile, offsetX, offsetY)),
  }
}

function candidateCells(grid, cells, excluded) {
  return cells.filter(({ x, y }) => (
    grid.get(x, y) === TILE_EMPTY && !excluded.has(key(x, y))
  ))
}

function resourceCandidateCells(grid, cells, excluded) {
  return cells.filter(({ x, y }) => {
    const tile = grid.get(x, y)
    return (
      (tile === TILE_EMPTY || tile === TILE_DESTRUCTIBLE)
      && !excluded.has(key(x, y))
    )
  })
}

function pointsFromKeys(keys) {
  return [...keys].map((cellKey) => parseKey(cellKey))
}

function placeRecipeFragmentsOnWalls(
  world,
  plan,
  graph,
  roomCells,
  organicWalls,
  forcedDoorWalls,
  carvedMask,
  rand,
) {
  world.recipeFragmentSpawns = []
  if (!plan?.length) return

  const reachable = floodReachable(
    world.grid,
    world.playerSpawn,
    { destructiblesPassable: true },
  )
  const takenWalls = new Set()
  const doorWalls = new Set(forcedDoorWalls ?? [])
  for (const door of [world.entryDoor, world.exitDoor]) {
    for (const tile of [
      ...(door.tiles ?? []),
      ...(door.sideTiles ?? []),
      ...(door.backingTiles ?? []),
    ]) {
      doorWalls.add(key(tile.x, tile.y))
    }
  }

  const nodePriority = [...graph.nodes].sort((a, b) => {
    const roleScore = (role) => (
      role === 'relic' ? 0 : role === 'mixed' ? 1 : role === 'vein' ? 2 : 3
    )
    const sizeScore = (size) => (
      size === 'large' ? 0 : size === 'medium' ? 1 : 2
    )
    return roleScore(a.role) - roleScore(b.role)
      || sizeScore(a.size) - sizeScore(b.size)
      || a.id - b.id
  })

  function collectCandidates(preferLarge) {
    const candidates = []
    for (const node of nodePriority) {
      if (preferLarge && node.size !== 'large' && node.size !== 'medium') continue
      for (const cell of roomCells.get(node.id) ?? []) {
        for (const dir of DIRECTIONS) {
          const wx = cell.x + dir.x
          const wy = cell.y + dir.y
          const wallKey = key(wx, wy)
          if (takenWalls.has(wallKey) || doorWalls.has(wallKey)) continue
          if (!organicWalls.has(wallKey) && !carvedMask.has(wallKey)) continue
          if (world.grid.get(wx, wy) !== TILE_WALL) continue

          const interacts = DIRECTIONS
            .map((d) => ({ x: wx + d.x, y: wy + d.y }))
            .filter((tile) => (
              world.grid.inBounds(tile.x, tile.y)
              && world.grid.get(tile.x, tile.y) !== TILE_WALL
              && reachable.has(key(tile.x, tile.y))
            ))
          if (!interacts.length) continue
          candidates.push({
            x: wx,
            y: wy,
            nodeId: node.id,
            interacts,
          })
        }
      }
    }
    return shuffle(candidates, rand)
  }

  for (const assignment of plan) {
    let candidates = assignment.kind === 'specialized'
      ? collectCandidates(true)
      : collectCandidates(false)
    if (!candidates.length) candidates = collectCandidates(false)
    const chosen = candidates.find((candidate) => !takenWalls.has(key(candidate.x, candidate.y)))
    if (!chosen) continue

    takenWalls.add(key(chosen.x, chosen.y))
    const interact = chosen.interacts[Math.floor(rand() * chosen.interacts.length)]
    world.recipeFragmentSpawns.push({
      x: chosen.x,
      y: chosen.y,
      nodeId: chosen.nodeId,
      rank: assignment.rank,
      kind: assignment.kind,
      upgradeId: assignment.upgradeId ?? null,
      interact,
    })
  }
}

function populate(world, spec, graph, roomCells, corridorCells, rand, layout = {}) {
  const excluded = new Set()
  excluded.add(key(world.playerSpawn.x, world.playerSpawn.y))
  for (const door of [world.entryDoor, world.exitDoor]) {
    for (const tile of [...door.tiles, ...door.frontTiles]) {
      excluded.add(key(tile.x, tile.y))
    }
  }
  const roomCellKeys = new Set(
    [...roomCells.values()].flatMap((cells) => cells.map((cell) => key(cell.x, cell.y))),
  )
  const pureCorridorCells = new Map(
    [...corridorCells].map(([edgeId, cells]) => [
      edgeId,
      pointsFromKeys(cells).filter((cell) => !roomCellKeys.has(key(cell.x, cell.y))),
    ]),
  )

  // Reservar tabletas antes de densificar destructibles/recursos.
  placePuzzleTablets(world, spec, graph, roomCells, excluded, rand)

  for (const node of graph.nodes) {
    if (node.role === 'entry') continue
    const density = ROLE_DESTRUCTIBLE_DENSITY[node.role] ?? 0.2
    for (const cell of roomCells.get(node.id) ?? []) {
      if (world.grid.get(cell.x, cell.y) !== TILE_EMPTY) continue
      if (excluded.has(key(cell.x, cell.y))) continue
      if (rand() < density) world.grid.set(cell.x, cell.y, TILE_DESTRUCTIBLE)
    }
  }

  for (const cells of pureCorridorCells.values()) {
    for (const cell of cells) {
      if (world.grid.get(cell.x, cell.y) !== TILE_EMPTY) continue
      if (excluded.has(key(cell.x, cell.y))) continue
      if (rand() < CORRIDOR_DESTRUCTIBLE_DENSITY) {
        world.grid.set(cell.x, cell.y, TILE_DESTRUCTIBLE)
      }
    }
  }

  const priorityNodes = [
    ...graph.nodes.filter((node) => node.role === 'vein'),
    ...graph.nodes.filter((node) => node.role === 'mixed'),
    ...graph.nodes.filter((node) => node.role === 'relic'),
    ...graph.nodes.filter((node) => node.role !== 'entry'),
  ]
  const uniquePriorityNodes = priorityNodes.filter((node, index, nodes) => (
    nodes.findIndex((candidate) => candidate.id === node.id) === index
  ))
  const resourceQueues = new Map()
  for (const node of uniquePriorityNodes) {
    const cells = resourceCandidateCells(world.grid, roomCells.get(node.id) ?? [], excluded)
    shuffle(cells, rand)
    resourceQueues.set(node.id, cells)
  }

  world.resourceSpawns = []
  const materials = ['bronze', 'iron', 'crystal']
  const resourceCap = spec.resourceCap ?? 0
  const corridorResourceTarget = (spec.enemies ?? 0) > 0 && resourceCap > 0
    ? Math.max(1, Math.round(resourceCap * 0.1))
    : 0
  const corridorResourceCandidates = []
  for (const [edgeId, cells] of pureCorridorCells) {
    const candidates = resourceCandidateCells(world.grid, cells, excluded)
    shuffle(candidates, rand)
    if (candidates[0]) corridorResourceCandidates.push({ ...candidates[0], edgeId })
  }
  shuffle(corridorResourceCandidates, rand)
  for (
    let index = 0;
    index < corridorResourceTarget && corridorResourceCandidates.length;
    index++
  ) {
    const cell = corridorResourceCandidates.shift()
    excluded.add(key(cell.x, cell.y))
    world.grid.set(cell.x, cell.y, TILE_DESTRUCTIBLE)
    const material = index % 2 === 0 ? 'bronze' : 'iron'
    world.resourceSpawns.push({
      ...cell,
      location: 'corridor',
      material,
      amount: material === 'crystal' ? 2 : 1,
    })
  }

  const nodeResourceTarget = resourceCap - world.resourceSpawns.length
  const tutorialSplit = resourceCap === 9
    && uniquePriorityNodes.length === 3
    && (spec.enemies ?? 0) === 0
  const crystalNode = uniquePriorityNodes.find((node) => node.role === 'vein')
    ?? uniquePriorityNodes[0]
  let roundRobin = 0

  for (let index = 0; index < nodeResourceTarget; index++) {
    let node
    let material
    if (tutorialSplit) {
      node = uniquePriorityNodes[index % uniquePriorityNodes.length]
      material = materials[index % uniquePriorityNodes.length]
    } else if (index < (spec.crystalCap ?? 0)) {
      node = crystalNode
      material = 'crystal'
    } else {
      node = uniquePriorityNodes[roundRobin % uniquePriorityNodes.length]
      roundRobin++
      material = spec.crystalCap === undefined
        ? materials[index % materials.length]
        : materials[index % 2]
    }

    let selectedNode = node
    let queue = resourceQueues.get(selectedNode?.id) ?? []
    let cell = queue.shift()
    if (!cell) {
      selectedNode = uniquePriorityNodes.find((candidate) => (
        (resourceQueues.get(candidate.id)?.length ?? 0) > 0
      ))
      queue = resourceQueues.get(selectedNode?.id) ?? []
      cell = queue.shift()
    }
    if (!cell) continue
    const cellKey = key(cell.x, cell.y)
    if (excluded.has(cellKey)) {
      index--
      continue
    }
    excluded.add(cellKey)
    world.grid.set(cell.x, cell.y, TILE_DESTRUCTIBLE)
    world.resourceSpawns.push({
      ...cell,
      nodeId: selectedNode.id,
      location: 'node',
      material,
      amount: material === 'crystal' ? 2 : 1,
    })
  }

  const combatNodes = [
    ...graph.nodes.filter((node) => node.role === 'den'),
    ...graph.nodes.filter((node) => node.role === 'mixed'),
    ...graph.nodes.filter((node) => node.role !== 'entry'),
  ]
  const enemyCandidates = []
  for (const node of combatNodes) {
    const cells = candidateCells(world.grid, roomCells.get(node.id) ?? [], excluded)
      .filter((cell) => (
        Math.abs(cell.x - world.playerSpawn.x) + Math.abs(cell.y - world.playerSpawn.y) >= 8
      ))
    shuffle(cells, rand)
    for (const cell of cells) enemyCandidates.push({ ...cell, nodeId: node.id })
  }

  world.enemySpawns = []
  const kinds = spec.enemyKinds ?? []
  const corridorEnemyTarget = kinds.includes('golem_basic') && (spec.enemies ?? 0) > 0
    ? Math.min(graph.edges.length, Math.max(1, Math.round((spec.enemies ?? 0) * 0.15)))
    : 0
  const corridorEnemyCandidates = []
  for (const [edgeId, cells] of pureCorridorCells) {
    const candidates = candidateCells(world.grid, cells, excluded)
      .filter((cell) => (
        Math.abs(cell.x - world.playerSpawn.x) + Math.abs(cell.y - world.playerSpawn.y) >= 8
      ))
    shuffle(candidates, rand)
    if (candidates[0]) corridorEnemyCandidates.push({ ...candidates[0], edgeId })
  }
  shuffle(corridorEnemyCandidates, rand)
  for (
    let index = 0;
    index < corridorEnemyTarget && corridorEnemyCandidates.length;
    index++
  ) {
    const cell = corridorEnemyCandidates.shift()
    excluded.add(key(cell.x, cell.y))
    world.enemySpawns.push({
      ...cell,
      location: 'corridor',
      kind: 'golem_basic',
    })
  }

  const nodeEnemyTarget = (spec.enemies ?? 0) - world.enemySpawns.length
  for (let index = 0; index < nodeEnemyTarget && enemyCandidates.length && kinds.length; index++) {
    const cell = enemyCandidates.shift()
    const cellKey = key(cell.x, cell.y)
    if (excluded.has(cellKey)) {
      index--
      continue
    }
    excluded.add(cellKey)
    world.enemySpawns.push({
      ...cell,
      location: 'node',
      kind: kinds[index % kinds.length],
    })
  }

  const fragmentPlan = spec.fragmentPlan
    ?? buildFragmentPlan(spec, spec.fragmentEligibility ?? {})
  placeRecipeFragmentsOnWalls(
    world,
    fragmentPlan,
    graph,
    roomCells,
    layout.organicWalls ?? new Set(),
    layout.forcedDoorWalls ?? new Set(),
    layout.carvedMask ?? new Set(),
    rand,
  )

  placeDartTraps(world, spec, graph, roomCells, pureCorridorCells, excluded, rand)
}

function placePuzzleTablets(world, spec, graph, roomCells, excluded, rand) {
  world.puzzleTablets = []
  world.chest = null
  const puzzle = spec.puzzle
  if (!puzzle?.count) return

  const preferredRoles = ['relic', 'agora', 'mixed']
  const nodes = [
    ...graph.nodes.filter((node) => preferredRoles.includes(node.role)),
    ...graph.nodes.filter((node) => node.role !== 'entry'),
  ].filter((node, index, list) => (
    list.findIndex((candidate) => candidate.id === node.id) === index
  ))

  const reachable = floodReachable(world.grid, world.playerSpawn)
  let chosenCells = null
  let chosenNodeId = null

  for (const node of nodes) {
    const cells = candidateCells(world.grid, roomCells.get(node.id) ?? [], excluded)
      .filter((cell) => reachable.has(key(cell.x, cell.y)))
    if (cells.length < puzzle.count) continue
    shuffle(cells, rand)
    chosenCells = cells.slice(0, puzzle.count)
    chosenNodeId = node.id
    break
  }

  if (!chosenCells) {
    const fallback = []
    for (const node of graph.nodes) {
      if (node.role === 'entry') continue
      for (const cell of candidateCells(world.grid, roomCells.get(node.id) ?? [], excluded)) {
        if (!reachable.has(key(cell.x, cell.y))) continue
        fallback.push({ ...cell, nodeId: node.id })
      }
    }
    shuffle(fallback, rand)
    if (fallback.length < puzzle.count) return
    chosenCells = fallback.slice(0, puzzle.count)
    chosenNodeId = chosenCells[0].nodeId
  }

  // Orden espacial legible: izquierda→derecha, luego arriba→abajo.
  chosenCells.sort((a, b) => a.y - b.y || a.x - b.x)
  for (let order = 0; order < chosenCells.length; order++) {
    const cell = chosenCells[order]
    excluded.add(key(cell.x, cell.y))
    world.puzzleTablets.push({
      x: cell.x,
      y: cell.y,
      order,
      visual: 'off',
      nodeId: chosenNodeId,
    })
  }
  world.puzzleReward = clonePuzzleReward(puzzle.reward)
}

function placeDartTraps(world, spec, graph, roomCells, pureCorridorCells, excluded, rand) {
  world.traps = []
  world.darts = []
  const trapCap = spec.trapCap ?? 0
  if (trapCap <= 0) return

  const reachable = floodReachable(world.grid, world.playerSpawn)
  const plateCandidates = []

  for (const cells of pureCorridorCells.values()) {
    for (const cell of candidateCells(world.grid, cells, excluded)) {
      if (!reachable.has(key(cell.x, cell.y))) continue
      plateCandidates.push({ ...cell, prefer: 0 })
    }
  }
  for (const node of graph.nodes) {
    if (node.role !== 'den' && node.role !== 'mixed') continue
    for (const cell of candidateCells(world.grid, roomCells.get(node.id) ?? [], excluded)) {
      if (!reachable.has(key(cell.x, cell.y))) continue
      plateCandidates.push({ ...cell, prefer: 1, nodeId: node.id })
    }
  }
  shuffle(plateCandidates, rand)
  plateCandidates.sort((a, b) => a.prefer - b.prefer)

  let trapId = 0
  for (const plate of plateCandidates) {
    if (world.traps.length >= trapCap) break
    if (excluded.has(key(plate.x, plate.y))) continue

    const launchers = []
    for (const dir of DIRECTIONS) {
      for (let dist = DART_MIN_DISTANCE; dist <= DART_MIN_DISTANCE + 4; dist++) {
        const lx = plate.x - dir.x * dist
        const ly = plate.y - dir.y * dist
        if (!world.grid.inBounds(lx, ly)) break
        if (world.grid.get(lx, ly) !== TILE_EMPTY) break
        if (excluded.has(key(lx, ly))) break
        if (!reachable.has(key(lx, ly))) break

        let clear = true
        for (let step = 1; step < dist; step++) {
          const mx = plate.x - dir.x * step
          const my = plate.y - dir.y * step
          if (world.grid.get(mx, my) !== TILE_EMPTY) {
            clear = false
            break
          }
        }
        if (!clear) break

        launchers.push({
          launcher: { x: lx, y: ly },
          dir: { x: dir.x, y: dir.y },
          dist,
        })
      }
    }
    if (!launchers.length) continue

    const chosen = launchers[Math.floor(rand() * launchers.length)]
    excluded.add(key(plate.x, plate.y))
    excluded.add(key(chosen.launcher.x, chosen.launcher.y))
    world.traps.push(createTrap({
      id: trapId,
      plate: { x: plate.x, y: plate.y },
      launcher: chosen.launcher,
      dir: chosen.dir,
    }))
    trapId += 1
  }
}

export class LevelGenerator {
  static generate(world, spec = {}) {
    const seed = spec.seed ?? (Math.random() * 0xffffffff) >>> 0
    const rand = mulberry32(seed)
    const graph = createGraph(spec, rand)
    placeGraph(graph, rand)
    addCycles(graph, rand)
    addProximityEdges(graph, rand)

    const mask = new Set()
    const reserved = new Set()
    const corridorCells = new Map()
    const roomCells = new Map()
    for (const node of graph.nodes) {
      carveCircle(mask, roomCells, node)
      reserveRoomCross(reserved, node)
    }

    for (let index = 0; index < graph.edges.length; index++) {
      const edgeCells = new Set()
      corridorCells.set(index, edgeCells)
      const edge = graph.edges[index]
      carveCorridor(mask, reserved, edgeCells, graph.nodes[edge.a], graph.nodes[edge.b], edge)
    }

    const mouths = collectCorridorMouths(graph, roomCells, corridorCells)
    const exitNodeId = farthestNode(graph, 0)
    const unshiftedEntryDoor = configureDoorGeometry(
      createDoorAwayFromMouths(
        graph.nodes[0],
        mouths.get(0) ?? new Set(),
        'entry',
        mask,
      ),
    )
    const unshiftedExitDoor = configureDoorGeometry(
      createDoorAwayFromMouths(
        graph.nodes[exitNodeId],
        mouths.get(exitNodeId) ?? new Set(),
        'exit',
        mask,
      ),
    )
    for (const door of [unshiftedEntryDoor, unshiftedExitDoor]) {
      for (const tile of [...door.backingTiles, ...door.tiles, ...door.frontTiles]) {
        mask.add(key(tile.x, tile.y))
      }
      for (const tile of [...door.triggerTiles, ...door.frontTiles]) {
        reserved.add(key(tile.x, tile.y))
      }
    }

    const allMaskCells = [...mask].map((cellKey) => parseKey(cellKey))
    const minX = Math.min(...allMaskCells.map(({ x }) => x)) - 3
    const maxX = Math.max(...allMaskCells.map(({ x }) => x)) + 3
    const minY = Math.min(...allMaskCells.map(({ y }) => y)) - 3
    const maxY = Math.max(...allMaskCells.map(({ y }) => y)) + 3
    const offsetX = -minX
    const offsetY = -minY
    const cols = maxX - minX + 1
    const rows = maxY - minY + 1
    const grid = new Grid(cols, rows)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) grid.set(x, y, TILE_WALL)
    }

    const shiftedMask = new Set()
    for (const cell of allMaskCells) {
      const shifted = shiftPoint(cell, offsetX, offsetY)
      shiftedMask.add(key(shifted.x, shifted.y))
      grid.set(shifted.x, shifted.y, TILE_EMPTY)
    }

    const protectedCells = new Set()
    for (const cellKey of reserved) {
      const { x, y } = parseKey(cellKey)
      protectedCells.add(key(x + offsetX, y + offsetY))
    }
    for (const [edgeId, cells] of corridorCells) {
      corridorCells.set(
        edgeId,
        new Set([...cells].map((cellKey) => {
          const { x, y } = parseKey(cellKey)
          return key(x + offsetX, y + offsetY)
        })),
      )
    }
    for (const node of graph.nodes) {
      node.x += offsetX
      node.y += offsetY
      roomCells.set(
        node.id,
        (roomCells.get(node.id) ?? []).map((cell) => shiftPoint(cell, offsetX, offsetY)),
      )
    }

    const entryDoor = shiftDoor(unshiftedEntryDoor, offsetX, offsetY)
    const exitDoor = shiftDoor(unshiftedExitDoor, offsetX, offsetY)
    const terrainRegions = new Grid(cols, rows)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        terrainRegions.set(x, y, TERRAIN_REGION.outside)
      }
    }
    for (const cells of corridorCells.values()) {
      for (const cellKey of cells) {
        const { x, y } = parseKey(cellKey)
        terrainRegions.set(x, y, TERRAIN_REGION.corridor)
      }
    }
    // Las cámaras prevalecen visualmente sobre el tramo de pasillo que entra en ellas.
    for (const node of graph.nodes) {
      const region = nodeTerrainRegion(node, exitNodeId)
      for (const cell of roomCells.get(node.id) ?? []) {
        terrainRegions.set(cell.x, cell.y, region)
      }
    }

    const mandatoryOpen = new Set()
    const forcedDoorWalls = new Set()
    const doorBindings = [
      [entryDoor, graph.nodes[0]],
      [exitDoor, graph.nodes[exitNodeId]],
    ]
    for (const [door, node] of doorBindings) {
      const doorRegion = nodeTerrainRegion(node, exitNodeId)
      for (const tile of [...door.backingTiles, ...door.sideTiles]) {
        const tileKey = key(tile.x, tile.y)
        forcedDoorWalls.add(tileKey)
        grid.set(tile.x, tile.y, TILE_WALL)
        terrainRegions.set(tile.x, tile.y, doorRegion)
        shiftedMask.add(tileKey)
      }
      for (const tile of [...door.triggerTiles, ...door.frontTiles]) {
        const tileKey = key(tile.x, tile.y)
        protectedCells.add(tileKey)
        mandatoryOpen.add(tileKey)
        grid.set(tile.x, tile.y, TILE_EMPTY)
        terrainRegions.set(tile.x, tile.y, doorRegion)
        shiftedMask.add(tileKey)
      }
      // Conecta el centro del frente con el eje protegido de la cámara.
      const depthToCenter = Math.abs(door.center.x - node.x)
        + Math.abs(door.center.y - node.y)
      const inward = inwardVector(door.orientation)
      for (let depth = 2; depth <= depthToCenter; depth++) {
        const x = door.center.x + inward.x * depth
        const y = door.center.y + inward.y * depth
        protectedCells.add(key(x, y))
        grid.set(x, y, TILE_EMPTY)
        terrainRegions.set(x, y, doorRegion)
        shiftedMask.add(key(x, y))
      }
    }

    const playerSpawn = { ...entryDoor.trigger }
    protectedCells.add(key(playerSpawn.x, playerSpawn.y))
    mandatoryOpen.add(key(playerSpawn.x, playerSpawn.y))

    const organicWalls = new Set()
    applyOrganicNoise(grid, roomCells, protectedCells, seed, organicWalls)

    for (const tile of mandatoryOpen) {
      const { x, y } = parseKey(tile)
      grid.set(x, y, TILE_EMPTY)
      organicWalls.delete(tile)
    }
    for (const tile of forcedDoorWalls) {
      const { x, y } = parseKey(tile)
      grid.set(x, y, TILE_WALL)
      organicWalls.add(tile)
    }
    grid.set(playerSpawn.x, playerSpawn.y, TILE_EMPTY)
    organicWalls.delete(key(playerSpawn.x, playerSpawn.y))

    const connectivityTargets = [
      ...graph.nodes
        .map((node) => nearestCarvableCell(node, grid))
        .filter(Boolean),
      ...exitDoor.triggerTiles,
    ]
    for (let pass = 0; pass < 64; pass++) {
      for (const target of connectivityTargets) {
        const reachable = floodReachable(grid, playerSpawn)
        if (reachable.has(key(target.x, target.y))) continue
        excavateConnection(
          grid,
          playerSpawn,
          [target],
          shiftedMask,
          organicWalls,
          forcedDoorWalls,
        )
      }

      const reachable = floodReachable(grid, playerSpawn)
      for (const cellKey of shiftedMask) {
        if (reachable.has(cellKey)) continue
        const { x, y } = parseKey(cellKey)
        if (grid.get(x, y) === TILE_EMPTY) {
          grid.set(x, y, TILE_WALL)
          organicWalls.add(cellKey)
        }
      }

      enforceOrganicCoverage(
        grid,
        shiftedMask,
        protectedCells,
        mandatoryOpen,
        playerSpawn,
        connectivityTargets,
        seed + pass,
        organicWalls,
      )
      for (const tileKey of mandatoryOpen) {
        const { x, y } = parseKey(tileKey)
        grid.set(x, y, TILE_EMPTY)
        organicWalls.delete(tileKey)
      }
      for (const tileKey of forcedDoorWalls) {
        const { x, y } = parseKey(tileKey)
        grid.set(x, y, TILE_WALL)
        organicWalls.add(tileKey)
      }

      const finalReachable = floodReachable(grid, playerSpawn)
      const allTargetsReachable = connectivityTargets.every((target) => (
        finalReachable.has(key(target.x, target.y))
      ))
      const noIsolatedEmpties = [...shiftedMask].every((cellKey) => {
        if (finalReachable.has(cellKey)) return true
        const { x, y } = parseKey(cellKey)
        return grid.get(x, y) !== TILE_EMPTY
      })
      if (
        allTargetsReachable
        && noIsolatedEmpties
        && !hasOrganicCoverageViolation(grid, shiftedMask)
      ) break
    }

    // Sellado final: la última pasada de cobertura pudo aislar celdas vacías.
    // Convertirlas en muro evita colocar recursos o enemigos inalcanzables.
    {
      const reachable = floodReachable(grid, playerSpawn)
      for (const cellKey of shiftedMask) {
        if (reachable.has(cellKey)) continue
        const { x, y } = parseKey(cellKey)
        if (grid.get(x, y) === TILE_EMPTY) {
          grid.set(x, y, TILE_WALL)
          organicWalls.add(cellKey)
        }
      }
    }

    const shiftedMouths = collectCorridorMouths(graph, roomCells, corridorCells)

    world.grid = grid
    world.terrainRegions = terrainRegions
    world.playerSpawn = playerSpawn
    world.entryDoor = entryDoor
    world.exitDoor = exitDoor
    world.levelGraph = {
      nodes: graph.nodes.map((node) => ({ ...node })),
      edges: graph.edges.map((edge) => ({ ...edge })),
      cycles: graph.cycles,
      proximityEdges: graph.proximityEdges,
      exitNodeId,
      corridorMouths: Object.fromEntries(
        [...shiftedMouths].map(([nodeId, cells]) => [nodeId, [...cells]]),
      ),
    }
    world.generationDebug = spec.debug
      ? {
        organicWalls,
        carvedMask: shiftedMask,
        corridorCells,
        protectedCells,
      }
      : { organicWallCount: organicWalls.size }
    populate(world, spec, graph, roomCells, corridorCells, rand, {
      organicWalls,
      forcedDoorWalls,
      carvedMask: shiftedMask,
    })
    world.wallLightSpawns = chooseWallLightSpawns(
      grid,
      shiftedMask,
      corridorCells,
      protectedCells,
      rand,
    )
    world.levelTimer = spec.timeLimit ?? null
    world.levelVisualConfig = {
      name: spec.name ?? 'Mina',
      bgMusic: spec.bgMusic ?? 'mov1_n1',
      seed,
      cols,
      rows,
      resourceCap: spec.resourceCap ?? 0,
      trialQuota: spec.trialQuota ?? null,
      timeLimit: spec.timeLimit ?? null,
      emptyTileLight: spec.emptyTileLight ?? 0,
    }
    world.trialTimeUp = false
    world.trialWastedScore = 0
  }
}
