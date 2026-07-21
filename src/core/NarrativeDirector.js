import { getDialogue } from '../config/dialogues.js'
import { getEventBeats } from '../config/narrativeEvents.js'
import { getTutorialSteps } from '../config/tutorials.js'

/**
 * Cola de beats narrativos (diálogo → tutorial).
 * Congela gameplay vía scene early-return mientras `active`.
 */
export class NarrativeDirector {
  /**
   * @param {{
   *   dialogueController: import('./DialogueController.js').DialogueController,
   *   dialogueView: { show(): void, hide(): void, sync(): void },
   *   tutorialController: import('./TutorialController.js').TutorialController,
   *   tutorialView: { show(): void, hide(): void, sync(): void },
   *   onIdle?: () => void,
   * }} deps
   */
  constructor(deps) {
    this.dialogueController = deps.dialogueController
    this.dialogueView = deps.dialogueView
    this.tutorialController = deps.tutorialController
    this.tutorialView = deps.tutorialView
    this.onIdle = deps.onIdle ?? null
    this.queue = []
    this.mode = null // 'dialogue' | 'tutorial' | null
  }

  get active() {
    return this.mode != null || this.queue.length > 0
  }

  /**
   * One-shot: marca flag y encola beats del registro.
   * @returns {boolean} true si se encoló algo
   */
  tryFire(eventId, gameState) {
    if (!eventId || gameState.hasSeen(eventId)) return false
    const beats = getEventBeats(eventId)
    if (beats == null) return false
    gameState.markSeen(eventId)
    gameState.save()
    return this._enqueueBeats(beats)
  }

  /** Repetible (idle NPC). No marca flag del evento. */
  forceFire(eventId) {
    const beats = getEventBeats(eventId)
    if (!beats?.length) return false
    return this._enqueueBeats(beats)
  }

  enqueueBeats(beats) {
    return this._enqueueBeats(beats ?? [])
  }

  _enqueueBeats(beats) {
    let added = false
    for (const beat of beats) {
      if (!beat?.type || !beat?.id) continue
      this.queue.push(beat)
      added = true
    }
    if (added && !this.mode) this._pump()
    return added || this.active
  }

  update(dt) {
    if (this.mode === 'dialogue') {
      this.dialogueController.update(dt)
      this.dialogueView.sync()
      return
    }
    if (this.mode === 'tutorial') {
      this.tutorialController.update(dt)
      this.tutorialView.sync()
    }
  }

  /** SPACE: avanzar beat actual. */
  advance() {
    if (this.mode === 'dialogue') {
      const result = this.dialogueController.advance()
      this.dialogueView.sync()
      if (result.type === 'finished') {
        this.dialogueView.hide()
        this.mode = null
        this._pump()
      }
      return result
    }
    if (this.mode === 'tutorial') {
      const result = this.tutorialController.advance()
      this.tutorialView.sync()
      if (result.type === 'finished') {
        this.tutorialView.hide()
        this.mode = null
        this._pump()
      }
      return result
    }
    return { type: 'inactive' }
  }

  _pump() {
    while (!this.mode && this.queue.length > 0) {
      const beat = this.queue.shift()
      if (beat.type === 'dialogue') {
        const entries = getDialogue(beat.id)
        if (!entries.length) continue
        this.dialogueController.start(entries)
        this.mode = 'dialogue'
        this.dialogueView.show()
        return
      }
      if (beat.type === 'tutorial') {
        const steps = getTutorialSteps(beat.id)
        if (!steps.length) continue
        this.tutorialController.start(steps)
        this.mode = 'tutorial'
        this.tutorialView.show()
        return
      }
    }
    if (!this.mode && this.queue.length === 0) {
      this.onIdle?.()
    }
  }

  destroy() {
    this.queue.length = 0
    this.mode = null
  }
}
