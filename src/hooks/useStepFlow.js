import { useCallback, useMemo, useState } from 'react'
import tarotDeck from '../data/tarot.json'

export const DRAW_CANDIDATE_COUNT = 9

export const STEPS = {
  PERMISSION: 'permission',
  QUESTION: 'question',
  SHUFFLE: 'shuffle',
  DRAW: 'draw',
  REVEAL: 'reveal',
}

export function drawRandomArcana(deck = tarotDeck, random = Math.random) {
  const cardIndex = Math.min(Math.floor(random() * deck.length), deck.length - 1)

  return {
    card: deck[cardIndex],
    isReversed: random() < 0.3,
  }
}

export function drawCarouselArcana(
  deck = tarotDeck,
  random = Math.random,
  candidateCount = DRAW_CANDIDATE_COUNT,
) {
  return Array.from({ length: candidateCount }, () => drawRandomArcana(deck, random))
}

export function useStepFlow(deck = tarotDeck, random = Math.random) {
  const [currentStep, setCurrentStep] = useState(STEPS.PERMISSION)
  const [question, setQuestion] = useState('')
  const [pendingDraw, setPendingDraw] = useState(null)
  const [revealedDraw, setRevealedDraw] = useState(null)

  const allowCamera = useCallback(() => {
    setCurrentStep(STEPS.QUESTION)
  }, [])

  const completeQuestion = useCallback(() => {
    setCurrentStep(STEPS.SHUFFLE)
  }, [])

  const completeShuffle = useCallback(() => {
    const carouselDraws = drawCarouselArcana(deck, random)
    setPendingDraw({
      cards: carouselDraws,
      selectedIndex: 0,
    })
    setRevealedDraw(null)
    setCurrentStep(STEPS.DRAW)
  }, [deck, random])

  const revealPendingCard = useCallback((selectedIndex = pendingDraw?.selectedIndex ?? 0) => {
    const selectedDraw = pendingDraw?.cards?.[selectedIndex] ?? pendingDraw
    setPendingDraw((currentDraw) => {
      if (!currentDraw?.cards) return currentDraw

      return {
        ...currentDraw,
        selectedIndex,
      }
    })
    setRevealedDraw((currentReveal) => currentReveal ?? selectedDraw)
    setCurrentStep(STEPS.REVEAL)
  }, [pendingDraw])

  const restartQuestion = useCallback(() => {
    setPendingDraw(null)
    setRevealedDraw(null)
    setCurrentStep(STEPS.QUESTION)
  }, [])

  const resetAll = useCallback(() => {
    setQuestion('')
    setPendingDraw(null)
    setRevealedDraw(null)
    setCurrentStep(STEPS.PERMISSION)
  }, [])

  return useMemo(
    () => ({
      currentStep,
      question,
      pendingDraw,
      revealedDraw,
      allowCamera,
      completeQuestion,
      completeShuffle,
      resetAll,
      restartQuestion,
      revealPendingCard,
      setQuestion,
    }),
    [
      allowCamera,
      completeQuestion,
      completeShuffle,
      currentStep,
      pendingDraw,
      question,
      resetAll,
      restartQuestion,
      revealPendingCard,
      revealedDraw,
    ],
  )
}
