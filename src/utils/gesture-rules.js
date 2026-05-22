export const GESTURE_HOLD_MS = {
  PRAYER: 2000,
  FIST: 800,
  HOVER: 600,
}

export const SWIPE_THRESHOLD = 0.06

export function isPrayer(leftHand, rightHand) {
  if (!leftHand || !rightHand) return false

  const wristDeltaX = Math.abs(leftHand[0].x - rightHand[0].x)
  return wristDeltaX < 0.08
}

export function isSwipe(currentWristX, previousWristX) {
  if (typeof currentWristX !== 'number' || typeof previousWristX !== 'number') {
    return false
  }

  return Math.abs(currentWristX - previousWristX) > SWIPE_THRESHOLD
}

export function getIndexTipPosition(hand) {
  if (!hand?.[8]) return null

  return {
    x: 1 - hand[8].x,
    y: hand[8].y,
  }
}

export function isFist(hand) {
  if (!hand) return false

  const tips = [8, 12, 16, 20]
  const mcps = [5, 9, 13, 17]

  return tips.every((tip, index) => hand[tip].y > hand[mcps[index]].y)
}

export function getPrimaryHand(hands = []) {
  return hands[0] ?? null
}

export function getPrayerHands(hands = []) {
  return {
    leftHand: hands[0] ?? null,
    rightHand: hands[1] ?? null,
  }
}
