import { describe, it, expect } from 'vitest'
import { Grid } from '../../src/game/Grid.js'

describe('Grid', () => {
  it('inBounds valida límites', () => {
    const grid = new Grid(3, 2)
    expect(grid.inBounds(0, 0)).toBe(true)
    expect(grid.inBounds(2, 1)).toBe(true)
    expect(grid.inBounds(-1, 0)).toBe(false)
    expect(grid.inBounds(3, 0)).toBe(false)
    expect(grid.inBounds(0, 2)).toBe(false)
  })

  it('get/set solo afectan tiles dentro del grid', () => {
    const grid = new Grid(2, 2)
    grid.set(0, 0, 5)
    grid.set(5, 5, 9)

    expect(grid.get(0, 0)).toBe(5)
    expect(grid.get(5, 5)).toBeNull()
  })
})
