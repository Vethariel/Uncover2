import { Blackboard }           from "../ai/blackboard.js"
import { DIR_DOWN } from "../config/constants.js"
import { createSpriteState } from "../core/spriteConfig.js"

export class Enemy {

    constructor(posX, posY, tileX, tileY, config) {

        this.posX = posX
        this.posY = posY

        this.tileX = tileX
        this.tileY = tileY

        this.speed = config.speed
        this.baseSpeed = config.speed
        this.size = config.size

        this.score = config.score

        this.facing = DIR_DOWN
        this.desiredFacing = DIR_DOWN
        this.currentDirection = DIR_DOWN
        
        this.behaviorTree = config.tree()
        this.blackboard = new Blackboard()

        this.type = "enemy"

        this.alive = true
        this.invulnerableTimer = 0

        // IA
        this.thinkTimer = 0
        this.thinkInterval = config.thinkInterval
        this.deathTimer = 0


        this.sprite = createSpriteState(config.sprite)

    }

}