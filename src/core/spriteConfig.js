export const SPRITE_CONFIGS = {

    player: {
        sheet: 'player',
        frameWidth: 32,
        frameHeight: 32,
        animations: {
            walkDown: { row: 0, frames: 4, fps: 5 },
            walkLeft: { row: 1, frames: 4, fps: 5 },
            walkRight: { row: 2, frames: 4, fps: 5 },
            walkUp: { row: 3, frames: 4, fps: 5 },
            death: { row: 4, frames: 6, fps: 6, loop: false },
        }
    },

    dino: {
        sheet: 'dino',
        frameWidth: 32,
        frameHeight: 32,
        animations: {
            walkDown: { row: 0, frames: 4, fps: 4 },
            walkLeft: { row: 1, frames: 4, fps: 4 },
            walkRight: { row: 2, frames: 4, fps: 4 },
            walkUp: { row: 3, frames: 4, fps: 4 },
            death: { row: 4, frames: 4, fps: 8, loop: false },
        }
    },

    demon: {
        sheet: 'demon',
        frameWidth: 32,
        frameHeight: 32,
        animations: {
            walkDown: { row: 0, frames: 8, fps: 8 },
            walkLeft: { row: 1, frames: 8, fps: 8 },
            walkRight: { row: 2, frames: 8, fps: 8 },
            walkUp: { row: 3, frames: 8, fps: 8 },
            death: { row: 4, frames: 4, fps: 8, loop: false },
        }
    },

    bomb: {
        sheet: 'bombs',
        frameWidth: 16,
        frameHeight: 16,
        animations: {
            pulse: { row: 0, frames: 4, fps: 6 },
        }
    },

    explosion: {
        sheet: 'bombs',
        frameWidth: 16,
        frameHeight: 16,
        animations: {
            center: { row: 1, frames: 8, fps: 12 },
            horizontal: { row: 2, frames: 8, fps: 12 },
            vertical: { row: 3, frames: 8, fps: 12 },
            tipUp: { row: 4, frames: 8, fps: 12 },
            tipDown: { row: 5, frames: 8, fps: 12 },
            tipLeft: { row: 6, frames: 8, fps: 12 },
            tipRight: { row: 7, frames: 8, fps: 12 },
            powerUp: { row: 8, frames: 5, fps: 12, loop: false },
            tilelevel1: { row: 9, frames: 6, fps: 12, loop: false },
            tilelevel2: { row: 10, frames: 6, fps: 12, loop: false },
        }
    },

    powerUp: {
        sheet: 'powerUp',
        frameWidth: 16,
        frameHeight: 16,
        animations: {
            life: { row: 0, frames: 2, fps: 16 },
            bomb: { row: 1, frames: 2, fps: 16 },
            range: { row: 2, frames: 2, fps: 16 },
            speed: { row: 3, frames: 2, fps: 16 },
        }
    },

    // En SPRITE_CONFIGS:
    portal: {
        sheet: 'portal',
        frameWidth: 16,
        frameHeight: 48,
        animations: {
            spawn: { row: 0, frames: 10, fps: 12, loop: false },
            idle: { row: 1, frames: 12, fps: 8 },
        }
    },

}

export function createSpriteState(key, initialAnim = 'walkDown') {
    const config = SPRITE_CONFIGS[key]
    if (!config) return null
    return {
        ...config,
        current: initialAnim,
        frame: 0,
        timer: 0,
        finished: false,
    }
}