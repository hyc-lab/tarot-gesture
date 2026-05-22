import { memo, useEffect, useMemo, useRef, useState } from 'react'

function RitualText({
  as: Element = 'p',
  className = '',
  delay = 45,
  startDelay = 0,
  text,
  onComplete,
}) {
  const characters = useMemo(() => Array.from(text), [text])
  const intervalRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        setVisibleCount((currentCount) => {
          if (currentCount >= characters.length) {
            window.clearInterval(intervalRef.current)
            onComplete?.()
            return currentCount
          }

          return currentCount + 1
        })
      }, delay)
    }, startDelay)

    return () => {
      window.clearTimeout(startTimer)
      window.clearInterval(intervalRef.current)
    }
  }, [characters.length, delay, onComplete, startDelay])

  return (
    <Element className={className} aria-label={text}>
      {characters.slice(0, visibleCount).join('')}
      <span className="ritual-cursor" aria-hidden="true">
        |
      </span>
    </Element>
  )
}

export default memo(RitualText)
