import { createSpriteState } from "../core/spriteConfig.js"

export class Portal {

    constructor(tileX, tileY, size) {

        this.tileX = tileX
        this.tileY = tileY

        this.size = size
        this.posX = this.tileX * this.size
        this.posY = this.tileY * this.size

        this.type = "portal"
        this.visible = false
        this.alive = true

        this.sprite = createSpriteState('portal', 'spawn')

    }

}