import { memo, useEffect, useRef } from 'react'
import CameraView from './CameraView'

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'

function GestureDetector({
  enabled,
  onResults,
  onStatusChange,
  statusLabel = 'idle',
  visible = true,
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const onResultsRef = useRef(onResults)
  const onStatusChangeRef = useRef(onStatusChange)

  useEffect(() => {
    onResultsRef.current = onResults
  }, [onResults])

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  useEffect(() => {
    if (!enabled || !videoRef.current) {
      return undefined
    }

    let cancelled = false
    let camera
    let hands

    async function startDetection() {
      try {
        onStatusChangeRef.current?.('loading')

        const [
          { Hands, HAND_CONNECTIONS },
          { Camera },
          { drawConnectors, drawLandmarks },
        ] = await Promise.all([
          import('@mediapipe/hands'),
          import('@mediapipe/camera_utils'),
          import('@mediapipe/drawing_utils'),
        ])

        if (cancelled) return

        hands = new Hands({
          locateFile: (file) => `${MEDIAPIPE_CDN}${file}`,
        })

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        })

        hands.onResults((results) => {
          if (cancelled) return

          drawHandOverlay(results, HAND_CONNECTIONS, drawConnectors, drawLandmarks)
          onResultsRef.current?.(results)
        })

        camera = new Camera(videoRef.current, {
          width: 640,
          height: 480,
          onFrame: async () => {
            if (cancelled || !videoRef.current || videoRef.current.readyState < 2) return
            await hands.send({ image: videoRef.current })
          },
        })

        await camera.start()

        if (!cancelled) {
          onStatusChangeRef.current?.('active')
        }
      } catch (error) {
        if (!cancelled) {
          console.error('GestureDetector failed to start:', error)
          onStatusChangeRef.current?.('error')
        }
      }
    }

    function drawHandOverlay(results, handConnections, drawConnectors, drawLandmarks) {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)

      results.multiHandLandmarks?.forEach((landmarks) => {
        drawConnectors(context, landmarks, handConnections, {
          color: 'rgba(240, 192, 64, 0.85)',
          lineWidth: 2,
        })
        drawLandmarks(context, landmarks, {
          color: 'rgba(232, 213, 255, 0.92)',
          lineWidth: 1,
          radius: 2,
        })
      })
    }

    startDetection()

    return () => {
      cancelled = true
      camera?.stop?.()
      hands?.close?.()
      onStatusChangeRef.current?.('idle')
    }
  }, [enabled])

  return (
    <CameraView
      canvasRef={canvasRef}
      hidden={!visible}
      statusLabel={statusLabel}
      videoRef={videoRef}
    />
  )
}

export default memo(GestureDetector)
