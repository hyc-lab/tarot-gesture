import { memo, useEffect, useRef } from 'react'
import CameraView from './CameraView'

const MEDIAPIPE_ASSET_BASE = `${import.meta.env.BASE_URL}mediapipe/hands/`

function GestureDetector({
  enabled,
  onResults,
  onStatusChange,
  statusLabel = 'idle',
  stream,
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
    let hands
    let animationFrameId
    let isSendingFrame = false
    let ownedStream

    async function startDetection() {
      try {
        onStatusChangeRef.current?.('camera-loading')

        const activeStream = stream ?? (await requestCameraStream())
        ownedStream = stream ? null : activeStream

        if (cancelled) return

        await attachStreamToVideo(videoRef.current, activeStream)

        if (cancelled) return

        onStatusChangeRef.current?.('preview')

        const [
          { Hands, HAND_CONNECTIONS },
          { drawConnectors, drawLandmarks },
        ] = await Promise.all([
          import('@mediapipe/hands'),
          import('@mediapipe/drawing_utils'),
        ])

        if (cancelled) return

        hands = new Hands({
          locateFile: (file) => `${MEDIAPIPE_ASSET_BASE}${file}`,
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

        if (!cancelled) {
          onStatusChangeRef.current?.('active')
          scheduleFrame()
        }
      } catch (error) {
        if (!cancelled) {
          console.error('GestureDetector failed to start:', error)
          onStatusChangeRef.current?.(videoRef.current?.srcObject ? 'preview-only' : 'camera-error')
        }
      }
    }

    async function requestCameraStream() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not available in this browser')
      }

      return navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })
    }

    async function attachStreamToVideo(video, activeStream) {
      if (!video) {
        throw new Error('Video element is not ready')
      }

      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream
      }

      video.muted = true
      video.playsInline = true
      try {
        await video.play()
      } catch (error) {
        console.warn('Camera preview play was blocked, continuing with attached stream:', error)
      }
    }

    function scheduleFrame() {
      animationFrameId = window.requestAnimationFrame(processFrame)
    }

    async function processFrame() {
      if (cancelled || !videoRef.current || !hands) return

      if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !isSendingFrame) {
        isSendingFrame = true

        try {
          await hands.send({ image: videoRef.current })
        } catch (error) {
          if (!cancelled) {
            console.error('GestureDetector frame failed:', error)
            onStatusChangeRef.current?.('preview-only')
          }
        } finally {
          isSendingFrame = false
        }
      }

      if (!cancelled) {
        scheduleFrame()
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
      window.cancelAnimationFrame(animationFrameId)
      hands?.close?.()
      if (ownedStream) {
        ownedStream.getTracks().forEach((track) => track.stop())
      }
      onStatusChangeRef.current?.('idle')
    }
  }, [enabled, stream])

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
