import { memo, useState } from 'react'
import RitualText from '../ui/RitualText'

function StepQuestion({ onComplete, question, setQuestion }) {
  const [isComplete, setIsComplete] = useState(false)

  function handleConfirmQuestion() {
    if (isComplete) return
    setIsComplete(true)
    window.setTimeout(onComplete, 520)
  }

  return (
    <section className="step-screen question-screen">
      <div className={`step-panel question-panel ${isComplete ? 'is-bursting' : ''}`}>
        <p className="eyebrow">Step 1 · Question</p>
        <RitualText
          as="h1"
          className="ritual-title"
          delay={42}
          text="将你的问题写下，确认后再唤醒手势仪式"
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
          style={{ '--gesture-progress': isComplete ? '100%' : '0%' }}
          aria-label="问题确认仪式"
        >
          <span>确认</span>
        </div>
        <p className="stage-copy">确认问题后，摄像头小窗会开启，接下来再用手势洗牌。</p>
        <button
          className="glow-button question-confirm-button"
          type="button"
          onClick={handleConfirmQuestion}
        >
          {isComplete ? '正在进入洗牌…' : '确认问题，进入洗牌'}
        </button>
      </div>
    </section>
  )
}

export default memo(StepQuestion)
