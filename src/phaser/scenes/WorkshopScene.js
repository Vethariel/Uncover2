import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { LEVELS } from '../../config/levels.js'
import { HUD_HEIGHT, TILE_SIZE } from '../../config/constants.js'
import { UPGRADE_DEFS, UPGRADE_IDS, SMELT_RECIPES } from '../../config/crafting.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { WorkshopView } from '../views/WorkshopView.js'
import { createWorkshopWorld } from '../../game/workshop/WorkshopWorld.js'
import { WorkshopLoop } from '../../game/workshop/WorkshopLoop.js'

export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super('Workshop')
  }

  create() {
    this.gameState = session.gameState
    this.gameState.recomputeStatsFromUpgrades()
    this.gameState.hubUnlocked = true
    this.gameState.save()

    this.inputAdapter = new InputAdapter(this)
    this.audio = getAudio(this)
    this.loop = new WorkshopLoop()
    this.world = createWorkshopWorld(TILE_SIZE)
    this.gameState.applyToPlayer(this.world.player)

    this.view = new WorkshopView(this, this.world)
    this.menu = null
    this.menuIndex = 0
    this.promptText = this.add.text(0, 0, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffc857',
      backgroundColor: '#111820cc',
      padding: { x: 4, y: 2 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false)

    this._buildHud()
    this._buildStationLabels()

    this.cameras.main.setBounds(0, 0, this.world.grid.cols * TILE_SIZE, this.world.grid.rows * TILE_SIZE)
    this.cameras.main.centerOn(
      this.world.player.posX + this.world.player.size / 2,
      this.world.player.posY + this.world.player.size / 2,
    )

    this.audio.playMusic('world1')
  }

  update(_time, delta) {
    const dt = Math.min(delta / 1000, 0.05)

    if (this.menu) {
      this._updateMenu()
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      // Esc en hub no sale al menú automáticamente; solo cierra menús.
      this.inputAdapter.flush()
      return
    }

    const result = this.loop.update(this.world, dt, this.inputAdapter)
    this.view.update()
    this._updatePrompt(result.focus)

    if (result.interact?.type === 'station') {
      this._openStationMenu(result.interact.station)
    } else if (result.interact?.type === 'door') {
      this._leaveHub()
    }

    this.inputAdapter.flush()
  }

  _buildHud() {
    const width = this.scale.width
    this.hudBanner = this.add.rectangle(0, 0, width, HUD_HEIGHT, 0x111820)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(1, 0x53616d)

    this.hudTitle = this.add.text(12, HUD_HEIGHT / 2, 'TALLER', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffc857',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001)

    this.hudResources = this.add.text(width / 2, HUD_HEIGHT / 2, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#c8d0d8',
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1001)

    this.hudHint = this.add.text(width - 12, HUD_HEIGHT / 2, 'E interactuar', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#8a93a0',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001)

    this._refreshHud()
  }

  _buildStationLabels() {
    for (const station of this.world.stations) {
      const anchor = station._labelAnchor
      this.add.text(anchor.x, anchor.y, station.label, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#ffffff',
      }).setOrigin(0.5, 1)
    }
  }

  _refreshHud() {
    const c = this.gameState.workshopCrude
    const r = this.gameState.workshopRefined
    this.hudResources.setText(
      `Crudo B${c.bronze}/H${c.iron}/C${c.crystal}   Ref B${r.bronze}/H${r.iron}/C${r.crystal}`,
    )
  }

  _updatePrompt(focus) {
    if (!focus) {
      this.promptText.setVisible(false)
      return
    }
    const label = focus.type === 'door'
      ? 'E — SALIR AL NIVEL'
      : `E — ${focus.station.label}`
    this.promptText.setText(label)
    this.promptText.setPosition(
      this.world.player.posX + this.world.player.size / 2,
      this.world.player.posY - 10,
    )
    this.promptText.setOrigin(0.5, 1)
    this.promptText.setVisible(true)
  }

  _openStationMenu(station) {
    this.menuIndex = 0
    this.menu = {
      kind: station.kind,
      items: station.kind === 'furnace' ? this._furnaceItems() : this._anvilItems(),
    }
    this._drawMenu()
  }

  _furnaceItems() {
    return ['bronze', 'iron', 'crystal'].map((material) => {
      const recipe = SMELT_RECIPES[material]
      const label = material.toUpperCase()
      return {
        id: material,
        text: `Fundir ${label} (${recipe.crude}→${recipe.refined})`,
        action: () => this.gameState.trySmelt(material),
      }
    })
  }

  _anvilItems() {
    return UPGRADE_IDS.map((id) => {
      const def = UPGRADE_DEFS[id]
      const rank = this.gameState.upgrades[id] ?? 0
      const owned = rank >= 1 ? ' [OK]' : ` (${def.cost} ${def.material})`
      return {
        id,
        text: `${def.name}${owned} — ${def.description}`,
        action: () => this.gameState.tryCraft(id),
      }
    })
  }

  _drawMenu() {
    this._clearMenuGraphics()
    const cx = this.scale.width / 2
    const cy = this.scale.height / 2
    const title = this.menu.kind === 'furnace' ? 'HORNO — FUNDICIÓN' : 'YUNQUE — FORJA'
    this.menuNodes = []

    this.menuNodes.push(
      this.add.rectangle(cx, cy, 420, 220, 0x000000, 0.72).setScrollFactor(0).setDepth(1100),
    )
    this.menuNodes.push(
      this.add.text(cx, cy - 90, title, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ffc857',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1101),
    )

    this.menu.items.forEach((item, index) => {
      const selected = index === this.menuIndex
      this.menuNodes.push(
        this.add.text(cx, cy - 50 + index * 22, `${selected ? '>' : ' '} ${item.text}`, {
          fontSize: '11px',
          fontFamily: 'monospace',
          color: selected ? '#ffffff' : '#9aa3ad',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1101),
      )
    })

    this.menuNodes.push(
      this.add.text(cx, cy + 90, '↑↓ elegir   ENTER confirmar   ESC cerrar', {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#8a93a0',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1101),
    )
  }

  _updateMenu() {
    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this._closeMenu()
      return
    }
    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.up)
      || Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.upArrow)) {
      this.menuIndex = (this.menuIndex + this.menu.items.length - 1) % this.menu.items.length
      this._drawMenu()
    }
    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.down)
      || Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.downArrow)) {
      this.menuIndex = (this.menuIndex + 1) % this.menu.items.length
      this._drawMenu()
    }
    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.enter)) {
      const item = this.menu.items[this.menuIndex]
      const result = item.action()
      if (result?.ok) {
        this.gameState.save()
        this._refreshHud()
        if (this.menu.kind === 'anvil') {
          this.menu.items = this._anvilItems()
        }
      }
      this._drawMenu()
    }
    this.inputAdapter.flush()
  }

  _closeMenu() {
    this._clearMenuGraphics()
    this.menu = null
    this.inputAdapter.flush()
  }

  _clearMenuGraphics() {
    for (const node of this.menuNodes ?? []) node.destroy()
    this.menuNodes = []
  }

  _leaveHub() {
    const index = this.gameState.levelIndexForHubExit()
    if (index >= LEVELS.length) {
      this.scene.start('Menu')
      return
    }
    this.gameState.hubEntry = null
    this.gameState.save()
    this.scene.start('Game', { showIntro: true })
  }
}
