import { memo, useMemo } from 'react'

function ParticleBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        x: (index * 37) % 100,
        y: (index * 53) % 100,
        size: 1 + (index % 4),
        delay: (index % 12) * 0.35,
        duration: 7 + (index % 9),
      })),
    [],
  )

  return (
    <div className="particle-background" aria-hidden="true">
      {particles.map((particle) => (
        <span
          className="star-particle"
          key={particle.id}
          style={{
            '--particle-delay': `${particle.delay}s`,
            '--particle-duration': `${particle.duration}s`,
            '--particle-size': `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
        />
      ))}
    </div>
  )
}

export default memo(ParticleBackground)
