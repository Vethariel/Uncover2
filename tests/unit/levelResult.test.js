import { describe, expect, it } from 'vitest'
import { createLevelResult } from '../../src/core/LevelResult.js'
import { createEmptyFragmentBag } from '../../src/config/crafting.js'

describe('createLevelResult', () => {
  it('captura recursos y fragmentos recolectados antes del depósito', () => {
    const fragments = createEmptyFragmentBag()
    fragments.generic = 2
    fragments.specialized.fortune = 1
    fragments.specialized.maxBombs = 2

    const result = createLevelResult(
      {
        runResources: { bronze: 4, iron: 3, crystal: 1 },
        runFragments: fragments,
      },
      4,
      'La Recolección',
    )

    expect(result.levelIndex).toBe(4)
    expect(result.levelName).toBe('La Recolección')
    expect(result.resources).toEqual({ bronze: 4, iron: 3, crystal: 1 })
    expect(result.fragments).toEqual({ generic: 2, specialized: 3 })
    expect(result.totalCollected).toBe(13)
  })

  it('usa ceros si el mundo no tiene inventario', () => {
    const result = createLevelResult({}, 0, 'La Entrada')
    expect(result.resources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(result.fragments).toEqual({ generic: 0, specialized: 0 })
    expect(result.totalCollected).toBe(0)
  })
})
