import { describe, expect, it } from 'vitest'
import {
  MINE_WALL_FRAME,
  Q_NE,
  Q_NW,
  Q_SE,
  Q_SW,
  WALL_E,
  WALL_N,
  WALL_S,
  WALL_W,
  mineWallFrameIndex,
  wallOccludedQuarters,
  wallQuarterLights,
  wallVisionShape,
  isWallFrontFloorInVision,
  isWallFullyEnclosed3x3,
} from '../../src/config/mineWalls.js'
import {
  bilinearQuarterLight,
  displayedLightWithVisionEdge,
  wallFaceWeight,
} from '../../src/config/visionFog.js'

describe('mineWallFrameIndex', () => {
  it('usa esquinas externas según vecinos hacia el bloque', () => {
    expect(mineWallFrameIndex(WALL_E | WALL_S)).toBe(MINE_WALL_FRAME.ul)
    expect(mineWallFrameIndex(WALL_W | WALL_S)).toBe(MINE_WALL_FRAME.ur)
    expect(mineWallFrameIndex(WALL_E | WALL_N)).toBe(MINE_WALL_FRAME.dl)
    expect(mineWallFrameIndex(WALL_W | WALL_N)).toBe(MINE_WALL_FRAME.dr)
  })

  it('mapea aislado, extremos y continuos', () => {
    expect(mineWallFrameIndex(0)).toBe(MINE_WALL_FRAME.isolated)
    expect(mineWallFrameIndex(WALL_N)).toBe(MINE_WALL_FRAME.endD)
    expect(mineWallFrameIndex(WALL_S)).toBe(MINE_WALL_FRAME.endU)
    expect(mineWallFrameIndex(WALL_E)).toBe(MINE_WALL_FRAME.endL)
    expect(mineWallFrameIndex(WALL_W)).toBe(MINE_WALL_FRAME.endR)
    expect(mineWallFrameIndex(WALL_N | WALL_S)).toBe(MINE_WALL_FRAME.ud)
    expect(mineWallFrameIndex(WALL_E | WALL_W)).toBe(MINE_WALL_FRAME.lr)
  })

  it('elige variantes de borde según (x+y)', () => {
    expect(mineWallFrameIndex(WALL_E | WALL_W | WALL_S, 0, 0)).toBe(MINE_WALL_FRAME.u2)
    expect(mineWallFrameIndex(WALL_E | WALL_W | WALL_S, 1, 0)).toBe(MINE_WALL_FRAME.u1)
  })
})

describe('wallOccludedQuarters', () => {
  it('UD oculta la mitad lejana en X', () => {
    const mask = WALL_N | WALL_S
    expect(wallVisionShape(mask)).toBe('ud')
    expect(wallOccludedQuarters(mask, -1, 0).sort()).toEqual([Q_NE, Q_SE])
    expect(wallOccludedQuarters(mask, 1, 0).sort()).toEqual([Q_NW, Q_SW])
  })

  it('esquina UL siempre oculta el cuarto SE', () => {
    const mask = WALL_E | WALL_S
    expect(wallOccludedQuarters(mask, -1, -1)).toContain(Q_SE)
    expect(wallOccludedQuarters(mask, -1, -1)).not.toContain(Q_NW)
  })
})

describe('wallQuarterLights', () => {
  const sample = (w, e, n, s) => (ox, oy) => {
    if (ox === -1 && oy === 0) return w
    if (ox === 1 && oy === 0) return e
    if (ox === 0 && oy === -1) return n
    if (ox === 0 && oy === 1) return s
    return 0
  }

  it('UD: viewer izquierda ilumina NW/SW; derecha NE/SE', () => {
    const mask = WALL_N | WALL_S
    const left = wallQuarterLights(mask, -1, 0, sample(8, 3, 0, 0))
    expect(left[Q_NW]).toBeGreaterThan(6)
    expect(left[Q_SW]).toBeGreaterThan(6)
    expect(left[Q_NE]).toBeLessThan(1)
    expect(left[Q_SE]).toBeLessThan(1)

    const right = wallQuarterLights(mask, 1, 0, sample(8, 3, 0, 0))
    expect(right[Q_NE]).toBeGreaterThan(2)
    expect(right[Q_SE]).toBeGreaterThan(2)
    expect(right[Q_NW]).toBeLessThan(1)
  })

  it('UD en dx≈0 reparte ambos lados (~medio)', () => {
    const mask = WALL_N | WALL_S
    const mid = wallQuarterLights(mask, 0, 0, sample(10, 10, 0, 0))
    expect(mid[Q_NW]).toBeCloseTo(5, 0)
    expect(mid[Q_NE]).toBeCloseTo(5, 0)
  })

  it('esquina UL: SE≈0; desde NO, NW dominante', () => {
    const mask = WALL_E | WALL_S
    expect(wallVisionShape(mask)).toBe('ul')
    const nw = wallQuarterLights(mask, -1, -1, sample(6, 0, 9, 0))
    expect(nw[Q_SE]).toBe(0)
    expect(nw[Q_NW]).toBeGreaterThanOrEqual(nw[Q_NE])
    expect(nw[Q_NW]).toBeGreaterThan(nw[Q_SW])
    expect(nw[Q_NW]).toBe(9)
  })

  it('esquina UL desde solo norte: NE+NW con luz N', () => {
    const mask = WALL_E | WALL_S
    const fromN = wallQuarterLights(mask, 0, -1, sample(0, 0, 8, 0))
    expect(fromN[Q_NW]).toBeGreaterThan(3)
    expect(fromN[Q_NE]).toBeGreaterThan(3)
    expect(fromN[Q_SE]).toBe(0)
  })

  it('fallback: sin piso usable pero muro con luz propia → caras abiertas > 0', () => {
    const mask = WALL_N | WALL_S
    const lights = wallQuarterLights(mask, -1, 0, () => 0, 7)
    expect(lights[Q_NW]).toBeGreaterThan(3)
    expect(lights[Q_SW]).toBeGreaterThan(3)
    expect(lights[Q_NE]).toBeLessThan(1)
  })
})

