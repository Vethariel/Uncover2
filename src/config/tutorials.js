/**
 * Pasos de tutorial (UI centrada). SPACE avanza.
 * @typedef {{ title: string, lines: string[] }} TutorialStep
 */

/** @type {Record<string, TutorialStep[]>} */
export const TUTORIALS = {
  tut_move_bomb: [
    {
      title: 'MOVIMIENTO Y BOMBAS',
      lines: [
        'WASD o flechas — mover',
        'SPACE — colocar bomba',
        'Las bombas abren camino en roca destruible.',
      ],
    },
  ],
  tut_pick: [
    {
      title: 'PICO',
      lines: [
        'Q (mantener) — picar el bloque delante',
        'Picar menas entrega material.',
        'Volar con bomba destruye el valor de la veta.',
      ],
    },
  ],
  tut_fragment: [
    {
      title: 'FRAGMENTOS',
      lines: [
        'E (mantener) — extraer de muro indestructible',
        'Los fragmentos desbloquean rangos en el yunque.',
      ],
    },
  ],
  tut_marks: [
    {
      title: 'MARCAS DEL SUELO',
      lines: [
        'Pisa las tabletas en el orden correcto.',
        'Un toque mal reinicia el patrón.',
        'Al completar, puede aparecer un cofre.',
      ],
    },
  ],
  tut_chest: [
    {
      title: 'COFRE',
      lines: [
        'E — abrir el cofre',
        'Entrega un lote de recursos de la corrida.',
      ],
    },
  ],
  tut_trap: [
    {
      title: 'TRAMPAS DE DARDO',
      lines: [
        'Pisar la placa arma un aviso y un dardo.',
        'Sal de la línea de fuego o usa una bomba para desarmar.',
      ],
    },
  ],
  tut_workshop: [
    {
      title: 'EL TALLER',
      lines: [
        'E — usar horno o yunque (de frente)',
        'E — hablar con Brun (y el Excavador, si está)',
        'Puerta sur — volver al nivel (automática al pisar)',
      ],
    },
  ],
  tut_smelt: [
    {
      title: 'FUNDICIÓN',
      lines: [
        'Horno: crudo → refinado',
        'El yunque gasta refinados (y fragmentos) en mejoras.',
      ],
    },
  ],
}

export function getTutorialSteps(id) {
  return TUTORIALS[id] ?? []
}
