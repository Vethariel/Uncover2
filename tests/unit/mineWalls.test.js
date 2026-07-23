import { describe, expect, it } from 'vitest'
import {
  MINE_WALL_FRAME,
  WALL_E,
  WALL_N,
  WALL_S,
  WALL_W,
  mineWallFrameIndex,
} from '../../src/config/mineWalls.js'

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
