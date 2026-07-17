// Especificaciones de niveles procedurales (Mov. I).
// El layout se genera en tiempo de carga (ver LevelGenerator); estos parámetros
// controlan tamaño, densidad y enemigos. Un `seed` fijo hace el nivel reproducible.
export const LEVELS = [
  {
    name: 'Túneles superiores',
    cols: 45,
    rows: 33,
    destructibleChance: 0.42,
    enemies: 3,
    enemyKinds: ['scout'],
    bgMusic: 'world1',
  },
  {
    name: 'Galería media',
    cols: 45,
    rows: 33,
    destructibleChance: 0.46,
    enemies: 4,
    enemyKinds: ['scout', 'hunter'],
    bgMusic: 'world1',
  },
  {
    name: 'Vetas profundas',
    cols: 51,
    rows: 37,
    destructibleChance: 0.5,
    enemies: 6,
    enemyKinds: ['scout', 'hunter'],
    bgMusic: 'world1',
  },
  {
    name: 'Cámara del guardián',
    cols: 51,
    rows: 37,
    destructibleChance: 0.52,
    enemies: 7,
    enemyKinds: ['hunter', 'brute'],
    bgMusic: 'world1',
  },
  {
    name: 'Corazón de la mina',
    cols: 57,
    rows: 41,
    destructibleChance: 0.55,
    enemies: 9,
    enemyKinds: ['scout', 'hunter', 'brute'],
    bgMusic: 'world1',
  },
]
