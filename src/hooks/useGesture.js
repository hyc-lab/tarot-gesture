import { useCallback, useRef, useState } from 'react'
import {
  GESTURE_HOLD_MS,
  getIndexTipPosition,
  getPrayerHands,
  getPrimaryHand,
  getSwipeDirection,
  isFist,
  isPrayer,
  isSwipe,
} from '../utils/gesture-rules'

const SWIPE_COOLDOWN_MS = 450
const LOST_HAND_HINT_MS = 30000

const initialHold = {
  active: false,
  progress: 0,
  eventId: 0,
}

export const initialGestureState = {
  handsCount: 0,
  indexTip: null,
  noHandsTooLong: false,
  prayer: initialHold,
  fist: initialHold,
  swipe: {
    direction: null,
    eventId: 0,
    lastAt: 0,
  },
}

function updateHold(holdRef, active, holdMs, now) {
  if (!active) {
    holdRef.current.startedAt = null
    holdRef.current.completed = false
    return {
      active: false,
      completedNow: false,
      progress: 0,
    }
  }

  if (holdRef.current.startedAt === null) {
    holdRef.current.startedAt = now
  }

  const elapsed = now - holdRef.current.startedAt
  const progress = Math.min(elapsed / holdMs, 1)
  const completedNow = progress >= 1 && !holdRef.current.completed

  if (completedNow) {
    holdRef.current.completed = true
  }

  return {
    active: true,
    completedNow,
    progress,
  }
}

function createHoldRef() {
  return {
    current: {
      completed: false,
      startedAt: null,
    },
  }
}

export function useGesture() {
  const [gestureState, setGestureState] = useState(initialGestureState)
  const prayerHoldRef = useRef(createHoldRef().current)
  const fistHoldRef = useRef(createHoldRef().current)
  const previousWristXRef = useRef(null)
  const lastSwipeAtRef = useRef(0)
  const lastHandsAtRef = useRef(0)

  const resetGesture = useCallback(() => {
    prayerHoldRef.current = createHoldRef().current
    fistHoldRef.current = createHoldRef().current
    previousWristXRef.current = null
    lastSwipeAtRef.current = 0
    lastHandsAtRef.current = performance.now()
    setGestureState(initialGestureState)
  }, [])

  const handleResults = useCallback((results) => {
    const now = performance.now()
    if (lastHandsAtRef.current === 0) {
      lastHandsAtRef.current = now
    }

    const hands = results?.multiHandLandmarks ?? []
    const primaryHand = getPrimaryHand(hands)
    const { leftHand, rightHand } = getPrayerHands(hands)
    const hasHands = hands.length > 0

    if (!hasHands) {
      prayerHoldRef.current.startedAt = null
      prayerHoldRef.current.completed = false
      fistHoldRef.current.startedAt = null
      fistHoldRef.current.completed = false
      previousWristXRef.current = null

      setGestureState((currentState) => ({
        ...currentState,
        handsCount: 0,
        indexTip: null,
        noHandsTooLong: now - lastHandsAtRef.current > LOST_HAND_HINT_MS,
        prayer: {
          ...currentState.prayer,
          active: false,
          progress: 0,
        },
        fist: {
          ...currentState.fist,
          active: false,
          progress: 0,
        },
      }))
      return
    }

    lastHandsAtRef.current = now

    const prayerHold = updateHold(
      prayerHoldRef,
      isPrayer(leftHand, rightHand),
      GESTURE_HOLD_MS.PRAYER,
      now,
    )
    const fistHold = updateHold(fistHoldRef, isFist(primaryHand), GESTURE_HOLD_MS.FIST, now)
    const indexTip = getIndexTipPosition(primaryHand)
    const currentWristX = primaryHand ? 1 - primaryHand[0].x : null
    const swipeDirection = getSwipeDirection(currentWristX, previousWristXRef.current)
    const swipeDetected =
      currentWristX !== null &&
      isSwipe(currentWristX, previousWristXRef.current) &&
      now - lastSwipeAtRef.current > SWIPE_COOLDOWN_MS

    if (swipeDetected) {
      lastSwipeAtRef.current = now
    }

    previousWristXRef.current = currentWristX

    setGestureState((currentState) => ({
      handsCount: hands.length,
      indexTip,
      noHandsTooLong: false,
      prayer: {
        active: prayerHold.active,
        progress: prayerHold.progress,
        eventId: prayerHold.completedNow
          ? currentState.prayer.eventId + 1
          : currentState.prayer.eventId,
      },
      fist: {
        active: fistHold.active,
        progress: fistHold.progress,
        eventId: fistHold.completedNow
          ? currentState.fist.eventId + 1
          : currentState.fist.eventId,
      },
      swipe: {
        direction: swipeDetected ? swipeDirection : currentState.swipe.direction,
        eventId: swipeDetected ? currentState.swipe.eventId + 1 : currentState.swipe.eventId,
        lastAt: swipeDetected ? now : currentState.swipe.lastAt,
      },
    }))
  }, [])

  return {
    gestureState,
    handleResults,
    resetGesture,
  }
}
