import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCarousel } from '../../hooks/useCarousel'
import TarotCard from '../ui/TarotCard'
import RitualText from '../ui/RitualText'

const CARD_COUNT = 9
const DESKTOP_RADIUS = 320
const COMPACT_RADIUS = 240
const SWIPE_COOLDOWN_MS = 400

function StepDraw({ draw, gestureState, onReveal }) {
  const carouselCards = useMemo(() => getCarouselCards(draw), [draw])
  const { carouselAngle, currentIndex, rotateLeft, rotateRight, stepAngle } = useCarousel(
    carouselCards.length,
  )
  const initialSwipeEventRef = useRef(gestureState.swipe.eventId)
  const initialFistEventRef = useRef(gestureState.fist.eventId)
  const lastSwipeAtRef = useRef(0)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [radius, setRadius] = useState(DESKTOP_RADIUS)

  useEffect(() => {
    const updateRadius = () => {
      setRadius(window.innerWidth < 900 ? COMPACT_RADIUS : DESKTOP_RADIUS)
    }

    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  useEffect(() => {
    if (gestureState.swipe.eventId <= initialSwipeEventRef.current || isSelecting) return

    const now = performance.now()
    if (now - lastSwipeAtRef.current < SWIPE_COOLDOWN_MS) return

    lastSwipeAtRef.current = now

    if (gestureState.swipe.direction === 'RIGHT') {
      rotateRight()
    }

    if (gestureState.swipe.direction === 'LEFT') {
      rotateLeft()
    }
  }, [
    gestureState.swipe.direction,
    gestureState.swipe.eventId,
    isSelecting,
    rotateLeft,
    rotateRight,
  ])

  const beginSelection = useCallback(() => {
    if (isSelecting) return

    setIsSelecting(true)
    window.setTimeout(() => setIsFlipped(true), 560)
    window.setTimeout(() => onReveal(currentIndex), 1780)
  }, [currentIndex, isSelecting, onReveal])

  useEffect(() => {
    if (isSelecting) return
    if (gestureState.fist.eventId <= initialFistEventRef.current) return

    beginSelection()
  }, [beginSelection, gestureState.fist.eventId, isSelecting])

  if (!carouselCards.length) {
    return (
      <section className="step-screen draw-screen">
        <div className="step-panel">
          <h1>牌阵正在整理牌序</h1>
          <button className="glow-button" type="button" onClick={() => onReveal(0)}>
            继续
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="step-screen draw-screen">
      <div className="draw-carousel-panel">
        <p className="eyebrow">Step 3 · Draw</p>
        <RitualText
          as="h1"
          className="ritual-title draw-title"
          delay={42}
          text="滑动旋转命运之轮，握拳确认当前之牌"
        />
        <div className={`carousel-container ${isSelecting ? 'is-selecting' : ''}`}>
          <motion.div
            className="carousel-scene"
            animate={{ rotateY: carouselAngle }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              '--carousel-radius': `${radius}px`,
            }}
          >
            <AnimatePresence>
              {carouselCards.map((cardDraw, index) => {
                const isSelected = index === currentIndex
                const angle = stepAngle * index

                if (isSelecting && !isSelected) {
                  return null
                }

                return (
                  <motion.div
                    className={`carousel-card ${isSelected ? 'is-selected' : ''} ${
                      isSelecting && !isSelected ? 'is-dispersing' : ''
                    }`}
                    custom={index}
                    data-testid={`carousel-card-${index}`}
                    key={`${cardDraw.card.id}-${index}`}
                    initial={{
                      opacity: 0,
                      rotateY: 0,
                      scale: 0.82,
                      z: 0,
                    }}
                    animate={
                      isSelecting && isSelected
                        ? {
                            opacity: 1,
                            rotateY: -carouselAngle,
                            scale: 1.2,
                            translateX: 0,
                            translateY: -8,
                            z: radius + 86,
                          }
                        : {
                            opacity: isSelected ? 1 : 0.5,
                            rotateY: angle,
                            scale: isSelected ? 1.08 : 1,
                            z: radius,
                          }
                    }
                    exit={{
                      opacity: 0,
                      rotateY: angle + 90,
                      z: radius * 2,
                      transition: {
                        delay: index * 0.03,
                        duration: 0.5,
                        ease: 'easeIn',
                      },
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <TarotCard
                      card={cardDraw.card}
                      flipped={isFlipped && isSelected}
                      glowing={isSelected}
                      reversed={cardDraw.isReversed}
                      size="sm"
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="carousel-instructions">
          <span>← 左滑上一张</span>
          <strong>{String(currentIndex + 1).padStart(2, '0')} / 09</strong>
          <span>右滑下一张 →</span>
        </div>
        <p className="stage-copy">
          正对你的牌会泛起金色光晕；握拳保持 0.8 秒，即可确认选择。
        </p>
        <button className="skip-button" type="button" onClick={beginSelection}>
          跳过手势，确认当前牌
        </button>
      </div>
    </section>
  )
}

function getCarouselCards(draw) {
  if (draw?.cards?.length) return draw.cards.slice(0, CARD_COUNT)
  if (draw?.card) return [draw]
  return []
}

export default memo(StepDraw)
