import { Grid } from '../Grid.js'
import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
} from '../../config/constants.js'

const RADII = {
  small: 7,
  medium: 14,
  large: 21,
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

function createGraph(spec, rand) {
  const traversalSizes = resolveNodeSizes(spec, rand)
  const roles = assignRoles(
    traversalSizes.length,
    spec.resourceCap ?? 0,
    spec.recipeFragments ?? 0,
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
  return { nodes, edges, cycles: 0, targetCycles }
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
  // Equivale (salvo una constante) a minimizar la semidiagonal R² del AABB.
  // A diferencia del área, evita soluciones extremadamente largas y estrechas.
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
        for (let extension = 0; extension <= 0; extension += 4) {
          const distance = parent.radius + node.radius + edge.length + extension
          const x = parent.x + direction.x * distance - direction.y * lateral
          const y = parent.y + direction.y * distance + direction.x * lateral
          if (overlapsAny(graph, node, x, y, placed)) continue

          const candidate = { x, y }
          const area = boundingArea([...placed, { ...node, ...candidate }])
          if (!best || area < best.area) best = { ...candidate, area }
          break
        }
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
      // Búsqueda global discreta cuando una arista de ciclo restringe al nodo
      // respecto a más de un vecino ya colocado.
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
      const gap = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y)
        - nodeA.radius - nodeB.radius
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

function doorAwayFromNeighbor(node, neighbor) {
  const dx = neighbor.x - node.x
  const dy = neighbor.y - node.y
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'west' : 'east'
  return dy >= 0 ? 'north' : 'south'
}

function createDoor(node, neighbor, kind) {
  const orientation = doorAwayFromNeighbor(node, neighbor)
  let center = { x: node.x, y: node.y }
  if (orientation === 'north') center.y -= node.radius
  if (orientation === 'south') center.y += node.radius
  if (orientation === 'west') center.x -= node.radius
  if (orientation === 'east') center.x += node.radius

  const tiles = [-1, 0, 1].map((offset) => (
    orientation === 'north' || orientation === 'south'
      ? { x: center.x + offset, y: center.y }
      : { x: center.x, y: center.y + offset }
  ))
  return { kind, orientation, width: 3, center, tiles }
}

function inwardTile(door, amount = 2) {
  const tile = { ...door.center }
  if (door.orientation === 'north') tile.y += amount
  if (door.orientation === 'south') tile.y -= amount
  if (door.orientation === 'west') tile.x += amount
  if (door.orientation === 'east') tile.x -= amount
  return tile
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

function floodReachable(grid, start) {
  const visited = new Set()
  const queue = [start]
  visited.add(key(start.x, start.y))

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]
    for (const direction of DIRECTIONS) {
      const x = current.x + direction.x
      const y = current.y + direction.y
      const cellKey = key(x, y)
      if (visited.has(cellKey) || grid.get(x, y) !== TILE_EMPTY) continue
      visited.add(cellKey)
      queue.push({ x, y })
    }
  }
  return visited
}

function excavateConnection(grid, start, targets, allowed, fixedWalls, extraWalls) {
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
      if (visited.has(nextKey) || !allowed.has(nextKey) || fixedWalls.has(nextKey)) continue
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
    const [x, y] = currentKey.split(',').map(Number)
    grid.set(x, y, TILE_EMPTY)
    extraWalls.delete(currentKey)
    currentKey = parents.get(currentKey)
  }
  return true
}

function nearestCarvableCell(node, grid, fixedWalls) {
  const candidates = [
    { x: node.x, y: node.y },
    ...DIRECTIONS.map((direction) => ({
      x: node.x + direction.x,
      y: node.y + direction.y,
    })),
  ]
  return candidates.find((cell) => (
    grid.inBounds(cell.x, cell.y) && !fixedWalls.has(key(cell.x, cell.y))
  ))
}

function shiftPoint(point, offsetX, offsetY) {
  return { x: point.x + offsetX, y: point.y + offsetY }
}

