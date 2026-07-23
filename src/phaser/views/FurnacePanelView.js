import Phaser from 'phaser'
import { MATERIALS } from '../../config/miningTypes.js'
import { SMELT_RECIPES } from '../../config/crafting.js'
import {
  COLOR_TITLE,
  FONT_SIZE_HUD,
  textStyleBody,
} from '../../config/typography.js'
import { createUiButton } from '../ui/uiButton.js'
import {
  createUiList,
  createWorkshopPanelChrome,
  UI_LIST_ROW_HEIGHT,
} from '../ui/uiList.js'

const PANEL_W = 360
const PANEL_H = 248

const MATERIAL_LABEL = {
  bronze: 'Bronce',
  iron: 'Hierro',
  crystal: 'Cristal',
}

/**
 * Panel del horno: lista de fundición + timer + recoger.
 */
export class FurnacePanelView {
  constructor(scene, gameState, { onClose, onChanged }) {
    this.scene = scene
    this.gameState = gameState
    this.onClose = onClose
    this.onChanged = onChanged

    const cx = scene.scale.width / 2
    const cy = scene.scale.height / 2 + 8
    this.panelX = Math.round(cx - PANEL_W / 2)
    this.panelY = Math.round(cy - PANEL_H / 2)

    this.dim = scene.add.rectangle(
      cx,
      cy,
      scene.scale.width,
      scene.scale.height,
      0x000000,
      0.45,
    ).setScrollFactor(0).setDepth(1140).setInteractive()

    this.chrome = createWorkshopPanelChrome(scene, {
      x: this.panelX,
      y: this.panelY,
      width: PANEL_W,
      height: PANEL_H,
      icon: 'forge_icon',
      title: 'HORNO — FUNDICIÓN',
      depth: 1150,
    })

    this.statusText = scene.add.text(
      this.chrome.contentX,
      this.chrome.contentY,
      '',
      textStyleBody({ fontSize: `${FONT_SIZE_HUD}px`, color: COLOR_TITLE }),
    ).setScrollFactor(0).setDepth(1160)

    this.list = createUiList(scene, {
      x: this.chrome.contentX,
      y: this.chrome.contentY + 22,
      width: this.chrome.contentW,
      height: UI_LIST_ROW_HEIGHT * 3 + 12,
      depth: 1160,
      onSelect: (item) => this._tryStart(item.material),
    })

    this.collectBtn = createUiButton(scene, {
      x: cx,
      y: this.panelY + PANEL_H - 36,
      width: 120,
      height: 28,
      label: 'Recoger',
      depth: 1165,
      onClick: () => this._collect(),
    })
    this.collectBtn.bg.setScrollFactor(0)
    this.collectBtn.text.setScrollFactor(0)
    this.collectBtn.bg.setVisible(false)
    this.collectBtn.text.setVisible(false)

    this.refresh()
  }

  refresh() {
    const job = this.gameState.furnaceJob
    const items = MATERIALS.map((material) => {
      const recipe = SMELT_RECIPES[material]
      const enough = (this.gameState.workshopCrude[material] ?? 0) >= recipe.crude
      const busy = Boolean(job)
      const muted = !enough || busy
      return {
        material,
        muted,
        text: `Fundir ${MATERIAL_LABEL[material]}  (${recipe.crude}→${recipe.refined})`,
      }
    })
    this.list.setItems(items, true)

    if (job?.ready) {
      this.statusText.setText(
        `${MATERIAL_LABEL[job.material]} listo — recoge el refinado`,
      )
      this.collectBtn.bg.setVisible(true)
      this.collectBtn.text.setVisible(true)
    } else if (job) {
      const sec = Math.ceil(job.remaining)
      this.statusText.setText(
        `Fundiendo ${MATERIAL_LABEL[job.material]}… ${sec}s`,
      )
      this.collectBtn.bg.setVisible(false)
      this.collectBtn.text.setVisible(false)
    } else {
      this.statusText.setText('Elige un material (ENTER / click)')
      this.collectBtn.bg.setVisible(false)
      this.collectBtn.text.setVisible(false)
    }
  }

  _tryStart(material) {
    const result = this.gameState.startSmelt(material)
    if (result.ok) {
      this.gameState.save()
      this.onChanged?.({ kind: 'smeltStart', material })
      this.refresh()
    }
  }

  _collect() {
    const result = this.gameState.collectSmelt()
    if (result.ok) {
      this.gameState.save()
      this.onChanged?.({ kind: 'smeltCollect', ...result })
      this.refresh()
    }
  }

  handleInput(inputAdapter) {
    if (inputAdapter.isJustDown('escape')) {
      this.onClose?.()
      return
    }
    if (inputAdapter.isJustDown('enter')) {
      if (this.gameState.furnaceJob?.ready) {
        this._collect()
        return
      }
      const item = this.list.getSelected()
      if (item && !item.muted) this._tryStart(item.material)
      return
    }
    const JustDown = Phaser.Input.Keyboard.JustDown
    if (JustDown(inputAdapter.keys.up) || JustDown(inputAdapter.keys.upArrow)) {
      this.list.move(-1)
    }
    if (JustDown(inputAdapter.keys.down) || JustDown(inputAdapter.keys.downArrow)) {
      this.list.move(1)
    }
  }

  destroy() {
    this.dim.destroy()
    this.chrome.destroy()
    this.statusText.destroy()
    this.list.destroy()
    this.collectBtn.destroy()
  }
}
