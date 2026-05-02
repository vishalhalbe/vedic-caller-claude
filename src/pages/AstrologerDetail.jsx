import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Phone, Video, MessageCircle, Shield, Award, ChevronLeft, Wallet } from 'lucide-react'
import { useAstrologerStore, useAuthStore, useWalletStore } from '../store'
import CallModal from '../components/CallModal'
import WalletModal from '../components/WalletModal'
import AuthModal from '../components/AuthModal'
import toast from 'react-hot-toast'

export default function AstrologerDetail() {
  const { id } = useParams()
  const [activeCall, setActiveCall] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const { astrologers } = useAstrologerStore()
  const { isAuthenticated } = useAuthStore()
  const { balance } = useWalletStore()

  const astrologer = astrologers.find(a => a.id === id)

  if (!astrologer) {
    return (
      <div className="pt-24 text-center text-cosmic-500">
        <p className="text-5xl mb-4">🔮</p>
        <p>Astrologer not found</p>
        <Link to="/astrologers" className="btn-primary mt-4 inline-flex">Back to Listing</Link>
      </div>
    )
  }

  const handleCallClick = (type) => {
    if (!isAuthenticated) {
      setShowAuth(true)
      return
    }
    if (balance < astrologer.ratePerMin * 2) {
      toast.error('Insufficient balance. Please recharge your wallet first.')
      setShowWallet(true)
      return
    }
    if (astrologer.status === 'offline') {
      toast.error(`${astrologer.name} is currently offline.`)
      return
    }
    setActiveCall(type)
  }

  const statusConfig = {
    online: { cls: 'badge-online', label: 'Online Now' },
    busy: { cls: 'badge-busy', label: 'In Session' },
    offline: { cls: 'badge-offline', label: 'Offline' },
  }

  return (
    <div className="pt-16 min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link to="/astrologers" className="inline-flex items-center gap-1 text-cosmic-400 hover:text-white mb-6 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Astrologers
        </Link>

        {/* Profile Card */}
        <div className="cosmic-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={astrologer.image}
                alt={astrologer.name}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-cosmic-600/50"
              />
              {astrologer.featured && (
                <div className="absolute -top-2 -right-2 bg-gold-500 rounded-full p-1.5">
                  <Award className="w-3.5 h-3.5 text-cosmic-950" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">{astrologer.name}</h1>
                  <p className="text-cosmic-400 text-sm mt-0.5">{astrologer.skills.join(' • ')}</p>
                </div>
                <span className={statusConfig[astrologer.status]?.cls || 'badge-offline'}>
                  {statusConfig[astrologer.status]?.label}
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                    <span className="font-bold text-white">{astrologer.rating}</span>
                  </div>
                  <p className="text-xs text-cosmic-500">{(astrologer.reviews / 1000).toFixed(1)}k reviews</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-white block">{astrologer.experience}+</span>
                  <p className="text-xs text-cosmic-500">years exp.</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-white block">{astrologer.accuracy}%</span>
                  <p className="text-xs text-cosmic-500">accuracy</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-white block">{(astrologer.totalConsultations / 1000).toFixed(0)}k+</span>
                  <p className="text-xs text-cosmic-500">sessions</p>
                </div>
              </div>

              <p className="text-sm text-cosmic-300 leading-relaxed">{astrologer.bio}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-5">
            {/* Specializations */}
            <div className="cosmic-card p-5">
              <h3 className="font-semibold text-white mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {astrologer.specializations.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-cosmic-800/60 border border-cosmic-700/40 rounded-lg text-sm text-cosmic-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="cosmic-card p-5">
              <h3 className="font-semibold text-white mb-3">Languages</h3>
              <div className="flex gap-2">
                {astrologer.languages.map(l => (
                  <span key={l} className="px-3 py-1.5 bg-cosmic-800/60 border border-cosmic-700/40 rounded-lg text-sm text-white">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews placeholder */}
            <div className="cosmic-card p-5">
              <h3 className="font-semibold text-white mb-4">Client Reviews</h3>
              {[
                { name: 'Priya S.', rating: 5, text: 'Absolutely accurate predictions! Helped me navigate a career transition perfectly.' },
                { name: 'Rahul M.', rating: 5, text: 'Very insightful reading. Felt like they truly understood my situation.' },
                { name: 'Anita K.', rating: 4, text: 'Good consultation. Practical advice about my relationship.' },
              ].map((r, i) => (
                <div key={i} className="py-3 border-b border-cosmic-800/40 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{r.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-cosmic-400">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Consultation Panel */}
          <div className="space-y-4">
            <div className="cosmic-card p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-2xl font-bold text-white font-display">₹{astrologer.ratePerMin}</p>
                  <p className="text-xs text-cosmic-500">per minute</p>
                </div>
                <button
                  onClick={() => setShowWallet(true)}
                  className="flex items-center gap-1.5 text-xs bg-cosmic-800/60 border border-cosmic-700/40 rounded-lg px-3 py-2 text-cosmic-300 hover:text-white transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5 text-gold-400" />
                  ₹{balance.toFixed(0)}
                </button>
              </div>

              <div className="space-y-3">
                {astrologer.callTypes.includes('video') && (
                  <button
                    onClick={() => handleCallClick('video')}
                    className="btn-primary w-full flex items-center gap-2 justify-center"
                    disabled={astrologer.status === 'offline'}
                  >
                    <Video className="w-4 h-4" />
                    Video Call
                  </button>
                )}
                {astrologer.callTypes.includes('audio') && (
                  <button
                    onClick={() => handleCallClick('audio')}
                    className="btn-outline w-full flex items-center gap-2 justify-center"
                    disabled={astrologer.status === 'offline'}
                  >
                    <Phone className="w-4 h-4" />
                    Audio Call
                  </button>
                )}
                {astrologer.callTypes.includes('chat') && (
                  <button
                    onClick={() => handleCallClick('chat')}
                    className="btn-outline w-full flex items-center gap-2 justify-center"
                    disabled={astrologer.status === 'offline'}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat Now
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-cosmic-500 justify-center">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure & Private Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeCall && (
        <CallModal
          astrologer={astrologer}
          callType={activeCall}
          onClose={() => setActiveCall(null)}
        />
      )}
      <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
