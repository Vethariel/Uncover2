import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_NONE } from "../config/constants.js"

export class AnimationSystem {

    update(world, dt) {

        this.updateEntity(world.player, dt)

        for (const enemy of world.enemies) {
            this.updateEntity(enemy, dt)
        }

        for (const bomb of world.bombs) {
            this.updateEntity(bomb, dt)
        }

        for (const explosion of world.explosions) {
            this.updateEntity(explosion, dt)
        }

        for (const powerUp of Object.values(world.powerUps ?? {})) {
            if (powerUp.alive) this.updateEntity(powerUp, dt)
        }

        if (world.portal?.visible) {
            this.updateEntity(world.portal, dt)
        }

    }

    updateEntity(entity, dt) {

        if (!entity?.sprite) return

        const anim = entity.sprite.animations[entity.sprite.current]
        if (!anim) return

        const isWalkAnim = ['walkDown', 'walkUp', 'walkLeft', 'walkRight'].includes(entity.sprite.current)

        let fps = anim.fps
        if (isWalkAnim) {
            fps = anim.fps * (entity.speed / entity.baseSpeed)
        }

        // Avanza el timer del frame
        entity.sprite.timer += dt

        const frameDuration = 1 / fps

        if (entity.sprite.timer >= frameDuration) {
            entity.sprite.timer = 0

            if (entity.sprite.frame < anim.frames - 1) {
                entity.sprite.frame++
            } else if (anim.loop !== false) {
                entity.sprite.frame = 0
            } else {
                entity.sprite.finished = true

                if (entity.type === 'portal' && entity.sprite.current === 'spawn') {
                    entity.sprite.current = 'idle'
                    entity.sprite.frame = 0
                    entity.sprite.timer = 0
                    entity.sprite.finished = false
                    entity.active = true  // ahora el jugador puede usarlo
                }
            }

        }

        // Selecciona animación según estado
        if (entity.facing !== undefined) {
            this.selectAnimation(entity)

        }

    }

    selectAnimation(entity) {

        const sprite = entity.sprite
        const isMoving = entity.desiredFacing !== DIR_NONE

        if (!entity.alive) {
            this.play(sprite, 'death')
            return
        }

        if (!isMoving) {
            // Idle — primer frame de la dirección actual
            const idleAnim = this.idleForDirection(entity.facing)
            this.play(sprite, idleAnim, true)  // true = no reinicia si ya está en esa anim
            sprite.frame = 0
            return
        }

        const walkAnim = this.walkForDirection(entity.facing)
        this.play(sprite, walkAnim)

    }

    play(sprite, name, soft = false) {
        if (soft && sprite.current === name) return
        if (sprite.current === name) return
        sprite.current = name
        sprite.frame = 0
        sprite.timer = 0
        sprite.finished = false
    }

    walkForDirection(facing) {
        switch (facing) {
            case DIR_DOWN: return 'walkDown'
            case DIR_UP: return 'walkUp'
            case DIR_LEFT: return 'walkLeft'
            case DIR_RIGHT: return 'walkRight'
            default: return 'walkDown'
        }
    }

    idleForDirection(facing) {
        switch (facing) {
            case DIR_DOWN: return 'walkDown'
            case DIR_UP: return 'walkUp'
            case DIR_LEFT: return 'walkLeft'
            case DIR_RIGHT: return 'walkRight'
            default: return 'walkDown'
        }
    }

}