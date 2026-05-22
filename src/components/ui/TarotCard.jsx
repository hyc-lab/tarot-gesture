import { memo } from 'react'

function TarotCard({
  card,
  className = '',
  flipped = false,
  glowing = false,
  reversed = false,
  size = 'md',
}) {
  const cardNumber = String(card?.id ?? 0).padStart(2, '0')
  const keywords = card?.keywords?.slice(0, 3) ?? []

  return (
    <article
      className={[
        'tarot-card',
        `tarot-card--${size}`,
        glowing ? 'tarot-card--glowing' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={card ? `${card.name} ${card.name_en}` : '塔罗牌'}
    >
      <div
        className={[
          'card-inner',
          flipped ? 'flipped' : '',
          flipped && reversed ? 'reversed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="card-face card-back">
          <div className="card-back-ring" />
          <div className="card-back-star">✦</div>
          <span className="card-back-label">Arcana</span>
        </div>
        <div className="card-face card-front">
          <span className="card-number">{cardNumber}</span>
          <div className="card-art-placeholder">
            <span className="card-sigil">☾</span>
          </div>
          <h2>{card?.name ?? '未知之牌'}</h2>
          <p>{card?.name_en ?? 'Unknown Arcana'}</p>
          <div className="card-keywords" aria-label="关键词">
            {keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export default memo(TarotCard)
