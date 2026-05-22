import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import GestureDetector from './components/GestureDetector'
import GestureIndicator from './components/GestureIndicator'
import StepDraw from './components/steps/StepDraw'
import StepPermission from './components/steps/StepPermission'
import StepQuestion from './components/steps/StepQuestion'
import StepReveal from './components/steps/StepReveal'
import StepShuffle from './components/steps/StepShuffle'
import ParticleBackground from './components/ui/ParticleBackground'
import { useGesture } from './hooks/useGesture'
import { STEPS, useStepFlow } from './hooks/useStepFlow'

function App() {
  const flow = useStepFlow()
  const { gestureState, handleResults, resetGesture } = useGesture()
  const [permissionError, setPermissionError] = useState('')
  const [detectorStatus, setDetectorStatus] = useState('idle')

  const requestCameraPermission = useCallback(async () => {
    setPermissionError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError('当前浏览器无法开启摄像头，请使用桌面版 Chrome 或 Edge。')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      })

      stream.getTracks().forEach((track) => track.stop())
      flow.allowCamera()
    } catch (error) {
      setPermissionError(
        error?.name === 'NotAllowedError'
          ? '牌阵仍看不见你的双手，请在浏览器中允许摄像头权限。'
          : '摄像头开启失败，请确认设备可用后再试。',
      )
    }
  }, [flow])

  const restartQuestion = useCallback(() => {
    resetGesture()
    flow.restartQuestion()
  }, [flow, resetGesture])

  const renderStep = () => {
    switch (flow.currentStep) {
      case STEPS.PERMISSION:
        return (
          <StepPermission
            error={permissionError}
            onRequestPermission={requestCameraPermission}
          />
        )
      case STEPS.QUESTION:
        return (
          <StepQuestion
            gestureState={gestureState}
            question={flow.question}
            setQuestion={flow.setQuestion}
            onComplete={flow.completeQuestion}
          />
        )
      case STEPS.SHUFFLE:
        return (
          <StepShuffle
            gestureState={gestureState}
            onComplete={flow.completeShuffle}
          />
        )
      case STEPS.DRAW:
        return (
          <StepDraw
            draw={flow.pendingDraw}
            gestureState={gestureState}
            onReveal={flow.revealPendingCard}
          />
        )
      case STEPS.REVEAL:
        return (
          <StepReveal
            draw={flow.revealedDraw}
            gestureState={gestureState}
            onRestart={restartQuestion}
          />
        )
      default:
        return null
    }
  }

  const hasCamera = flow.currentStep !== STEPS.PERMISSION

  return (
    <main className="app-shell">
      <ParticleBackground />
      {hasCamera ? (
        <>
          <GestureDetector
            enabled={hasCamera}
            statusLabel={detectorStatus}
            visible={flow.currentStep !== STEPS.REVEAL}
            onResults={handleResults}
            onStatusChange={setDetectorStatus}
          />
          <GestureIndicator
            currentStep={flow.currentStep}
            detectorStatus={detectorStatus}
            gestureState={gestureState}
          />
        </>
      ) : null}
      <AnimatePresence mode="wait">
        <motion.div
          key={flow.currentStep}
          className="step-transition"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.46, ease: 'easeOut' }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

export default App
