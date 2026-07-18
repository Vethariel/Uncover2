export function levelStartDialogue(levelIndex, levelName) {
  return [
    {
      speaker: 'VIAJERO',
      portrait: 'player',
      text: `Nivel ${levelIndex + 1}: ${levelName}. La montaña guarda silencio, pero algo espera más adelante.`,
    },
    {
      speaker: 'VIAJERO',
      portrait: 'player',
      text: 'Debo avanzar con cuidado.',
    },
  ]
}
