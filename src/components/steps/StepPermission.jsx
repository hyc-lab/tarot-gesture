import { memo, useEffect, useState } from 'react'
import ParticleBackground from '../ui/ParticleBackground'
import RitualText from '../ui/RitualText'

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'

let preloadPromise

function warmMediaPipeCdn() {
  if (!document.querySelector('link[data-mediapipe-preconnect]')) {
    const link = document.createElement('link')
    link.dataset.mediapipePreconnect = 'true'
    link.rel = 'preconnect'
    link.href = 'https://cdn.jsdelivr.net'
    document.head.appendChild(link)
  }
}

async function preloadMediaPipeHands() {
  if (!preloadPromise) {
    preloadPromise = import('@mediapipe/hands')
      .then(async ({ Hands }) => {
        const hands = new Hands({
          locateFile: (file) => `${MEDIAPIPE_CDN}${file}`,
        })

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.55,
        })

        await hands.initialize?.()
        hands.close?.()
      })
      .catch(() => undefined)
  }

  return preloadPromise
}

function StepPermission({ error, onRequestPermission }) {
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    warmMediaPipeCdn()
    preloadMediaPipeHands()
  }, [])

  async function handleStartRitual() {
    setIsOpening(true)
    preloadMediaPipeHands()

    try {
      await onRequestPermission()
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <section className="step-screen permission-screen">
      <ParticleBackground />
      <div className="permission-orb" aria-hidden="true" />
      <div className="step-panel permission-panel">
        <p className="eyebrow">Gesture Tarot</p>
        <RitualText
          as="h1"
          className="ritual-title"
          delay={60}
          text="牌阵感知到了你的存在……请允许它看见你的双手"
        />
        <p className="stage-copy">
          请保持双手在摄像头范围内，之后的流程将完全由手势驱动。
        </p>
        <button
          className="glow-button"
          disabled={isOpening}
          type="button"
          onClick={handleStartRitual}
        >
          {isOpening ? '正在唤醒牌阵…' : '开启仪式'}
        </button>
        {error ? <p className="error-copy">{error}</p> : null}
      </div>
    </section>
  )
}

export default memo(StepPermission)
