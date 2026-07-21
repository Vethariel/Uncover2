/**
 * Stubs de diálogo por id. Rellenar desde docs/DIALOGUES.md sin tocar escenas.
 * Si devuelve [], NarrativeDirector salta al siguiente beat.
 */

function line(speaker, portrait, text) {
  return { speaker, portrait, text }
}

/** @type {Record<string, Array<{speaker:string,portrait:string,text:string}>>} */
const DIALOGUES = {
  // Level starts — placeholder hasta portar DIALOGUES.md
  'level.start.0': [
    line('VIAJERO', 'player', '…Primera galería. El permiso todavía quema en la palma.'),
  ],
  'level.start.1': [],
  'level.start.2': [],
  'level.start.3': [],
  'level.start.4': [],
  'level.start.5': [],
  'level.start.6': [],

  'discovery.destructible': [],
  'discovery.golem': [],
  'discovery.spirit': [],
  'discovery.marks': [],
  'discovery.chest': [],
  'discovery.crystal': [],
  'discovery.golemAdvanced': [],
  'discovery.trap': [],
  'discovery.fragment': [],

  'hub.intro': [
    line('BRUN', 'smith', '¡Eh! Otro con el sello caliente. Bienvenido al Taller — horno, yunque, y un enano que se quedó a mitad de camino.'),
  ],
  'hub.idle.brun': [
    line('BRUN', 'smith', 'Si no traes mena, al menos trae silencio cómodo. El horno acepta las dos cosas.'),
  ],
  'hub.idle.excavator': [
    line('PRIMER EXCAVADOR', 'excavator', 'El carbón habla más que yo. Pregunta medida, no consuelo.'),
  ],

  'n7.fail.first': [
    line('PRIMER EXCAVADOR', 'excavator', 'Basta por hoy. El límite no se abre a fuerza de prisa.'),
    line('PRIMER EXCAVADOR', 'excavator', 'Te devuelvo a la cámara antigua. Lee otra vez pico, tiempo e intención.'),
    line('VIAJERO', 'player', '…Duele el orgullo más que las costillas. Está bien.'),
  ],
  'n7.fail.retry': [
    line('PRIMER EXCAVADOR', 'excavator', 'Otra vez el límite te cerró el paso. Vuelve a la cámara antigua y ajusta el ritmo.'),
    line('VIAJERO', 'player', 'Entendido. Preámbulo otra vez.'),
  ],

  'craft.firstSmelt': [],
  'craft.firstAlloy': [],
}

export function getDialogue(id) {
  if (!id) return []
  return DIALOGUES[id] ?? []
}

/** Compat: inicio de nivel legacy → id canónico. */
export function levelStartDialogue(levelIndex, _levelName) {
  return getDialogue(`level.start.${levelIndex}`)
}
