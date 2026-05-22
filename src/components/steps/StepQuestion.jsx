import { memo, useEffect, useRef, useState } from 'react'
import RitualText from '../ui/RitualText'

function StepQuestion({ gestureState, onComplete, question, setQuestion }) {
  const initialPrayerEventRef = useRef(gestureState.prayer.eventId)
  const [isComplete, setIsComplete] = useState(false)
  const progress = gestureState.prayer.progress

  useEffect(() => {
    if (gestureState.prayer.eventId <= initialPrayerEventRef.current || isComplete) return

    setIsComplete(true)
    const timer = window.setTimeout(onComplete, 520)

    return () => window.clearTimeout(timer)
  }, [gestureState.prayer.eventId, isComplete, onComplete])

  return (
    <section className="step-screen question-screen">
      <div className={`step-panel question-panel ${isComplete ? 'is-bursting' : ''}`}>
        <p className="eyebrow">Step 1 · Question</p>
        <RitualText
          as="h1"
          className="ritual-title"
          delay={42}
          text="将你的问题注入双手，双手合十，屏息凝神"
        />
        <label className="question-field">
          <span>你的问题</span>
          <input
            value={question}
            placeholder="「我想知道……」"
            onChange={(event) => setQuestion(event.target.value)}
          />
        </label>
        <div
          className="hold-orb"
          style={{ '--gesture-progress': `${Math.round(progress * 100)}%` }}
          aria-label={`双手合十确认进度 ${Math.round(progress * 100)}%`}
        >
          <span>合十</span>
        </div>
        <p className="stage-copy">保持双手合十 2 秒，牌阵会记住你的提问。</p>
        <button className="skip-button" type="button" onClick={onComplete}>
          跳过手势，进入洗牌
        </button>
      </div>
    </section>
  )
}

export default memo(StepQuestion)
