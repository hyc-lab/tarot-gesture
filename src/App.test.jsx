import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('@mediapipe/hands', () => ({
  Hands: vi.fn(),
}))

vi.mock('./components/GestureDetector', () => ({
  default: ({ stream }) => (
    <div data-testid="gesture-detector">{stream ? 'camera-stream-ready' : 'no-stream'}</div>
  ),
}))

describe('App camera permission flow', () => {
  it('keeps the granted camera stream for gesture detection', async () => {
    const stop = vi.fn()
    const stream = {
      getTracks: () => [{ stop }],
    }
    const getUserMedia = vi.fn().mockResolvedValue(stream)

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '开启仪式' }))

    await waitFor(() => {
      expect(screen.getByTestId('gesture-detector')).toHaveTextContent('camera-stream-ready')
    })
    expect(stop).not.toHaveBeenCalled()
  })
})
