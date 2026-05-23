import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGesture } from './useGesture'

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

describe('useGesture', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('emits a prayer confirmation after the hold threshold', () => {
    const nowSpy = vi.spyOn(performance, 'now')
    const { result } = renderHook(() => useGesture())
    const firstHand = makeHand({ 0: { x: 0.5 } })
    const secondHand = makeHand({ 0: { x: 0.55 } })

    nowSpy.mockReturnValue(1000)
    act(() => {
      result.current.handleResults({ multiHandLandmarks: [firstHand, secondHand] })
    })
    expect(result.current.gestureState.prayer.progress).toBe(0)

    nowSpy.mockReturnValue(3100)
    act(() => {
      result.current.handleResults({ multiHandLandmarks: [firstHand, secondHand] })
    })

    expect(result.current.gestureState.prayer.progress).toBe(1)
    expect(result.current.gestureState.prayer.eventId).toBe(1)
  })

  it('emits swipe and fist events from a primary hand', () => {
    const nowSpy = vi.spyOn(performance, 'now')
    const { result } = renderHook(() => useGesture())
    const openHand = makeHand({
      0: { x: 0.3 },
      5: { y: 0.35 },
      8: { x: 0.2, y: 0.2 },
      9: { y: 0.35 },
      12: { y: 0.2 },
      13: { y: 0.35 },
      16: { y: 0.2 },
      17: { y: 0.35 },
      20: { y: 0.2 },
    })
    const fistHand = makeHand({
      0: { x: 0.42 },
      5: { y: 0.35 },
      8: { x: 0.25, y: 0.7 },
      9: { y: 0.35 },
      12: { y: 0.72 },
      13: { y: 0.35 },
      16: { y: 0.73 },
      17: { y: 0.35 },
      20: { y: 0.74 },
    })

    nowSpy.mockReturnValue(1000)
    act(() => {
      result.current.handleResults({ multiHandLandmarks: [openHand] })
    })

    nowSpy.mockReturnValue(1500)
    act(() => {
      result.current.handleResults({ multiHandLandmarks: [fistHand] })
    })

    expect(result.current.gestureState.swipe.eventId).toBe(1)
    expect(result.current.gestureState.swipe.direction).toBe('RIGHT')
    expect(result.current.gestureState.indexTip).toEqual({ x: 0.75, y: 0.7 })

    nowSpy.mockReturnValue(2350)
    act(() => {
      result.current.handleResults({ multiHandLandmarks: [fistHand] })
    })

    expect(result.current.gestureState.fist.progress).toBe(1)
    expect(result.current.gestureState.fist.eventId).toBe(1)
  })
})