describe('visionFog helpers', () => {
  it('wallFaceWeight funde en el centro', () => {
    expect(wallFaceWeight(1)).toBe(1)
    expect(wallFaceWeight(-1)).toBe(0)
    expect(wallFaceWeight(0)).toBeCloseTo(0.5, 1)
  })

  it('bilinearQuarterLight interpola entre cuartos', () => {
    const lights = {
      [Q_NW]: 0,
      [Q_NE]: 10,
      [Q_SW]: 0,
      [Q_SE]: 10,
    }
    expect(bilinearQuarterLight(lights, 0, 0.5, Q_NW, Q_NE, Q_SW, Q_SE)).toBe(0)
    expect(bilinearQuarterLight(lights, 1, 0.5, Q_NW, Q_NE, Q_SW, Q_SE)).toBe(10)
    expect(bilinearQuarterLight(lights, 0.5, 0.5, Q_NW, Q_NE, Q_SW, Q_SE)).toBe(5)
  })

  it('displayedLightWithVisionEdge decae en el borde', () => {
    expect(displayedLightWithVisionEdge(10, 0)).toBe(10)
    expect(displayedLightWithVisionEdge(10, 7)).toBe(0)
    const mid = displayedLightWithVisionEdge(10, 6)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(10)
  })
})

describe('isWallFullyEnclosed3x3', () => {
  it('exige los 8 vecinos muro (fuera de mapa cuenta)', () => {
    const solid = {
      inBounds: () => true,
      get: () => 1,
    }
    expect(isWallFullyEnclosed3x3(solid, 5, 5)).toBe(true)

    const openSide = {
      inBounds: () => true,
      get(x, y) {
        if (x === 6 && y === 5) return 0
        return 1
      },
    }
    expect(isWallFullyEnclosed3x3(openSide, 5, 5)).toBe(false)
  })
})

describe('isWallFrontFloorInVision', () => {
  it('acepta luz en levels o discovered, no solo visibleTiles', () => {
    const grid = {
      get(x, y) {
        if (x === 5 && y === 5) return 1
        return 0
      },
    }
    expect(isWallFrontFloorInVision(4, 5, {
      grid,
      visibleTiles: new Set(['4,5']),
      visionX: 4.5,
      visionY: 5.5,
      visionRadius: 7,
    })).toBe(true)
    expect(isWallFrontFloorInVision(4, 5, {
      grid,
      visibleTiles: new Set(),
      levels: new Map([['4,5', 3]]),
      visionX: 4.5,
      visionY: 5.5,
    })).toBe(true)
    expect(isWallFrontFloorInVision(4, 5, {
      grid,
      visibleTiles: new Set(),
      discoveredTiles: new Set(['4,5']),
      visionX: 4.5,
      visionY: 5.5,
    })).toBe(true)
    expect(isWallFrontFloorInVision(4, 5, {
      grid,
      visibleTiles: new Set(),
      discoveredTiles: new Set(),
      levels: new Map(),
      visionX: 4.5,
      visionY: 5.5,
    })).toBe(false)
    expect(isWallFrontFloorInVision(5, 5, {
      grid,
      visibleTiles: new Set(['5,5']),
      visionX: 5.5,
      visionY: 5.5,
    })).toBe(false)
  })
})
