import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { LEVELS } from '../../config/levels.js'
import { HUD_HEIGHT, TILE_SIZE } from '../../config/constants.js'
import {
  GENERIC_R2_COST,
  MAX_UPGRADE_RANK,
  SMELT_RECIPES,
  SPECIALIZED_R3_COST,
  UPGRADE_DEFS,
  UPGRADE_IDS,
  nextCraftCost,
  sumSpecializedFragments,
} from '../../config/crafting.js'
import { DialogueController } from '../../core/DialogueController.js'
import { NarrativeDirector } from '../../core/NarrativeDirector.js'
import { TutorialController } from '../../core/TutorialController.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { WorkshopView } from '../views/WorkshopView.js'
import { DialogueView } from '../views/DialogueView.js'
import { TutorialView } from '../views/TutorialView.js'
import { createWorkshopWorld } from '../../game/workshop/WorkshopWorld.js'
import { WorkshopLoop } from '../../game/workshop/WorkshopLoop.js'
import {
  BLACKOUT_DATA_KEY,
  maybeFadeInFromBlackout,
  runBlackout,
  takeBlackoutFadeIn,
} from '../fx/blackout.js'
import {
  COLOR_MUTED,
  COLOR_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_DISPLAY,
  FONT_SIZE_HINT,
  FONT_SIZE_HUD,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'

export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super('Workshop')
  }

  init(data) {
    this._pendingBlackoutFadeIn = takeBlackoutFadeIn(data)
  }

  create() {
    // Phaser reutiliza la instancia: un blackout previo hacia Game deja el flag.
    this._blackoutRunning = false
    this._cleanupHubUi()

    this.gameState = session.gameState
    this.gameState.recomputeStatsFromUpgrades()
    this.gameState.hubUnlocked = true
    this.gameState.save()

    this.inputAdapter = new InputAdapter(this)
    this.audio = getAudio(this)
    this.loop = new WorkshopLoop()
    this.world = createWorkshopWorld(TILE_SIZE, {
      excavatorInHub: this.gameState.hasSeen('excavatorInHub'),
    })
    this.gameState.applyToPlayer(this.world.player)

    this.view = new WorkshopView(this, this.world)
    this.dialogueController = new DialogueController()
    this.dialogueView = new DialogueView(this, this.dialogueController)
    this.tutorialController = new TutorialController()
    this.tutorialView = new TutorialView(this, this.tutorialController)
    this.narrativeDirector = new NarrativeDirector({
      dialogueController: this.dialogueController,
      dialogueView: this.dialogueView,
      tutorialController: this.tutorialController,
      tutorialView: this.tutorialView,
    })

    this.menu = null
    this.menuIndex = 0
    this.promptText = this.add.text(
      0,
      0,
      '',
      textStyleBody({
        fontSize: `${FONT_SIZE_HUD}px`,
        color: COLOR_TITLE,
        backgroundColor: '#111820cc',
        padding: { x: 4, y: 2 },
      }),
    ).setScrollFactor(0).setDepth(1000).setVisible(false)

    this._buildHud()
    this._buildStationLabels()

    this.cameras.main.setBounds(0, 0, this.world.grid.cols * TILE_SIZE, this.world.grid.rows * TILE_SIZE)
    this.cameras.main.centerOn(
      this.world.player.posX + this.world.player.size / 2,
      this.world.player.posY + this.world.player.size / 2,
    )

    this.audio.playMusic('workshop')

    const startNarrative = () => this._startHubNarrative()
    if (this._pendingBlackoutFadeIn) {
      this._pendingBlackoutFadeIn = false
      maybeFadeInFromBlackout(this, startNarrative)
    } else {
      startNarrative()
    }
  }

  update(_time, delta) {
    if (this._blackoutRunning) return

    const dt = Math.min(delta / 1000, 0.05)

    if (this.narrativeDirector?.active) {
      this._updateNarrative(dt)
      return
    }

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
    } else if (result.interact?.type === 'npc') {
      this._talkToNpc(result.interact.npc)
    } else if (result.interact?.type === 'door') {
      this._leaveHub()
    }

    this.inputAdapter.flush()
  }

  _startHubNarrative() {
    if (!this.gameState.hasSeen('hub.intro')) {
      this.narrativeDirector.tryFire('hub.intro', this.gameState)
      return
    }

    if (
      this.gameState.hasSeen('excavatorInHub')
      && !this.gameState.hasSeen('hub.excavator.arrival')
    ) {
      this.narrativeDirector.tryFire('hub.excavator.arrival', this.gameState)
      return
    }

    const entry = this.gameState.hubEntry
    const levelN = this.gameState.hubNarrativeLevel
    if (entry === 'advance' && levelN != null && levelN >= 3) {
      this.narrativeDirector.tryFire(`hub.advance.${levelN}`, this.gameState)
      return
    }
    if (entry === 'retry' && levelN != null && levelN >= 3) {
      this.narrativeDirector.forceFire(`hub.retry.${levelN}`)
    }
  }

  _talkToNpc(npc) {
    this.view?.freezePlayerIdle()
    const eventId = npc.id === 'excavator' ? 'hub.idle.excavator' : 'hub.idle.brun'
    this.narrativeDirector.forceFire(eventId)
    this.promptText?.setVisible(false)
    this.inputAdapter.flush()
  }

  _updateNarrative(dt) {
    this.narrativeDirector.update(dt)
    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.bomb)) {
      this.narrativeDirector.advance()
    }
    this.view?.freezePlayerIdle()
    this.inputAdapter.flush()
  }

  _buildHud() {
    const width = this.scale.width
    this.hudBanner = this.add.rectangle(0, 0, width, HUD_HEIGHT, 0x111820)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(1, 0x53616d)

    this.hudTitle = this.add.text(
      12,
      HUD_HEIGHT / 2,
      'TALLER',
      textStyleDisplay({ fontSize: `${FONT_SIZE_BODY}px` }),
    ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001)

    this.hudResources = this.add.text(
      width / 2,
      HUD_HEIGHT / 2,
      '',
      textStyleBody({ fontSize: `${FONT_SIZE_HUD}px`, color: '#c8d0d8' }),
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1001)

    this.hudHint = this.add.text(
      width - 12,
      HUD_HEIGHT / 2,
      'E interactuar',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: COLOR_MUTED }),
    ).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001)

    this._refreshHud()
  }

  _buildStationLabels() {
    for (const station of this.world.stations) {
      const anchor = station._labelAnchor
      this.add.text(
        anchor.x,
        anchor.y,
        station.label,
        textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: '#ffffff' }),
      ).setOrigin(0.5, 1)
    }
  }

  _refreshHud() {
    const c = this.gameState.workshopCrude
    const r = this.gameState.workshopRefined
    const f = this.gameState.workshopFragments
    const specialized = sumSpecializedFragments(f)
    this.hudResources.setText(
      `Crudo B${c.bronze}/H${c.iron}/C${c.crystal}  Ref B${r.bronze}/H${r.iron}/C${r.crystal}  Frag ${f.generic}+${specialized}`,
    )
  }

  _updatePrompt(focus) {
    if (!focus || focus.type === 'door') {
      this.promptText.setVisible(false)
      return
    }
    const label = focus.type === 'npc'
      ? focus.npc.label
      : focus.station.label
    this.promptText.setText(`E — ${label}`)
    this.promptText.setPosition(
      this.world.player.posX + this.world.player.size / 2,
      this.world.player.posY - 10,
    )
    this.promptText.setOrigin(0.5, 1)
    this.promptText.setVisible(true)
  }

  _openStationMenu(station) {
    this.view?.freezePlayerIdle()
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

  _anvilStatus(upgradeId) {
    const def = UPGRADE_DEFS[upgradeId]
    const rank = this.gameState.upgrades[upgradeId] ?? 0
    const known = this.gameState.recipesKnown[upgradeId] ?? 1
    const cost = nextCraftCost(upgradeId, rank)
    const refined = this.gameState.workshopRefined[def.material] ?? 0
    const fragments = this.gameState.workshopFragments

    if (rank >= MAX_UPGRADE_RANK) {
      return { status: 'max', rank, known, cost, refined, def }
    }
    if (rank >= known) {
      if (known < 2) {
        return {
          status: 'locked_r2',
          rank,
          known,
          cost: GENERIC_R2_COST,
          refined: fragments.generic,
          def,
        }
      }
      return {
        status: 'locked_r3',
        rank,
        known,
        cost: SPECIALIZED_R3_COST,
        refined: fragments.specialized[upgradeId] ?? 0,
        def,
      }
    }
    if (cost != null && refined >= cost) {
      return { status: 'craftable', rank, known, cost, refined, def }
    }
    return { status: 'insufficient', rank, known, cost, refined, def }
  }

  _anvilItems() {
    return UPGRADE_IDS.map((id) => {
      const info = this._anvilStatus(id)
      const { def, rank, known, cost, refined, status } = info
      let text
      let action

      switch (status) {
        case 'max':
          text = `${def.name} R${rank} — MÁX`
          action = () => ({ ok: false, reason: 'max_rank' })
          break
        case 'locked_r2':
          text = `${def.name} R${rank}/R${known} — Desbloquear R2 (${GENERIC_R2_COST}F gen, tienes ${refined})`
          action = () => this.gameState.tryUnlockRank2(id)
          break
        case 'locked_r3':
          text = `${def.name} R${rank}/R${known} — Desbloquear R3 (${SPECIALIZED_R3_COST}F ${def.name}, tienes ${refined})`
          action = () => this.gameState.tryUnlockRank3(id)
          break
        case 'insufficient':
          text = `${def.name} R${rank}→${rank + 1} — Falta ${def.material} (${refined}/${cost})`
          action = () => this.gameState.tryCraft(id)
          break
        default:
          text = `${def.name} R${rank}→${rank + 1} — Forjar (${cost} ${def.material})`
          action = () => this.gameState.tryCraft(id)
          break
      }

      return { id, status, text, action, forge: status === 'craftable' }
    })
  }

  _drawMenu() {
    this._clearMenuGraphics()
    const cx = this.scale.width / 2
    const cy = this.scale.height / 2
    const title = this.menu.kind === 'furnace' ? 'HORNO — FUNDICIÓN' : 'YUNQUE — FORJA'
    const rowCount = this.menu.items.length
    const panelHeight = Math.max(220, 120 + rowCount * 18)
    this.menuNodes = []

    this.menuNodes.push(
      this.add.rectangle(cx, cy, 520, panelHeight, 0x000000, 0.72)
        .setScrollFactor(0)
        .setDepth(1100),
    )
    this.menuNodes.push(
      this.add.text(
        cx,
        cy - panelHeight / 2 + 20,
        title,
        textStyleDisplay({ fontSize: `${FONT_SIZE_DISPLAY}px` }),
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1101),
    )

    this.menu.items.forEach((item, index) => {
      const selected = index === this.menuIndex
      const muted = item.status === 'max' || item.status === 'insufficient'
      this.menuNodes.push(
        this.add.text(
          cx,
          cy - panelHeight / 2 + 48 + index * 18,
          `${selected ? '>' : ' '} ${item.text}`,
          textStyleBody({
            fontSize: `${FONT_SIZE_HUD}px`,
            color: selected ? '#ffffff' : muted ? '#6f7780' : COLOR_MUTED,
          }),
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1101),
      )
    })

    this.menuNodes.push(
      this.add.text(
        cx,
        cy + panelHeight / 2 - 18,
        '↑↓ elegir   ENTER confirmar   ESC cerrar',
        textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: COLOR_MUTED }),
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1101),
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
        if (this.menu.kind === 'furnace') {
          this.narrativeDirector.tryFire('craft.firstSmelt', this.gameState)
        }
        if (this.menu.kind === 'anvil' && item.forge) {
          this.narrativeDirector.tryFire('craft.firstAlloy', this.gameState)
        }
        if (this.menu.kind === 'anvil') {
          this.menu.items = this._anvilItems()
        }
        // Si arrancó tutorial/diálogo, cerrar menú para no solapar.
        if (this.narrativeDirector.active) {
          this._closeMenu()
          return
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
    this.view?.freezePlayerIdle()
    const index = this.gameState.levelIndexForHubExit()
    const nextScene = index >= LEVELS.length ? 'Menu' : 'Game'
    runBlackout(this, {
      onBlack: () => {
        if (nextScene === 'Game') {
          this.gameState.hubEntry = null
          this.gameState.hubNarrativeLevel = null
          this.gameState.save()
        }
        this.scene.start(nextScene, { [BLACKOUT_DATA_KEY]: true })
      },
    })
  }

  _cleanupHubUi() {
    this.narrativeDirector?.destroy()
    this.narrativeDirector = null
    this.dialogueView?.destroy()
    this.dialogueView = null
    this.dialogueController = null
    this.tutorialView?.destroy()
    this.tutorialView = null
    this.tutorialController = null
    this.view?.destroy()
    this.view = null
    this.promptText?.destroy()
    this.promptText = null
    this._clearMenuGraphics()
    this.menu = null
  }
}
