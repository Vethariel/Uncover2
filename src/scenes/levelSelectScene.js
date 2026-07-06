import { LEVELS } from "../levels/levels.js"

export class LevelSelectScene {

    constructor(gameState) {
        this.gameState = gameState
        this.selectedIndex = 0
    }

    onEnter() {
        // Arranca en el último nivel desbloqueado (o 0)
        this.selectedIndex = Math.max(0, this.gameState.unlockedLevels - 1)
    }

    update(dt, p) {
        const input = this.inputHandler

        if (input.isJustDown('ArrowRight') || input.isJustDown('d')) {
            if (this.selectedIndex < this.gameState.unlockedLevels - 1) {
                this.selectedIndex++
            }
        }

        if (input.isJustDown('ArrowLeft') || input.isJustDown('a')) {
            if (this.selectedIndex > 0) {
                this.selectedIndex--
            }
        }

        if (input.isJustDown('Enter') || input.isJustDown(' ')) {
            this.gameState.currentLevelIndex = this.selectedIndex
            this.manager.transition('gameplay')
            this.manager.showOverlay('levelIntro')
        }

        if (input.isJustDown('Escape')) {
            this.manager.transition('menu')
        }
    }

    render(buffer) {
        const W = buffer.width
        const H = buffer.height
        const total = LEVELS.length
        const unlocked = this.gameState.unlockedLevels

        buffer.background(0)

        // Título
        buffer.fill(255)
        buffer.textAlign('center', 'center')
        buffer.textSize(16)
        buffer.text('SELECT LEVEL', W / 2, 24)

        // Fichas de niveles
        const cardW = 32
        const cardH = 36
        const gap = 8
        const cols = Math.min(total, 8)           // máx 8 por fila
        const rows = Math.ceil(total / cols)
        const gridW = cols * (cardW + gap) - gap
        const startX = (W - gridW) / 2
        const startY = H / 2 - (rows * (cardH + gap)) / 2

        for (let i = 0; i < total; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)
            const x = startX + col * (cardW + gap)
            const y = startY + row * (cardH + gap)

            const isUnlocked = i < unlocked
            const isSelected = i === this.selectedIndex

            // Fondo de la ficha
            if (isSelected) {
                buffer.fill(100, 200, 255)
            } else if (isUnlocked) {
                buffer.fill(40, 80, 120)
            } else {
                buffer.fill(30, 30, 30)
            }

            buffer.noStroke()
            if (isSelected) {
                buffer.stroke(255)
                buffer.strokeWeight(2)
            }
            buffer.rect(x, y, cardW, cardH, 3)
            buffer.noStroke()

            // Número o candado
            buffer.textAlign('center', 'center')
            if (isUnlocked) {
                buffer.fill(isSelected ? 0 : 200)
                buffer.textSize(11)
                buffer.text(`${i + 1}`, x + cardW / 2, y + cardH / 2 - 4)

                // Estrellas placeholder (puedes conectar a score real)
                buffer.fill(isSelected ? 0 : 80, isSelected ? 0 : 80, isSelected ? 0 : 80)
                buffer.textSize(6)
                buffer.text('★★★', x + cardW / 2, y + cardH - 8)
            } else {
                // Candado
                buffer.fill(60)
                buffer.textSize(14)
                buffer.text('🔒', x + cardW / 2, y + cardH / 2)
            }
        }

        // Info del nivel seleccionado
        const level = LEVELS[this.selectedIndex]
        const labelY = startY + rows * (cardH + gap) + 20

        buffer.fill(255)
        buffer.textSize(11)
        buffer.textAlign('center', 'center')
        buffer.text(`LEVEL ${this.selectedIndex + 1}`, W / 2, labelY)

        if (level?.name) {
            buffer.fill(160)
            buffer.textSize(8)
            buffer.text(level.name, W / 2, labelY + 14)
        }

        // Controles
        buffer.fill(100)
        buffer.textSize(7)
        buffer.text('← → MOVE    ENTER PLAY    ESC MENU', W / 2, H - 30)
    }
}