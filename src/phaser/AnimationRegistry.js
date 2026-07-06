function rowFrames(texture, row, count, cols) {
  return Array.from({ length: count }, (_, i) => ({ key: texture, frame: row * cols + i }))
}

const SHEET_COLS = {
  player: 4,   // 128x160, 32px frames
  dino: 6,     // 192x160, 32px frames
  demon: 8,    // 256x160, 32px frames
  bombs: 8,    // 128x176, 16px frames
  powerUp: 2,  // 32x64, 16px frames
  portal: 12,  // 192x96, 16x48 frames
}

export function registerAnimations(anims) {
  const dirs = ['Down', 'Left', 'Right', 'Up']

  dirs.forEach((dir, row) => {
    const cols = SHEET_COLS.player
    anims.create({
      key: `player_walk${dir}`,
      frames: rowFrames('player', row, 4, cols),
      frameRate: 5,
      repeat: -1,
    })
    anims.create({
      key: `player_idle${dir}`,
      frames: [{ key: 'player', frame: row * cols }],
    })
  })

  anims.create({
    key: 'player_death',
    frames: rowFrames('player', 4, 4, SHEET_COLS.player),
    frameRate: 6,
    repeat: 0,
  })

  for (const texture of ['dino', 'demon']) {
    const cols = SHEET_COLS[texture]
    const walkFrames = texture === 'demon' ? 8 : 4

    dirs.forEach((dir, row) => {
      anims.create({
        key: `${texture}_walk${dir}`,
        frames: rowFrames(texture, row, walkFrames, cols),
        frameRate: texture === 'demon' ? 8 : 4,
        repeat: -1,
      })
      anims.create({
        key: `${texture}_idle${dir}`,
        frames: [{ key: texture, frame: row * cols }],
      })
    })

    anims.create({
      key: `${texture}_death`,
      frames: rowFrames(texture, 4, 4, cols),
      frameRate: 8,
      repeat: 0,
    })
  }

  anims.create({
    key: 'bomb_pulse',
    frames: rowFrames('bombs', 0, 4, SHEET_COLS.bombs),
    frameRate: 6,
    repeat: -1,
  })

  const explosionAnims = {
    center: [1, 8],
    horizontal: [2, 8],
    vertical: [3, 8],
    tipUp: [4, 8],
    tipDown: [5, 8],
    tipLeft: [6, 8],
    tipRight: [7, 8],
    powerUp: [8, 5],
    tilelevel1: [9, 6],
    tilelevel2: [10, 6],
  }

  for (const [name, [row, count]] of Object.entries(explosionAnims)) {
    anims.create({
      key: `explosion_${name}`,
      frames: rowFrames('bombs', row, count, SHEET_COLS.bombs),
      frameRate: 12,
      repeat: name.startsWith('tile') || name === 'powerUp' ? 0 : -1,
    })
  }

  for (const kind of ['life', 'bomb', 'range', 'speed']) {
    const row = { life: 0, bomb: 1, range: 2, speed: 3 }[kind]
    anims.create({
      key: `powerup_${kind}`,
      frames: rowFrames('powerUp', row, 2, SHEET_COLS.powerUp),
      frameRate: 16,
      repeat: -1,
    })
  }

  anims.create({
    key: 'portal_spawn',
    frames: rowFrames('portal', 0, 10, SHEET_COLS.portal),
    frameRate: 12,
    repeat: 0,
  })

  anims.create({
    key: 'portal_idle',
    frames: rowFrames('portal', 1, 12, SHEET_COLS.portal),
    frameRate: 8,
    repeat: -1,
  })
}

export { SHEET_COLS }
