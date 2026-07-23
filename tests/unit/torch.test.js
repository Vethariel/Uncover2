import { describe, expect, it } from 'vitest'
import {
  TORCH_FRAME_COUNT,
  torchAnimFrame,
  torchFlickerFactor,
  torchLightIntensity,
} from '../../src/config/torch.js'

describe('torch flicker', () => {
  it('peaks at frame 4', () => {
    const factors = Array.from({ length: TORCH_FRAME_COUNT }, (_, f) => (
      torchFlickerFactor(f)
    ))
    const peak = Math.max(...factors)
    expect(torchFlickerFactor(4)).toBeCloseTo(peak, 10)
    expect(torchFlickerFactor(4)).toBeCloseTo(1, 10)
    expect(torchFlickerFactor(0)).toBeLessThan(torchFlickerFactor(4))
    expect(torchFlickerFactor(8)).toBeLessThan(torchFlickerFactor(4))
  })

  it('maps light intensity to the same sine (peak = base)', () => {
    expect(torchLightIntensity(4, 10)).toBeCloseTo(10, 5)
    expect(torchLightIntensity(0, 10)).toBeLessThan(10)
    expect(torchLightIntensity(0, 10)).toBeGreaterThanOrEqual(5.5)
  })

  it('advances frames from time and phase offset', () => {
    expect(torchAnimFrame(0, 0)).toBe(0)
    expect(torchAnimFrame(0.4, 0)).toBe(4) // 0.4s * 10 fps
    expect(torchAnimFrame(0, 4 / 9)).toBe(4)
  })
})
