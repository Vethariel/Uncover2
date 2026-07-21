import { describe, it, expect } from 'vitest'
import { getDialogue } from '../../src/config/dialogues.js'
import { getEventBeats } from '../../src/config/narrativeEvents.js'

describe('dialogues.js', () => {
  it('expone inicios de nivel N1–N7', () => {
    for (let i = 0; i < 7; i++) {
      const lines = getDialogue(`level.start.${i}`)
      expect(lines.length).toBeGreaterThan(0)
      expect(lines[0].text.length).toBeGreaterThan(20)
    }
  })

  it('expone descubrimientos principales', () => {
    for (const id of [
      'discovery.destructible',
      'discovery.golem',
      'discovery.spirit',
      'discovery.fragment',
    ]) {
      expect(getDialogue(id).length).toBeGreaterThan(0)
    }
  })

  it('resuelve pools idle con una variante', () => {
    const a = getDialogue('hub.idle.brun')
    const b = getDialogue('hub.idle.brun')
    expect(a.length).toBeGreaterThan(0)
    expect(b.length).toBeGreaterThan(0)
  })

  it('mapea eventos narrativos a beats con diálogo', () => {
    expect(getEventBeats('hub.intro')).toEqual([
      { type: 'dialogue', id: 'hub.intro' },
      { type: 'tutorial', id: 'tut_workshop' },
    ])
    expect(getEventBeats('n7.success')?.[0]?.id).toBe('n7.success')
    expect(getDialogue('n7.fail.first').length).toBeGreaterThan(2)
  })
})
