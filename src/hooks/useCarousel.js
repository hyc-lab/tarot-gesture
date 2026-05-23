import { useCallback, useMemo, useState } from 'react'

export function useCarousel(cardCount) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const safeCardCount = Math.max(cardCount, 1)
  const stepAngle = 360 / safeCardCount
  const carouselAngle = currentIndex === 0 ? 0 : -stepAngle * currentIndex

  const rotateRight = useCallback(() => {
    setCurrentIndex((previousIndex) => (previousIndex + 1) % safeCardCount)
  }, [safeCardCount])

  const rotateLeft = useCallback(() => {
    setCurrentIndex((previousIndex) => (previousIndex - 1 + safeCardCount) % safeCardCount)
  }, [safeCardCount])

  const setIndex = useCallback(
    (nextIndex) => {
      setCurrentIndex(((nextIndex % safeCardCount) + safeCardCount) % safeCardCount)
    },
    [safeCardCount],
  )

  return useMemo(
    () => ({
      carouselAngle,
      currentIndex,
      rotateLeft,
      rotateRight,
      setIndex,
      stepAngle,
    }),
    [carouselAngle, currentIndex, rotateLeft, rotateRight, setIndex, stepAngle],
  )
}
