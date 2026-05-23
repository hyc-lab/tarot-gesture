import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import tarotDeck from '../data/tarot.json'
import { DRAW_CANDIDATE_COUNT, STEPS, drawRandomArcana, useStepFlow } from './useStepFlow'

describe('tarot data', () => {
  it('contains all 22 major arcana cards with sequential ids', () => {
    expect(tarotDeck).toHaveLength(22)
    expect(tarotDeck.map((card) => card.id)).toEqual(Array.from({ length: 22 }, (_, id) => id))
  })
})

describe('useStepFlow', () => {
  it('moves through permission, question, shuffle, draw, and reveal', () => {
    const random = vi.fn().mockReturnValue(0.1)
    const { result } = renderHook(() => useStepFlow(tarotDeck, random))

    expect(result.current.currentStep).toBe(STEPS.PERMISSION)

    act(() => result.current.allowCamera())
    expect(result.current.currentStep).toBe(STEPS.QUESTION)

    act(() => result.current.completeQuestion())
    expect(result.current.currentStep).toBe(STEPS.SHUFFLE)

    act(() => result.current.completeShuffle())
    expect(result.current.currentStep).toBe(STEPS.DRAW)
    expect(result.current.pendingDraw.cards).toHaveLength(DRAW_CANDIDATE_COUNT)
    expect(result.current.pendingDraw.cards[0].card.id).toBe(2)
    expect(result.current.pendingDraw.cards[0].isReversed).toBe(true)

    act(() => result.current.revealPendingCard(0))
    expect(result.current.currentStep).toBe(STEPS.REVEAL)
    expect(result.current.revealedDraw.card.id).toBe(2)

    act(() => result.current.restartQuestion())
    expect(result.current.currentStep).toBe(STEPS.QUESTION)
    expect(result.current.pendingDraw).toBeNull()
  })

  it('draws a clamped random arcana and orientation', () => {
    const draw = drawRandomArcana(tarotDeck, vi.fn().mockReturnValueOnce(0.999).mockReturnValueOnce(0.9))

    expect(draw.card.id).toBe(21)
    expect(draw.isReversed).toBe(false)
  })
})
