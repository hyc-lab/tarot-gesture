import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { GESTURE_HOLD_MS } from '../../utils/gesture-rules'
import TarotCard from '../ui/TarotCard'
import RitualText from '../ui/RitualText'

function StepDraw({ draw, gestureState, onReveal }) {
  const cardRef = useRef(null)
  const hoverStartedAtRef = useRef(null)
  const initialFistEventRef = useRef(gestureState.fist.eventId)
  const revealStartedRef = useRef(false)
  const [hoverProgress, setHoverProgress] = useState(0)
  const [isGlowing, setIsGlowing] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    if (revealStartedRef.current) return

    if (!gestureState.indexTip || !cardRef.current) {
      hoverStartedAtRef.current = null
      setHoverProgress(0)
      setIsGlowing(false)
      return
    }

    const rect = cardRef.current.getBoundingClientRect()
    const pointer = {
      x: gestureState.indexTip.x * window.innerWidth,
      y: gestureState.indexTip.y * window.innerHeight,
    }
    const isInside =
      pointer.x >= rect.left &&
      pointer.x <= rect.right &&
      pointer.y >= rect.top &&
      pointer.y <= rect.bottom

    if (!isInside) {
      hoverStartedAtRef.current = null
      setHoverProgress(0)
      setIsGlowing(false)
      return
    }

    const now = performance.now()
    if (hoverStartedAtRef.current === null) {
      hoverStartedAtRef.current = now
    }

    const nextProgress = Math.min(
      (now - hoverStartedAtRef.current) / GESTURE_HOLD_MS.HOVER,
      1,
    )
    setHoverProgress(nextProgress)
    setIsGlowing(nextProgress >= 1)
  }, [gestureState.indexTip])

  const beginReveal = useCallback(() => {
    if (revealStartedRef.current) return

    revealStartedRef.current = true
    setIsGlowing(true)
    setIsFlipped(true)
    window.setTimeout(onReveal, 1220)
  }, [onReveal])

  useEffect(() => {
    if (!isGlowing || revealStartedRef.current) return
    if (gestureState.fist.eventId <= initialFistEventRef.current) return

    beginReveal()
  }, [beginReveal, gestureState.fist.eventId, isGlowing])

  if (!draw?.card) {
    return (
      <section className="step-screen draw-screen">
        <div className="step-panel">
          <h1>牌阵正在整理牌序</h1>
          <button className="glow-button" type="button" onClick={onReveal}>
            继续
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="step-screen draw-screen">
      {gestureState.indexTip ? (
        <span
          className="gesture-pointer"
          style={{
            left: `${gestureState.indexTip.x * 100}vw`,
            top: `${gestureState.indexTip.y * 100}vh`,
          }}
        />
      ) : null}
      <div className="step-panel draw-panel">
        <p className="eyebrow">Step 3 · Draw</p>
        <RitualText
          as="h1"
          className="ritual-title"
          delay={42}
          text="感受它的召唤，握拳选择"
        />
        <div
          ref={cardRef}
          className="draw-card-target"
          style={{ '--gesture-progress': `${Math.round(hoverProgress * 100)}%` }}
        >
          <TarotCard
            card={draw.card}
            flipped={isFlipped}
            glowing={isGlowing}
            reversed={draw.isReversed}
            size="lg"
          />
        </div>
        <p className="stage-copy">
          食指悬停到牌面 0.6 秒后，保持发光状态并握拳 0.8 秒完成选择。
        </p>
        <button className="skip-button" type="button" onClick={beginReveal}>
          跳过手势，直接抽牌
        </button>
      </div>
    </section>
  )
}

export default memo(StepDraw)
