import { describe, expect, it } from 'vitest'
import { DialogueController } from '../../src/core/DialogueController.js'

describe('DialogueController', () => {
  it('revela texto progresivamente', () => {
    const dialogue = new DialogueController(10)
    dialogue.start([{ speaker: 'A', text: 'Hola mundo' }])

    dialogue.update(0.2)
    expect(dialogue.visibleText).toBe('Ho')
    expect(dialogue.isCurrentComplete).toBe(false)
  })

  it('espacio primero revela y después avanza', () => {
    const dialogue = new DialogueController(10)
    dialogue.start([
      { speaker: 'A', text: 'Primero' },
      { speaker: 'B', text: 'Segundo' },
    ])

    expect(dialogue.advance().type).toBe('revealed')
    expect(dialogue.visibleText).toBe('Primero')
    expect(dialogue.advance().type).toBe('next')
    expect(dialogue.currentEntry.speaker).toBe('B')
    expect(dialogue.visibleText).toBe('')
  })

  it('cierra tras confirmar el último párrafo completo', () => {
    const dialogue = new DialogueController()
    dialogue.start(['Fin'])
    dialogue.advance()

    expect(dialogue.advance().type).toBe('finished')
    expect(dialogue.active).toBe(false)
  })

  it('cuenta caracteres Unicode completos', () => {
    const dialogue = new DialogueController()
    dialogue.start(['A⛰B'])
    dialogue.update(1 / 40)
    expect(dialogue.visibleText).toBe('A')
    dialogue.advance()
    expect(dialogue.visibleText).toBe('A⛰B')
  })
})
