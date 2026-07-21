/**
 * Pasos de tutorial centrados. SPACE revela / avanza (sin typewriter largo).
 */
export class TutorialController {
  constructor() {
    this.steps = []
    this.stepIndex = 0
    this.active = false
  }

  start(steps) {
    this.steps = (steps ?? []).filter((s) => s?.title || s?.lines?.length)
    this.stepIndex = 0
    this.active = this.steps.length > 0
    return this.currentStep
  }

  update(_dt) {
    return false
  }

  advance() {
    if (!this.active) return { type: 'inactive' }

    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex += 1
      return { type: 'next', step: this.currentStep }
    }

    this.active = false
    return { type: 'finished' }
  }

  get currentStep() {
    return this.steps[this.stepIndex] ?? null
  }

  get hasNext() {
    return this.active && this.stepIndex < this.steps.length - 1
  }
}
