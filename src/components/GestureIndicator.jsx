import { memo } from 'react'
import { STEPS } from '../hooks/useStepFlow'

const stepLabels = {
  [STEPS.PERMISSION]: '等待授权',
  [STEPS.QUESTION]: '双手合十',
  [STEPS.SHUFFLE]: '挥手洗牌',
  [STEPS.DRAW]: '悬停握拳',
  [STEPS.REVEAL]: '聆听解读',
}

function GestureIndicator({ currentStep, detectorStatus, gestureState }) {
  const activeGesture = getActiveGesture(gestureState)

  return (
    <aside className="gesture-indicator" aria-live="polite">
      <div>
        <span className="indicator-label">仪式阶段</span>
        <strong>{stepLabels[currentStep]}</strong>
      </div>
      <div>
        <span className="indicator-label">手势状态</span>
        <strong>{activeGesture}</strong>
      </div>
      <div className="indicator-row">
        <span>{gestureState.handsCount} hand(s)</span>
        <span>{detectorStatus}</span>
      </div>
      {gestureState.noHandsTooLong ? (
        <p className="indicator-hint">牌阵暂时失去你的双手，可使用屏幕上的跳过按钮。</p>
      ) : null}
    </aside>
  )
}

function getActiveGesture(gestureState) {
  if (gestureState.prayer.active) return `PRAYER ${Math.round(gestureState.prayer.progress * 100)}%`
  if (gestureState.fist.active) return `FIST ${Math.round(gestureState.fist.progress * 100)}%`
  if (gestureState.indexTip) return 'HOVER READY'
  return 'LISTENING'
}

export default memo(GestureIndicator)
