import { TILE_WALL, TILE_DESTRUCTIBLE, TILE_EXPLOSION, TILE_PASS, HUD_HEIGHT } from "../config/constants.js"

export class RenderSystem {

    draw(world, assets, p) {
        world.tileAnimTimer += p.deltaTime
        this.drawTiles(world, assets, p)
        this.drawEntities(world, assets, p)
    }

    drawTiles(world, assets, p) {


        const { grid, tileSize, levelVisualConfig } = world
        const sheet = levelVisualConfig ? assets.get(levelVisualConfig.tilesetKey) : null

        p.noStroke()

        for (let y = 0; y < grid.rows; y++) {
            for (let x = 0; x < grid.cols; x++) {

                const tile = grid.tiles[y][x]
                const { layers, destructibleGid } = grid.getVisual(x, y) ?? { layers: [], destructibleGid: 0 }  // null en niveles legacy
                const px = x * tileSize
                const py = y * tileSize

                if (sheet && layers) {

                    // ── Render con tileset ──────────────────────────────────────────

                    // 1. Capas de fondo en orden (Background → Bridge)

                    for (const gid of layers) {
                        if (gid === 0) continue
                        this._drawGid(p, sheet, gid, levelVisualConfig, px, py + HUD_HEIGHT)
                    }

                    if (tile === TILE_DESTRUCTIBLE && destructibleGid > 0) {
                        // El GID de la capa Destructible es el último en el array layers
                        const anim = levelVisualConfig.tileAnims[destructibleGid]

                        if (anim) {
                            const frame = Math.floor(world.tileAnimTimer / anim.duration) % anim.frames.length
                            this._drawGid(p, sheet, anim.frames[frame], levelVisualConfig, px, py + HUD_HEIGHT)
                        } else {
                            this._drawGid(p, sheet, destructibleGid, levelVisualConfig, px, py + HUD_HEIGHT)
                        }
                    }


                } else {

                    // ── Fallback de colores ─────────────────────────────────────────
                    if (tile === TILE_WALL) {
                        p.fill(120)
                        p.rect(px, py, tileSize, tileSize)
                    } else if (tile === TILE_DESTRUCTIBLE) {
                        p.fill(200, 150, 80)
                        p.rect(px, py, tileSize, tileSize)
                    } else if (tile === TILE_PASS) {
                        p.fill(80, 140, 200, 120)
                        p.rect(px, py, tileSize, tileSize)
                    } else if (tile === TILE_EXPLOSION) {
                        p.fill(220, 100, 30)
                        p.rect(px, py, tileSize, tileSize)
                    }

                }

            }
        }

    }


    // Dibuja un GID de Tiled (1-based) en la posición (px, py) del canvas.
    _drawGid(p, sheet, rawGid, cfg, px, py) {
        if (rawGid <= 0) return

        const FLIP_H = 0x80000000
        const FLIP_V = 0x40000000
        const FLIP_D = 0x20000000  // diagonal = rotate 90° + flip

        const flipH = (rawGid & FLIP_H) !== 0
        const flipV = (rawGid & FLIP_V) !== 0
        const flipD = (rawGid & FLIP_D) !== 0

        const gid = rawGid & 0x1FFFFFFF
        const idx = gid - 1
        const col = idx % cfg.tilesetCols
        const row = Math.floor(idx / cfg.tilesetCols)
        const sx = cfg.margin + col * (cfg.tileSize + cfg.spacing)
        const sy = cfg.margin + row * (cfg.tileSize + cfg.spacing)
        const ts = cfg.tileSize

        p.push()

        // Traslada al centro del tile para rotar/escalar desde ahí
        p.translate(px + ts / 2, py + ts / 2)

        // Tiled codifica las rotaciones con combinaciones de los tres flags:
        // 90°  CW  → flipD + flipH
        // 180°     → flipH + flipV
        // 270° CW  → flipD + flipV
        if (flipD && flipH) {
            p.rotate(Math.PI / 2)
        } else if (flipH && flipV) {
            p.rotate(Math.PI)
        } else if (flipD && flipV) {
            p.rotate(-Math.PI / 2)
        } else if (flipD) {
            // flip diagonal puro (transpuesta)
            p.rotate(Math.PI / 2)
            p.scale(1, -1)
        } else if (flipH) {
            p.scale(-1, 1)
        } else if (flipV) {
            p.scale(1, -1)
        }

        // Dibuja centrado en el origen (ya trasladado)
        p.image(sheet, -ts / 2, -ts / 2, ts, ts, sx, sy, ts, ts)

        p.pop()
    }



    drawEntities(world, assets, p) {

        p.noStroke()

        // Bombas
        for (const bomb of world.bombs) {
            this.drawSprite(p, assets, bomb)
        }

        // Explosiones
        for (const explosion of world.explosions) {
            this.drawSprite(p, assets, explosion)
        }

        // Power ups
        for (const powerUp of Object.values(world.powerUps ?? {})) {
            if (powerUp.alive === false) continue
            this.drawSprite(p, assets, powerUp)
        }

        // Portal
        if (world.portal?.visible) {
            this.drawSprite(p, assets, world.portal)
        }

        const entities = [...world.enemies,world.player]

        entities.sort((a, b) => {
            if (a.posY === b.posY) return a.posX - b.posX
            return a.posY - b.posY
        })

        for (const entity of entities) {
            this.drawSprite(p, assets, entity)
        }

    }

    drawSprite(p, assets, entity) {

        const sprite = entity.sprite
        if (!sprite) return

        const sheet = assets.get(sprite.sheet)
        if (!sheet) return

        const anim = sprite.animations[sprite.current]
        if (!anim) return

        if (anim.loop === false && sprite.finished) return

        const sx = sprite.frame * sprite.frameWidth
        const sy = anim.row * sprite.frameHeight

        // Centra el sprite sobre la hitbox
        const drawX = Math.floor(entity.posX + (entity.size - sprite.frameWidth) / 2)
        const drawY = Math.floor(entity.posY + (entity.size - sprite.frameHeight))  // alineado al piso

        // Parpadeo si tiene invulnerableTimer
        if (entity.invulnerableTimer > 0) {
            const visible = Math.floor(entity.invulnerableTimer * 20) % 2 === 0
            if (!visible) return
        }
        p.image(sheet, drawX, drawY + HUD_HEIGHT, sprite.frameWidth, sprite.frameHeight,
            sx, sy, sprite.frameWidth, sprite.frameHeight)

    }

}