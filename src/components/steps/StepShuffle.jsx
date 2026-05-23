import { motion, useAnimationControls } from 'framer-motion'
import { memo, useEffect, useRef, useState } from 'react'
import RitualText from '../ui/RitualText'

const TARGET_SWIPES = 3
const CARD_COUNT = 9
const RADIUS = 320

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    rotateY: 0,
    scale: 0.8,
    z: 0,
  },
  visible: (index) => ({
    opacity: 1,
    rotateY: (360 / CARD_COUNT) * index,
    scale: 1,
    z: RADIUS,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

function StepShuffle({ gestureState, onComplete }) {
  const initialSwipeEventRef = useRef(gestureState.swipe.eventId)
  const completedRef = useRef(false)
  const deckControls = useAnimationControls()
  const [isComplete, setIsComplete] = useState(false)
  const [swipeCount, setSwipeCount] = useState(0)

  useEffect(() => {
    if (gestureState.swipe.eventId <= initialSwipeEventRef.current || completedRef.current) return

    setSwipeCount((currentCount) => {
      const nextCount = Math.min(currentCount + 1, TARGET_SWIPES)
      deckControls.start({
        rotate: [0, -9, 12, -5, 0],
        scale: [1, 1.04, 0.98, 1.03, 1],
        x: [0, -18, 24, -8, 0],
        transition: { duration: 0.46 },
      })

      if (nextCount >= TARGET_SWIPES) {
        completedRef.current = true
        window.setTimeout(() => setIsComplete(true), 300)
        window.setTimeout(onComplete, 1900)
      }

      return nextCount
    })
  }, [deckControls, gestureState.swipe.eventId, onComplete])

  function completeByFallback() {
    if (completedRef.current) return

    completedRef.current = true
    setSwipeCount(TARGET_SWIPES)
    setIsComplete(true)
    window.setTimeout(onComplete, 1150)
  }

  return (
    <section className="step-screen shuffle-screen">
      <div className="step-panel shuffle-panel">
        <p className="eyebrow">Step 2 · Shuffle</p>
        <RitualText
          as="h1"
          className="ritual-title"
          delay={42}
          text={isComplete ? '牌阵展开，命运环绕于你……' : '挥动双手，打乱命运之序……'}
        />
        <div className={`shuffle-ritual-space ${isComplete ? 'is-expanded' : ''}`}>
          {!isComplete ? (
            <motion.div
              className="shuffle-deck"
              animate={deckControls}
              data-testid="shuffle-deck"
            >
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} style={{ '--deck-offset': `${index * 2}px` }} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="shuffle-carousel-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              data-testid="shuffle-carousel"
            >
              <motion.div className="shuffle-carousel-scene">
                {Array.from({ length: CARD_COUNT }, (_, index) => (
                  <motion.span
                    className="shuffle-carousel-card"
                    custom={index}
                    key={index}
                    variants={cardVariants}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
        <div className="shuffle-stars" aria-label={`挥手计数 ${swipeCount}/3`}>
          {Array.from({ length: TARGET_SWIPES }, (_, index) => (
            <span className={index < swipeCount ? 'is-lit' : ''} key={index}>
              ✦
            </span>
          ))}
        </div>
        <p className="stage-copy">
          {isComplete ? '下一阶段可左右滑动旋转圆柱牌阵。' : '检测到 3 次挥手后，牌阵会展开成圆柱。'}
        </p>
        <button className="skip-button" type="button" onClick={completeByFallback}>
          跳过手势，完成洗牌
        </button>
      </div>
    </section>
  )
}

export default memo(StepShuffle)
