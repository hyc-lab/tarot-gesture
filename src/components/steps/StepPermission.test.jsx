import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import StepPermission from './StepPermission'

vi.mock('@mediapipe/hands', () => new Promise(() => {}))

describe('StepPermission', () => {
  it('requests camera permission without waiting for MediaPipe preload', async () => {
    const onRequestPermission = vi.fn().mockResolvedValue()

    render(<StepPermission error="" onRequestPermission={onRequestPermission} />)
    fireEvent.click(screen.getByRole('button', { name: '开启仪式' }))

    await waitFor(() => {
      expect(onRequestPermission).toHaveBeenCalledTimes(1)
    })
  })
})
