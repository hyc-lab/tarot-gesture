import { motion, useAnimationControls } from 'framer-motion'
import { memo, useEffect, useRef, useState } from 'react'
import RitualText from '../ui/RitualText'

const TARGET_SWIPES = 3

function StepShuffle({ gestureState, onComplete }) {
  const initialSwipeEventRef = useRef(gestureState.swipe.eventId)
  const completedRef = useRef(false)
  const controls = useAnimationControls()
  const [isComplete, setIsComplete] = useState(false)
  const [swipeCount, setSwipeCount] = useState(0)

  useEffect(() => {
    if (gestureState.swipe.eventId <= initialSwipeEventRef.current || completedRef.current) return

    setSwipeCount((currentCount) => {
      const nextCount = Math.min(currentCount + 1, TARGET_SWIPES)
      controls.start({
        rotate: [0, -9, 12, -5, 0],
        x: [0, -18, 24, -8, 0],
        transition: { duration: 0.46 },
      })

      if (nextCount >= TARGET_SWIPES) {
        completedRef.current = true
        setIsComplete(true)
        window.setTimeout(onComplete, 700)
      }

      return nextCount
    })
  }, [controls, gestureState.swipe.eventId, onComplete])

  return (
    <section className="step-screen shuffle-screen">
      <div className="step-panel shuffle-panel">
        <p className="eyebrow">Step 2 · Shuffle</p>
        <RitualText
          as="h1"
          className="ritual-title"
          delay={42}
          text="挥动双手，打乱命运之序……"
        />
        <motion.div
          className={`shuffle-deck ${isComplete ? 'is-complete' : ''}`}
          animate={controls}
        >
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} style={{ '--deck-offset': `${index * 2}px` }} />
          ))}
        </motion.div>
        <div className="shuffle-stars" aria-label={`挥手计数 ${swipeCount}/3`}>
          {Array.from({ length: TARGET_SWIPES }, (_, index) => (
            <span className={index < swipeCount ? 'is-lit' : ''} key={index}>
              ✦
            </span>
          ))}
        </div>
        <p className="stage-copy">检测到 3 次挥手后，牌序会完成重排。</p>
        <button className="skip-button" type="button" onClick={onComplete}>
          跳过手势，完成洗牌
        </button>
      </div>
    </section>
  )
}

export default memo(StepShuffle)