function shiftDoor(door, offsetX, offsetY) {
  return {
    ...door,
    center: shiftPoint(door.center, offsetX, offsetY),
    tiles: door.tiles.map((tile) => shiftPoint(tile, offsetX, offsetY)),
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
  return [...keys].map((cellKey) => {
    const [x, y] = cellKey.split(',').map(Number)
    return { x, y }
  })
}

function populate(world, spec, graph, roomCells, corridorCells, rand) {
  const excluded = new Set()
  excluded.add(key(world.playerSpawn.x, world.playerSpawn.y))
  for (const tile of world.entryDoor.tiles) excluded.add(key(tile.x, tile.y))
  for (const tile of world.exitDoor.tiles) excluded.add(key(tile.x, tile.y))
  const roomCellKeys = new Set(
    [...roomCells.values()].flatMap((cells) => cells.map((cell) => key(cell.x, cell.y))),
  )
  const pureCorridorCells = new Map(
    [...corridorCells].map(([edgeId, cells]) => [
      edgeId,
      pointsFromKeys(cells).filter((cell) => !roomCellKeys.has(key(cell.x, cell.y))),
    ]),
  )

  // Destructibles por rol de cámara.
  for (const node of graph.nodes) {
    if (node.role === 'entry') continue
    const density = ROLE_DESTRUCTIBLE_DENSITY[node.role] ?? 0.2
    for (const cell of roomCells.get(node.id) ?? []) {
      if (world.grid.get(cell.x, cell.y) !== TILE_EMPTY) continue
      if (excluded.has(key(cell.x, cell.y))) continue
      if (rand() < density) world.grid.set(cell.x, cell.y, TILE_DESTRUCTIBLE)
    }
  }

  // Todo el pasillo puede recibir obstáculos rompibles; la densidad baja evita
  // saturarlo, pero permite que bloqueen el avance como en Bomberman.
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
    world.resourceSpawns.push({
      ...cell,
      location: 'corridor',
      material: index % 2 === 0 ? 'bronze' : 'iron',
      amount: 1,
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
      amount: 1,
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

  world.recipeFragmentSpawns = []
  const relicNodes = graph.nodes.filter((node) => node.role === 'relic')
  const fragmentCount = Math.min(spec.recipeFragments ?? 0, relicNodes.length)
  for (let index = 0; index < fragmentCount; index++) {
    const node = relicNodes[index]
    const cells = candidateCells(world.grid, roomCells.get(node.id) ?? [], excluded)
    if (!cells.length) continue
    const cell = cells[Math.floor(rand() * cells.length)]
    excluded.add(key(cell.x, cell.y))
    world.recipeFragmentSpawns.push({ ...cell, nodeId: node.id, rank: 2 })
  }
}

export class LevelGenerator {
  static generate(world, spec = {}) {
    const seed = spec.seed ?? (Math.random() * 0xffffffff) >>> 0
    const rand = mulberry32(seed)
    const graph = createGraph(spec, rand)
    placeGraph(graph, rand)
    addCycles(graph, rand)

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

    const exitNodeId = farthestNode(graph, 0)
    const entryNeighborId = graph.edges.find((edge) => edge.a === 0 || edge.b === 0)
    const entryNeighbor = graph.nodes[
      entryNeighborId.a === 0 ? entryNeighborId.b : entryNeighborId.a
    ]
    const exitEdge = graph.edges.find((edge) => edge.a === exitNodeId || edge.b === exitNodeId)
    const exitNeighbor = graph.nodes[
      exitEdge.a === exitNodeId ? exitEdge.b : exitEdge.a
    ]
    const unshiftedEntryDoor = createDoor(graph.nodes[0], entryNeighbor, 'entry')
    const unshiftedExitDoor = createDoor(graph.nodes[exitNodeId], exitNeighbor, 'exit')
    for (const tile of [...unshiftedEntryDoor.tiles, ...unshiftedExitDoor.tiles]) {
      mask.add(key(tile.x, tile.y))
      reserved.add(key(tile.x, tile.y))
    }

    const allMaskCells = [...mask].map((cellKey) => {
      const [x, y] = cellKey.split(',').map(Number)
      return { x, y }
    })
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

    const shiftedReserved = new Set()
    for (const cellKey of reserved) {
      const [x, y] = cellKey.split(',').map(Number)
      shiftedReserved.add(key(x + offsetX, y + offsetY))
    }
    for (const [edgeId, cells] of corridorCells) {
      corridorCells.set(
        edgeId,
        new Set([...cells].map((cellKey) => {
          const [x, y] = cellKey.split(',').map(Number)
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
    const doorwayClearance = new Set()
    for (const door of [entryDoor, exitDoor]) {
      for (const tile of door.tiles) {
        for (let depth = 0; depth <= 3; depth++) {
          let x = tile.x
          let y = tile.y
          if (door.orientation === 'north') y += depth
          if (door.orientation === 'south') y -= depth
          if (door.orientation === 'west') x += depth
          if (door.orientation === 'east') x -= depth
          doorwayClearance.add(key(x, y))
          shiftedReserved.add(key(x, y))
          grid.set(x, y, TILE_EMPTY)
        }
      }
    }
    const spawnCandidates = [2, 3, 4].map((amount) => (
      shiftPoint(inwardTile(unshiftedEntryDoor, amount), offsetX, offsetY)
    ))
    for (const candidate of spawnCandidates) shiftedReserved.add(key(candidate.x, candidate.y))

    // Lattice fijo: pilares globales pares dentro de toda la silueta excavada.
    const fixedWalls = new Set()
    for (const cellKey of shiftedMask) {
      const [x, y] = cellKey.split(',').map(Number)
      if (x % 2 === 0 && y % 2 === 0 && !doorwayClearance.has(cellKey)) {
        grid.set(x, y, TILE_WALL)
        fixedWalls.add(cellKey)
      }
    }

    // El ruido indestructible respeta conexiones y ejes de cámara; los
    // destructibles se distribuyen después y sí pueden bloquearlos.
    const extraWalls = new Set()
    for (const node of graph.nodes) {
      const scale = NOISE_SCALE[node.size] ?? NOISE_SCALE.small
      for (const cell of roomCells.get(node.id) ?? []) {
        const cellKey = key(cell.x, cell.y)
        if (grid.get(cell.x, cell.y) !== TILE_EMPTY || shiftedReserved.has(cellKey)) continue
        if (fractalNoise(cell.x, cell.y, scale, seed + node.id * 7919) > 0.62) {
          grid.set(cell.x, cell.y, TILE_WALL)
          extraWalls.add(cellKey)
        }
      }
    }

    // Las puertas se abren después del lattice/ruido: sus tres tiles son transitables.
    for (const tile of [...entryDoor.tiles, ...exitDoor.tiles]) {
      grid.set(tile.x, tile.y, TILE_EMPTY)
      fixedWalls.delete(key(tile.x, tile.y))
      extraWalls.delete(key(tile.x, tile.y))
    }
    const playerSpawn = spawnCandidates.find(({ x, y }) => grid.get(x, y) === TILE_EMPTY)
      ?? spawnCandidates[0]
    grid.set(playerSpawn.x, playerSpawn.y, TILE_EMPTY)

    // Excavación correctiva: conecta cada cámara y la salida sin retirar pilares.
    // Después se llenan los bolsillos restantes.
    const connectivityTargets = [
      ...graph.nodes
        .map((node) => nearestCarvableCell(node, grid, fixedWalls))
        .filter(Boolean),
      ...exitDoor.tiles,
    ]
    for (const target of connectivityTargets) {
      const reachable = floodReachable(grid, playerSpawn)
      if (!reachable.has(key(target.x, target.y))) {
        excavateConnection(
          grid,
          playerSpawn,
          [target],
          shiftedMask,
          fixedWalls,
          extraWalls,
        )
      }
    }

    const reachable = floodReachable(grid, playerSpawn)
    for (const cellKey of shiftedMask) {
      if (reachable.has(cellKey)) continue
      const [x, y] = cellKey.split(',').map(Number)
      if (grid.get(x, y) === TILE_EMPTY) grid.set(x, y, TILE_WALL)
    }

    world.grid = grid
    world.playerSpawn = playerSpawn
    world.entryDoor = entryDoor
    world.exitDoor = exitDoor
    world.levelGraph = {
      nodes: graph.nodes.map((node) => ({ ...node })),
      edges: graph.edges.map((edge) => ({ ...edge })),
      cycles: graph.cycles,
      exitNodeId,
    }
    world.generationDebug = spec.debug
      ? { fixedWalls, extraWalls, carvedMask: shiftedMask, corridorCells }
      : { fixedWallCount: fixedWalls.size, extraWallCount: extraWalls.size }
    populate(world, spec, graph, roomCells, corridorCells, rand)
    world.levelTimer = spec.timeLimit ?? null
    world.levelVisualConfig = {
      name: spec.name ?? 'Mina',
      bgMusic: spec.bgMusic ?? 'world1',
      seed,
      cols,
      rows,
      resourceCap: spec.resourceCap ?? 0,
      timeLimit: spec.timeLimit ?? null,
    }
  }
}
