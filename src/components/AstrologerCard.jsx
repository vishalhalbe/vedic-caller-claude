import { Link } from 'react-router-dom'
import { Star, MessageCircle, Phone, Video, Award } from 'lucide-react'

export default function AstrologerCard({ astrologer }) {
  const { id, name, image, skills, languages, experience, rating, reviews, ratePerMin, status, featured, callTypes } = astrologer

  const statusConfig = {
    online: { cls: 'badge-online', dot: 'bg-emerald-400', label: 'Online' },
    busy: { cls: 'badge-busy', dot: 'bg-amber-400', label: 'Busy' },
    offline: { cls: 'badge-offline', dot: 'bg-gray-400', label: 'Offline' },
  }
  const statusInfo = statusConfig[status] || statusConfig.offline

  return (
    <Link
      to={`/astrologer/${id}`}
      className="cosmic-card p-5 hover:border-cosmic-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-500/10 hover:-translate-y-1 group block"
    >
      {/* Top Row */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-cosmic-700/50 group-hover:border-cosmic-500/50 transition-colors"
          />
          {/* Status dot */}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cosmic-950 ${statusInfo.dot}`} />
          {featured && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
              <Award className="w-3 h-3 text-cosmic-950" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-gold-300 transition-colors truncate">
              {name}
            </h3>
            <span className={statusInfo.cls}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          <p className="text-xs text-cosmic-400 mt-0.5 truncate">
            {skills.slice(0, 2).join(' • ')}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span className="text-sm font-semibold text-gold-300">{rating}</span>
            <span className="text-xs text-cosmic-500">({(reviews / 1000).toFixed(1)}k)</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 mt-4 text-xs text-cosmic-400">
        <span>{experience} yrs</span>
        <span className="w-1 h-1 bg-cosmic-600 rounded-full" />
        <span>{languages[0]}{languages.length > 1 ? ` +${languages.length - 1}` : ''}</span>
        <span className="w-1 h-1 bg-cosmic-600 rounded-full" />
        <span className="text-cosmic-300">{astrologer.totalConsultations?.toLocaleString()} sessions</span>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-cosmic-800/40">
        {/* Price */}
        <div>
          <span className="text-lg font-bold text-white">₹{ratePerMin}</span>
          <span className="text-xs text-cosmic-500">/min</span>
        </div>

        {/* Call type icons */}
        <div className="flex items-center gap-1.5">
          {callTypes?.includes('chat') && (
            <div className="w-8 h-8 rounded-lg bg-cosmic-800/60 flex items-center justify-center hover:bg-cosmic-700/60 transition-colors">
              <MessageCircle className="w-4 h-4 text-cosmic-300" />
            </div>
          )}
          {callTypes?.includes('audio') && (
            <div className="w-8 h-8 rounded-lg bg-cosmic-800/60 flex items-center justify-center hover:bg-cosmic-700/60 transition-colors">
              <Phone className="w-4 h-4 text-cosmic-300" />
            </div>
          )}
          {callTypes?.includes('video') && (
            <div className="w-8 h-8 rounded-lg bg-cosmic-800/60 flex items-center justify-center hover:bg-cosmic-700/60 transition-colors">
              <Video className="w-4 h-4 text-cosmic-300" />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
