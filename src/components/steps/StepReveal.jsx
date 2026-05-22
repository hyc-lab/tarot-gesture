import { motion } from 'framer-motion'
import { memo, useEffect, useRef } from 'react'
import TarotCard from '../ui/TarotCard'
import RitualText from '../ui/RitualText'

function StepReveal({ draw, gestureState, onRestart }) {
  const initialSwipeEventRef = useRef(gestureState.swipe.eventId)

  useEffect(() => {
    if (gestureState.swipe.eventId <= initialSwipeEventRef.current) return
    onRestart()
  }, [gestureState.swipe.eventId, onRestart])

  if (!draw?.card) {
    return (
      <section className="step-screen reveal-screen">
        <div className="step-panel">
          <h1>牌面尚未显现</h1>
          <button className="glow-button" type="button" onClick={onRestart}>
            再问一次
          </button>
        </div>
      </section>
    )
  }

  const reading = draw.isReversed ? draw.card.reversed : draw.card.upright

  return (
    <section className="step-screen reveal-screen">
      <div className="reveal-layout">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <TarotCard
            card={draw.card}
            flipped
            glowing
            reversed={draw.isReversed}
            size="lg"
          />
        </motion.div>
        <div className="reveal-reading">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Step 4 · Reveal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.58 }}
          >
            {reading.title}
          </motion.h1>
          <motion.div
            className="keyword-pills"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.76, duration: 0.48 }}
          >
            {draw.card.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </motion.div>
          <RitualText
            key={`${draw.card.id}-${reading.title}`}
            className="reading-copy"
            delay={60}
            startDelay={1100}
            text={reading.reading}
          />
          <button className="glow-button reveal-button" type="button" onClick={onRestart}>
            🔄 再问一次
          </button>
          <p className="reveal-hint">也可以挥手重启牌阵。</p>
        </div>
      </div>
    </section>
  )
}

export default memo(StepReveal)
