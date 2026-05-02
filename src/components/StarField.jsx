import { useMemo } from 'react'

export default function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 4 + 3}s`,
      opacity: Math.random() * 0.7 + 0.2,
    }))
  }, [])

  return (
    <div className="stars-container" aria-hidden="true">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
      {/* Nebula blobs */}
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          top: '10%', left: '5%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(112,40,228,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          bottom: '15%', right: '10%',
          width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
