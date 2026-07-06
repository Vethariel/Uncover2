// ai/helpers/bfsHelper.js
import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, TILE_WALL, TILE_DESTRUCTIBLE } from "../../config/constants.js"
import { isSafe, isWalkable } from "./dangerHelper.js"

const ALL_DIRS = [DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT]
const VECTORS  = {
    [DIR_UP]:    { x:  0, y: -1 },
    [DIR_DOWN]:  { x:  0, y:  1 },
    [DIR_LEFT]:  { x: -1, y:  0 },
    [DIR_RIGHT]: { x:  1, y:  0 },
}

// BFS hacia un objetivo evitando tiles peligrosos
export function bfsToTarget(world, startX, startY, goalX, goalY, avoidDanger = true) {

    const queue   = [{ x: startX, y: startY, firstDir: null }]
    const visited = new Set([`${startX},${startY}`])

    while (queue.length > 0) {

        const { x, y, firstDir } = queue.shift()

        for (const dir of ALL_DIRS) {

            const v   = VECTORS[dir]
            const nx  = x + v.x
            const ny  = y + v.y
            const key = `${nx},${ny}`

            if (visited.has(key)) continue
            visited.add(key)

            if (avoidDanger) {
                if (!isSafe(world, nx, ny) && !(nx === goalX && ny === goalY)) continue
            } else {
                if (!isWalkable(world, nx, ny)) continue
            }

            const nextFirstDir = firstDir ?? dir

            if (nx === goalX && ny === goalY) return nextFirstDir

            if (visited.size < 150) queue.push({ x: nx, y: ny, firstDir: nextFirstDir })

        }

    }

    return null

}

// BFS hacia el tile seguro más cercano
export function bfsToSafeTile(world, startX, startY) {

    const queue   = [{ x: startX, y: startY, firstDir: null }]
    const visited = new Set([`${startX},${startY}`])

    while (queue.length > 0) {

        const { x, y, firstDir } = queue.shift()

        for (const dir of ALL_DIRS) {

            const v   = VECTORS[dir]
            const nx  = x + v.x
            const ny  = y + v.y
            const key = `${nx},${ny}`

            if (visited.has(key)) continue
            visited.add(key)

            const tile = world.grid.get(nx, ny)
            if (!isWalkable(world, nx, ny)) continue

            const nextFirstDir = firstDir ?? dir

            // Tile seguro encontrado
            if (isSafe(world, nx, ny)) {
                return { dir: nextFirstDir, tile: { x: nx, y: ny } }
            }

            if (visited.size < 80) queue.push({ x: nx, y: ny, firstDir: nextFirstDir })

        }

    }

    return null

}

// En bfsHelper.js
export function bfsLeafNodes(world, startX, startY, minDist = 1, maxDist = Infinity) {

    const queue   = [{ x: startX, y: startY, dist: 0 }]
    const visited = new Set([`${startX},${startY}`])
    const leaves  = []

    while (queue.length > 0) {

        const { x, y, dist } = queue.shift()

        let isLeaf = true

        for (const dir of ALL_DIRS) {

            const nx  = x + VECTORS[dir].x
            const ny  = y + VECTORS[dir].y
            const key = `${nx},${ny}`

            if (visited.has(key)) continue

            if (!isWalkable(world, nx, ny)) continue

            isLeaf = false

            if (dist + 1 > maxDist) continue

            visited.add(key)
            queue.push({ x: nx, y: ny, dist: dist + 1 })

        }

        if (isLeaf && dist >= minDist) {
            leaves.push({ x, y, dist })
        }

    }

    return leaves

}

export { ALL_DIRS, VECTORS }