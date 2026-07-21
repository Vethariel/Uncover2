/**
 * Contrato narrativo Mov. I
 * ---------------------------
 * Cada EVENT_ID mapea a beats en orden. Tipos:
 *   { type: 'dialogue', id }  → getDialogue(id)  (si [] se salta)
 *   { type: 'tutorial', id }  → getTutorialSteps(id)
 *
 * Para incorporar batidas de docs/DIALOGUES.md: rellenar dialogues.js
 * con el mismo id. No hace falta tocar GameScene / WorkshopScene.
 *
 * tryFire(eventId): one-shot vía gameState.markSeen(eventId)
 * forceFire(eventId): repetible (idle NPC); no marca flag del evento
 */

/** @typedef {{ type: 'dialogue'|'tutorial', id: string }} NarrativeBeat */

/** @type {Record<string, NarrativeBeat[]>} */
export const NARRATIVE_EVENTS = {
  'level.start.0': [
    { type: 'dialogue', id: 'level.start.0' },
    { type: 'tutorial', id: 'tut_move_bomb' },
  ],
  'level.start.1': [{ type: 'dialogue', id: 'level.start.1' }],
  'level.start.2': [{ type: 'dialogue', id: 'level.start.2' }],
  'level.start.3': [{ type: 'dialogue', id: 'level.start.3' }],
  'level.start.4': [{ type: 'dialogue', id: 'level.start.4' }],
  'level.start.5': [{ type: 'dialogue', id: 'level.start.5' }],
  'level.start.6': [{ type: 'dialogue', id: 'level.start.6' }],

  'discovery.destructible': [
    { type: 'dialogue', id: 'discovery.destructible' },
    { type: 'tutorial', id: 'tut_pick' },
  ],
  'discovery.golem': [{ type: 'dialogue', id: 'discovery.golem' }],
  'discovery.spirit': [{ type: 'dialogue', id: 'discovery.spirit' }],
  'discovery.marks': [
    { type: 'dialogue', id: 'discovery.marks' },
    { type: 'tutorial', id: 'tut_marks' },
  ],
  'discovery.chest': [
    { type: 'dialogue', id: 'discovery.chest' },
    { type: 'tutorial', id: 'tut_chest' },
  ],
  'discovery.crystal': [{ type: 'dialogue', id: 'discovery.crystal' }],
  'discovery.golemAdvanced': [{ type: 'dialogue', id: 'discovery.golemAdvanced' }],
  'discovery.trap': [
    { type: 'dialogue', id: 'discovery.trap' },
    { type: 'tutorial', id: 'tut_trap' },
  ],
  'discovery.fragment': [
    { type: 'dialogue', id: 'discovery.fragment' },
    { type: 'tutorial', id: 'tut_fragment' },
  ],

  'hub.intro': [
    { type: 'dialogue', id: 'hub.intro' },
    { type: 'tutorial', id: 'tut_workshop' },
  ],
  // advance/retry: stubs por nivel; rellenar después
  'hub.advance.2': [],
  'hub.advance.3': [],
  'hub.advance.4': [],
  'hub.advance.5': [],
  'hub.advance.6': [],
  'hub.retry.2': [],
  'hub.retry.3': [],
  'hub.retry.4': [],
  'hub.retry.5': [],
  'hub.retry.6': [],

  'hub.idle.brun': [{ type: 'dialogue', id: 'hub.idle.brun' }],
  'hub.idle.excavator': [{ type: 'dialogue', id: 'hub.idle.excavator' }],

  'craft.firstSmelt': [
    { type: 'dialogue', id: 'craft.firstSmelt' },
    { type: 'tutorial', id: 'tut_smelt' },
  ],
  'craft.firstAlloy': [{ type: 'dialogue', id: 'craft.firstAlloy' }],
}

export function getEventBeats(eventId) {
  return NARRATIVE_EVENTS[eventId] ?? null
}
