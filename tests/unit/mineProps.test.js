import { describe, expect, it } from 'vitest'
import {
  MINE_PROP_FRAME,
  genericDestructibleFrame,
  resourceBlockFrame,
} from '../../src/config/mineProps.js'

describe('mineProps', () => {
  it('maps resource materials to block frames', () => {
    expect(resourceBlockFrame('bronze')).toBe(MINE_PROP_FRAME.bronze)
    expect(resourceBlockFrame('iron')).toBe(MINE_PROP_FRAME.iron)
    expect(resourceBlockFrame('crystal')).toBe(MINE_PROP_FRAME.crystal)
    expect(resourceBlockFrame('unknown')).toBe(MINE_PROP_FRAME.destructible1)
  })

  it('picks a stable generic destructible variant from tile coords', () => {
    expect(genericDestructibleFrame(0, 0)).toBe(MINE_PROP_FRAME.destructible1)
    expect(genericDestructibleFrame(1, 0)).toBe(MINE_PROP_FRAME.destructible2)
    expect(genericDestructibleFrame(2, 0)).toBe(MINE_PROP_FRAME.destructible3)
    expect(genericDestructibleFrame(3, 0)).toBe(MINE_PROP_FRAME.destructible1)
  })

  it('reserves frame 8 for the trap launcher tile', () => {
    expect(MINE_PROP_FRAME.launcher).toBe(8)
  })
})
