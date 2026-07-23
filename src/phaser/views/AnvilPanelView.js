import Phaser from 'phaser'
import {
  EQUIPPED_SLOT_COUNT,
  placeholderFrameForRank,
  UPGRADE_DEFS,
} from '../../config/crafting.js'
import {
  COLOR_TITLE,
  FONT_SIZE_HINT,
  FONT_SIZE_HUD,
  textStyleBody,
} from '../../config/typography.js'
import { createSealToken } from '../ui/uiDragSeal.js'
import {
  createUiList,
  createWorkshopPanelChrome,
  UI_LIST_ROW_HEIGHT,
} from '../ui/uiList.js'
import { createUiNineSlice } from '../ui/uiAtlas.js'

const PANEL_W = 560
const PANEL_H = 300
const SLOT_SIZE = 32

/**
 * Panel del yunque: slots de equipo + inventario drag + recetas.
 */
export class AnvilPanelView {
  constructor(scene, gameState, { onClose, onChanged }) {
    this.scene = scene
    this.gameState = gameState
    this.onClose = onClose
    this.onChanged = onChanged
    this.sealTokens = []
    this.slotFrames = []
    this.slotSeals = []

    const cx = scene.scale.width / 2
    const cy = scene.scale.height / 2 + 6
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
      icon: 'anvil_icon',
      title: 'YUNQUE — SELLOS',
      depth: 1150,
    })

    const leftW = 250
    this.equipLabel = scene.add.text(
      this.chrome.contentX,
      this.chrome.contentY,
      'Equipo (máx. 4, tipos distintos)',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: '#c8d0d8' }),
    ).setScrollFactor(0).setDepth(1160)

    this.invLabel = scene.add.text(
      this.chrome.contentX,
      this.chrome.contentY + 52,
      'Sellos (arrastrar al slot)',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: '#c8d0d8' }),
    ).setScrollFactor(0).setDepth(1160)

    this.recipeLabel = scene.add.text(
      this.chrome.contentX + leftW + 8,
      this.chrome.contentY,
      'Recetas',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: '#c8d0d8' }),
    ).setScrollFactor(0).setDepth(1160)

    this.statusText = scene.add.text(
      this.chrome.contentX,
      this.panelY + PANEL_H - 28,
      '',
      textStyleBody({ fontSize: `${FONT_SIZE_HUD}px`, color: COLOR_TITLE }),
    ).setScrollFactor(0).setDepth(1160)

    this.slotCenters = []
    for (let i = 0; i < EQUIPPED_SLOT_COUNT; i++) {
      const sx = this.chrome.contentX + 20 + i * (SLOT_SIZE + 10)
      const sy = this.chrome.contentY + 28
      this.slotCenters.push({ x: sx, y: sy, index: i })
    }

    this.list = createUiList(scene, {
      x: this.chrome.contentX + leftW + 8,
      y: this.chrome.contentY + 16,
      width: this.chrome.contentW - leftW - 8,
      height: Math.max(UI_LIST_ROW_HEIGHT * 4 + 16, this.chrome.contentH - 36),
      depth: 1160,
      onSelect: (item) => {
        if (!item.muted) this._startCraft(item)
      },
    })

    this.refresh()
  }

  refresh() {
    this._rebuildSlots()
    this._rebuildInventory()
    this._rebuildRecipes()
    this._refreshStatus()
  }

  _refreshStatus() {
    const job = this.gameState.anvilJob
    if (job) {
      const def = UPGRADE_DEFS[job.upgradeId]
      this.statusText.setText(
        `Forjando ${def?.name ?? job.upgradeId} R${job.targetRank}… ${Math.ceil(job.remaining)}s`,
      )
    } else {
      this.statusText.setText('Click receta · arrastra sellos · click slot para quitar')
    }
  }

  _clearTokens(list) {
    for (const t of list) t.destroy()
    list.length = 0
  }

  _rebuildSlots() {
    this._clearTokens(this.slotSeals)
    for (const f of this.slotFrames) f.destroy()
    this.slotFrames = []

    for (const slot of this.slotCenters) {
      const upgradeId = this.gameState.equippedSeals[slot.index]
      const rank = upgradeId ? (this.gameState.workshopSeals[upgradeId] ?? 0) : 0
      const frameId = upgradeId ? placeholderFrameForRank(rank) : 'item_placeholder'
      const frame = createUiNineSlice(
        this.scene,
        frameId,
        slot.x - SLOT_SIZE / 2,
        slot.y - SLOT_SIZE / 2,
        SLOT_SIZE,
        SLOT_SIZE,
      ).setScrollFactor(0).setDepth(1158).setInteractive({ useHandCursor: true })
      if (!upgradeId) frame.setAlpha(0.45)
      frame.on('pointerup', () => {
        if (upgradeId) {
          this.gameState.unequipSealAt(slot.index)
          this.gameState.save()
          this.onChanged?.({ kind: 'unequip' })
          this.refresh()
        }
      })
      this.slotFrames.push(frame)

      if (upgradeId && rank > 0) {
        const token = createSealToken(this.scene, {
          x: slot.x,
          y: slot.y,
          upgradeId,
          rank,
          depth: 1162,
          draggable: true,
          onDragEnd: (id, pointer) => this._onDragEnd(id, pointer, slot.index),
        })
        this.slotSeals.push(token)
      }
    }
  }

  _rebuildInventory() {
    this._clearTokens(this.sealTokens)
    const ids = this.gameState.unequippedSeals()
    const baseX = this.chrome.contentX + 20
    const baseY = this.chrome.contentY + 72
    ids.forEach((upgradeId, i) => {
      const col = i % 5
      const row = Math.floor(i / 5)
      const rank = this.gameState.workshopSeals[upgradeId] ?? 0
      const token = createSealToken(this.scene, {
        x: baseX + col * (SLOT_SIZE + 8),
        y: baseY + row * (SLOT_SIZE + 8),
        upgradeId,
        rank,
        depth: 1165,
        draggable: true,
        onDragEnd: (id, pointer) => this._onDragEnd(id, pointer, null),
      })
      this.sealTokens.push(token)
    })
  }

  _rebuildRecipes() {
    const recipes = this.gameState.listAnvilRecipes()
    const items = recipes.map((r) => ({
      ...r,
      muted: !r.affordable,
      text: `${r.def.name} R${r.targetRank} — ${r.requirementsText}`,
    }))
    this.list.setItems(items, true)
  }

  _slotAt(pointer) {
    const sx = pointer.x
    const sy = pointer.y
    for (const slot of this.slotCenters) {
      if (
        Math.abs(sx - slot.x) <= SLOT_SIZE / 2 + 4
        && Math.abs(sy - slot.y) <= SLOT_SIZE / 2 + 4
      ) {
        return slot.index
      }
    }
    return -1
  }

  _onDragEnd(upgradeId, pointer, fromSlot) {
    const target = this._slotAt(pointer)
    if (target < 0) {
      // Soltar fuera: si venía de slot, desequipar; si de inventario, volver.
      if (fromSlot != null) {
        this.gameState.unequipSealAt(fromSlot)
        this.gameState.save()
        this.onChanged?.({ kind: 'unequip' })
      }
      this.refresh()
      return
    }

    // Si el destino tiene otro tipo, se reemplaza (sale al inventario).
    const occupying = this.gameState.equippedSeals[target]
    if (occupying && occupying !== upgradeId) {
      // unequip first then equip — equipSeal rejects duplicate elsewhere
      this.gameState.unequipSealAt(target)
    }

    // Quitar de slot origen si aplica
    if (fromSlot != null && fromSlot !== target) {
      this.gameState.unequipSealAt(fromSlot)
    }

    // Quitar duplicado en otro slot
    const dup = this.gameState.equippedSeals.findIndex(
      (id, i) => id === upgradeId && i !== target,
    )
    if (dup >= 0) this.gameState.unequipSealAt(dup)

    const result = this.gameState.equipSealAt(upgradeId, target)
    if (result.ok) {
      this.gameState.save()
      this.onChanged?.({ kind: 'equip', upgradeId })
    }
    this.refresh()
  }

  _startCraft(item) {
    const result = this.gameState.startCraft(item.upgradeId, item.targetRank)
    if (result.ok) {
      this.gameState.save()
      this.onChanged?.({ kind: 'craftStart', ...item })
      this.refresh()
    }
  }

  handleInput(inputAdapter) {
    if (inputAdapter.isJustDown('escape')) {
      this.onClose?.()
      return
    }
    if (inputAdapter.isJustDown('enter')) {
      const item = this.list.getSelected()
      if (item && !item.muted) this._startCraft(item)
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
    this._clearTokens(this.sealTokens)
    this._clearTokens(this.slotSeals)
    for (const f of this.slotFrames) f.destroy()
    this.dim.destroy()
    this.chrome.destroy()
    this.equipLabel.destroy()
    this.invLabel.destroy()
    this.recipeLabel.destroy()
    this.statusText.destroy()
    this.list.destroy()
  }
}
