import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCarousel } from './useCarousel'

describe('useCarousel', () => {
  it('rotates through card indexes and exposes the scene angle', () => {
    const { result } = renderHook(() => useCarousel(9))

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.carouselAngle).toBe(0)

    act(() => result.current.rotateRight())
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.carouselAngle).toBe(-40)

    act(() => result.current.rotateLeft())
    expect(result.current.currentIndex).toBe(0)

    act(() => result.current.rotateLeft())
    expect(result.current.currentIndex).toBe(8)
    expect(result.current.carouselAngle).toBe(-320)
  })
})
