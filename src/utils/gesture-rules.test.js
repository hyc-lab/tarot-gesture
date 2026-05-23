import { describe, expect, it } from 'vitest'
import {
  GESTURE_HOLD_MS,
  getIndexTipPosition,
  getSwipeDirection,
  isFist,
  isPrayer,
  isSwipe,
} from './gesture-rules'

function makeHand(overrides = {}) {
  const hand = Array.from({ length: 21 }, (_, index) => ({
    x: 0.5,
    y: 0.5 + index * 0.001,
    z: 0,
  }))

  Object.entries(overrides).forEach(([index, value]) => {
    hand[Number(index)] = { ...hand[Number(index)], ...value }
  })

  return hand
}

describe('gesture rules', () => {
  it('confirms prayer when both wrists are close', () => {
    const leftHand = makeHand({ 0: { x: 0.48 } })
    const rightHand = makeHand({ 0: { x: 0.54 } })

    expect(isPrayer(leftHand, rightHand)).toBe(true)
  })

  it('rejects prayer when a hand is missing or wrists are apart', () => {
    expect(isPrayer(null, makeHand())).toBe(false)
    expect(isPrayer(makeHand({ 0: { x: 0.2 } }), makeHand({ 0: { x: 0.4 } }))).toBe(false)
  })

  it('detects horizontal wrist swipes', () => {
    expect(isSwipe(0.5, 0.43)).toBe(true)
    expect(isSwipe(0.5, 0.47)).toBe(false)
  })

  it('detects mirrored swipe direction', () => {
    expect(getSwipeDirection(0.58, 0.5)).toBe('LEFT')
    expect(getSwipeDirection(0.42, 0.5)).toBe('RIGHT')
    expect(getSwipeDirection(0.52, 0.5)).toBeNull()
  })

  it('mirrors index fingertip coordinates for the UI', () => {
    const hand = makeHand({ 8: { x: 0.25, y: 0.7 } })

    expect(getIndexTipPosition(hand)).toEqual({ x: 0.75, y: 0.7 })
  })

  it('detects a fist when four fingertips bend below MCP joints', () => {
    const hand = makeHand({
      5: { y: 0.3 },
      8: { y: 0.6 },
      9: { y: 0.3 },
      12: { y: 0.62 },
      13: { y: 0.31 },
      16: { y: 0.63 },
      17: { y: 0.32 },
      20: { y: 0.64 },
    })

    expect(isFist(hand)).toBe(true)
  })

  it('exports required hold durations', () => {
    expect(GESTURE_HOLD_MS).toEqual({
      PRAYER: 2000,
      FIST: 800,
      HOVER: 600,
    })
  })
})
