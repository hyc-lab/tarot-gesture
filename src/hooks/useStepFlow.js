import { useCallback, useMemo, useState } from 'react'
import tarotDeck from '../data/tarot.json'

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
    const draw = drawRandomArcana(deck, random)
    setPendingDraw(draw)
    setRevealedDraw(null)
    setCurrentStep(STEPS.DRAW)
  }, [deck, random])

  const revealPendingCard = useCallback(() => {
    setRevealedDraw((currentReveal) => currentReveal ?? pendingDraw)
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
