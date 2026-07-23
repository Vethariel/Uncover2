import { HUD_HEIGHT } from '../../config/constants.js'
import { sumSpecializedFragments } from '../../config/crafting.js'
import {
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiImage, createUiNineSlice } from '../ui/uiAtlas.js'

const DEPTH = 1000
const ICON = 28
const PAD = 8
const CLUSTER_GAP = 10
const ICON_VALUE_GAP = 3
const VALUE_SLOT = 20
const PANEL_FILL = 0x0a0e14

const CRUDE_SLOTS = [
  { key: 'bronze', icon: 'bronze_icon' },
  { key: 'iron', icon: 'iron_icon' },
  { key: 'crystal', icon: 'crystal_icon' },
]

function slotW() {
  return ICON + ICON_VALUE_GAP + VALUE_SLOT
}

/**
 * HUD del hub: crudo (iconos), refinado (placeholders), fragmentos.
 */
export class WorkshopHudView {
  constructor(scene, gameState) {
    this.scene = scene
    this.gameState = gameState
    const width = scene.scale.width
    const midY = HUD_HEIGHT / 2

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH)

    this.bannerFill = scene.add.rectangle(
      2,
      2,
      width - 4,
      HUD_HEIGHT - 4,
      PANEL_FILL,
      0.94,
    ).setOrigin(0)

    this.banner = createUiNineSlice(scene, 'hud_frame', 0, 0, width, HUD_HEIGHT)

    this.title = scene.add.text(
      PAD + 4,
      midY,
      'TALLER',
      textStyleDisplay({ fontSize: '13px' }),
    ).setOrigin(0, 0.5)

    this.crudeNodes = []
    this.refinedNodes = []

    let x = 72
    for (const slot of CRUDE_SLOTS) {
      const icon = createUiImage(scene, slot.icon, x + ICON / 2, midY - 1, {
        displayWidth: ICON,
        displayHeight: ICON,
      })
      const value = scene.add.text(
        x + ICON + ICON_VALUE_GAP,
        midY,
        '0',
        textStyleBody({ fontSize: '12px', color: '#c8d0d8' }),
      ).setOrigin(0, 0.5)
      this.crudeNodes.push({ key: slot.key, icon, value })
      x += slotW() + 4
    }

    x += CLUSTER_GAP
    this.refLabel = scene.add.text(
      x,
      midY,
      'Ref',
      textStyleBody({ fontSize: '10px', color: '#6f7780' }),
    ).setOrigin(0, 0.5)
    x += 22

    for (const slot of CRUDE_SLOTS) {
      const ph = createUiImage(scene, 'item_placeholder', x + ICON / 2, midY, {
        displayWidth: 20,
        displayHeight: 20,
      }).setAlpha(0.85)
      const tintIcon = createUiImage(scene, slot.icon, x + ICON / 2, midY, {
        displayWidth: 14,
        displayHeight: 14,
      }).setAlpha(0.55)
      const value = scene.add.text(
        x + ICON + ICON_VALUE_GAP - 4,
        midY,
        '0',
        textStyleBody({ fontSize: '12px', color: '#9aa3ad' }),
      ).setOrigin(0, 0.5)
      this.refinedNodes.push({ key: slot.key, ph, tintIcon, value })
      x += slotW() + 2
    }

    x += CLUSTER_GAP
    this.fragIcon = createUiImage(scene, 'fragment_icon', x + ICON / 2, midY, {
      displayWidth: ICON,
      displayHeight: ICON,
    })
    this.fragValue = scene.add.text(
      x + ICON + ICON_VALUE_GAP,
      midY,
      '0',
      textStyleBody({ fontSize: '12px', color: '#c8d0d8' }),
    ).setOrigin(0, 0.5)

    this.container.add([
      this.bannerFill,
      this.banner,
      this.title,
      ...this.crudeNodes.flatMap((n) => [n.icon, n.value]),
      this.refLabel,
      ...this.refinedNodes.flatMap((n) => [n.ph, n.tintIcon, n.value]),
      this.fragIcon,
      this.fragValue,
    ])

    this.refresh()
  }

  refresh() {
    const c = this.gameState.workshopCrude
    const r = this.gameState.workshopRefined
    const f = this.gameState.workshopFragments
    for (const node of this.crudeNodes) {
      node.value.setText(String(c[node.key] ?? 0))
    }
    for (const node of this.refinedNodes) {
      node.value.setText(String(r[node.key] ?? 0))
    }
    const specialized = sumSpecializedFragments(f)
    this.fragValue.setText(`${f.generic}+${specialized}`)
  }

  destroy() {
    this.container.destroy(true)
  }
}
