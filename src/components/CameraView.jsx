import { memo } from 'react'

function CameraView({ canvasRef, hidden = false, statusLabel = 'idle', videoRef }) {
  return (
    <aside
      className={`camera-view ${hidden ? 'camera-view--hidden' : ''}`}
      aria-label="摄像头手势识别画面"
    >
      <video
        ref={videoRef}
        className="camera-video"
        muted
        playsInline
        autoPlay
      />
      <canvas ref={canvasRef} className="camera-canvas" />
      <span className="camera-status">{statusLabel}</span>
    </aside>
  )
}

export default memo(CameraView)
