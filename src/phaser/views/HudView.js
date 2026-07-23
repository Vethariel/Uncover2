import { HUD_HEIGHT } from '../../config/constants.js'
import { sumSpecializedFragments } from '../../config/crafting.js'
import { evaluateN7Trial, isN7Level } from '../../config/n7Trial.js'
import {
  COLOR_TITLE,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiImage, createUiNineSlice } from '../ui/uiAtlas.js'

const DEPTH = 1000
const ICON = 32
const HEART_X = 36
const PAD = 10
const CLUSTER_GAP = 14
const ICON_VALUE_GAP = 4
const VALUE_SLOT = 24
const FRAGMENT_VALUE_SLOT = 36
const PANEL_FILL = 0x0a0e14

const RESOURCE_SLOTS = [
  { key: 'bronze', icon: 'bronze_icon', valueSlot: VALUE_SLOT },
  { key: 'iron', icon: 'iron_icon', valueSlot: VALUE_SLOT },
  { key: 'crystal', icon: 'crystal_icon', valueSlot: VALUE_SLOT },
]

function slotWidth(valueSlot) {
  return ICON + ICON_VALUE_GAP + valueSlot
}

export class HudView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world

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

    this.heartIcon = createUiImage(scene, 'heart_icon', HEART_X, midY)
    this.livesText = scene.add.text(
      HEART_X,
      midY + 1,
      '',
      textStyleDisplay({ fontSize: '14px', color: '#ffffff' }),
    ).setOrigin(0.5)

    const centerSlots = [
      ...RESOURCE_SLOTS,
      { key: 'fragment', icon: 'fragment_icon', valueSlot: FRAGMENT_VALUE_SLOT },
    ]
    const clusterW = centerSlots.reduce(
      (sum, slot, i) => sum + slotWidth(slot.valueSlot) + (i > 0 ? CLUSTER_GAP : 0),
      0,
    )
    let x = Math.round(width / 2 - clusterW / 2)

    this.resourceNodes = []
    for (const slot of RESOURCE_SLOTS) {
      const icon = createUiImage(scene, slot.icon, x + ICON / 2, midY)
      const value = scene.add.text(
        x + ICON + ICON_VALUE_GAP,
        midY,
        '0',
        textStyleBody({ fontSize: '13px', color: '#c8d0d8' }),
      ).setOrigin(0, 0.5)
      x += slotWidth(slot.valueSlot) + CLUSTER_GAP
      this.resourceNodes.push({ ...slot, icon, value })
    }

    this.fragmentIcon = createUiImage(scene, 'fragment_icon', x + ICON / 2, midY)
    this.fragmentText = scene.add.text(
      x + ICON + ICON_VALUE_GAP,
      midY,
      '0',
      textStyleBody({ fontSize: '13px', color: '#c8d0d8' }),
    ).setOrigin(0, 0.5)

    this.timerText = scene.add.text(
      width - PAD,
      midY,
      '',
      textStyleBody({ fontSize: '13px', color: COLOR_TITLE }),
    ).setOrigin(1, 0.5)

    this.container.add([
      this.bannerFill,
      this.banner,
      this.heartIcon,
      this.livesText,
      ...this.resourceNodes.flatMap(({ icon, value }) => [icon, value]),
      this.fragmentIcon,
      this.fragmentText,
      this.timerText,
    ])
  }

  update() {
    const player = this.world.player
    const resources = this.world.runResources ?? { bronze: 0, iron: 0, crystal: 0 }
    const fragments = this.world.runFragments ?? { generic: 0, specialized: {} }
    const specialized = sumSpecializedFragments(fragments)

    this.livesText.setText(`${Math.max(0, player.lives)}`)

    for (const node of this.resourceNodes) {
      node.value.setText(`${resources[node.key] ?? 0}`)
    }
    this.fragmentText.setText(`${fragments.generic ?? 0}+${specialized}`)

    if (this.world.levelTimer === null) {
      this.timerText.setText('')
      return
    }

    const seconds = Math.ceil(this.world.levelTimer)
    if (isN7Level(this.world.currentLevelIndex)) {
      const trial = evaluateN7Trial(this.world, this.world.levelVisualConfig ?? {})
      this.timerText.setText(`OFICIO ${trial.score}/${trial.quota}  ${seconds}s`)
      this.timerText.setColor(trial.passed ? '#78d7e8' : '#ffc857')
    } else {
      this.timerText.setText(`TIEMPO ${seconds}`)
      this.timerText.setColor('#ffc857')
    }
  }

  destroy() {
    this.container.destroy(true)
  }
}
