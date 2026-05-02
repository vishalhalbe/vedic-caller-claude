import { Link } from 'react-router-dom'
import { Star, Shield, Clock, ChevronRight, Sparkles, Phone, Video, MessageCircle } from 'lucide-react'
import { useAstrologerStore } from '../store'
import AstrologerCard from '../components/AstrologerCard'

export default function Home() {
  const { featured } = useAstrologerStore()

  const FEATURES = [
    { icon: Shield, title: '100% Private', desc: 'Your consultations are completely confidential and secure.' },
    { icon: Clock, title: '24/7 Available', desc: 'Connect with astrologers anytime, day or night.' },
    { icon: Star, title: 'Verified Experts', desc: 'All astrologers are vetted with proven track records.' },
  ]

  const SERVICES = [
    { icon: MessageCircle, label: 'Chat', desc: 'Text chat with astrologers', color: 'from-blue-500 to-cosmic-500' },
    { icon: Phone, label: 'Audio Call', desc: 'Voice consultation', color: 'from-emerald-500 to-teal-500' },
    { icon: Video, label: 'Video Call', desc: 'Face-to-face session', color: 'from-gold-500 to-amber-500' },
  ]

  const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        {/* Glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7028e4 0%, #f59e0b 50%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cosmic-800/60 border border-cosmic-600/40 rounded-full px-4 py-1.5 mb-6 text-sm">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-cosmic-200">India's Most Trusted Astrology Platform</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Stars Speak,</span>
            <br />
            <span className="text-gradient">We Listen</span>
          </h1>

          <p className="text-lg text-cosmic-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with expert astrologers via live chat, audio & video calls.
            Get personalized predictions for love, career, finances and more.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/astrologers" className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
              Talk to Astrologer
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/astrologers" className="btn-outline text-base px-8 py-4 flex items-center gap-2 justify-center">
              <Star className="w-4 h-4 text-gold-400" />
              Explore Services
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-cosmic-400">
            <span>⭐ 4.8/5 Rating</span>
            <span className="w-1 h-1 bg-cosmic-600 rounded-full" />
            <span>🔮 50,000+ Astrologers</span>
            <span className="w-1 h-1 bg-cosmic-600 rounded-full" />
            <span>👥 10M+ Users</span>
          </div>
        </div>
      </section>

      {/* Zodiac Ticker */}
      <div className="overflow-hidden border-y border-cosmic-800/40 bg-cosmic-900/30 py-4">
        <div className="flex gap-8 animate-[slide_20s_linear_infinite] whitespace-nowrap">
          {[...ZODIAC_SIGNS, ...ZODIAC_SIGNS, ...ZODIAC_SIGNS].map((sign, i) => (
            <span key={i} className="text-2xl opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              {sign}
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-white mb-3">
            Connect Your Way
          </h2>
          <p className="text-center text-cosmic-400 mb-10">Choose how you want to consult our expert astrologers</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SERVICES.map(svc => {
              const Icon = svc.icon
              return (
                <Link
                  key={svc.label}
                  to="/astrologers"
                  className="cosmic-card p-6 text-center hover:border-cosmic-500/50 transition-all hover:-translate-y-1 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{svc.label}</h3>
                  <p className="text-sm text-cosmic-400">{svc.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Astrologers */}
      <section className="py-16 px-4 bg-cosmic-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Top Astrologers</h2>
              <p className="text-cosmic-400 mt-1">Highly rated experts available now</p>
            </div>
            <Link to="/astrologers" className="flex items-center gap-1 text-cosmic-300 hover:text-white transition-colors text-sm">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(a => <AstrologerCard key={a.id} astrologer={a} />)}
          </div>
        </div>
      </section>

      {/* Why CosmicSage */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-white mb-12">
            Why Choose CosmicSage?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cosmic-800/60 border border-cosmic-700/40 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-cosmic-400 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center cosmic-card p-10 border-cosmic-600/30">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Start Your Cosmic Journey
          </h2>
          <p className="text-cosmic-300 mb-8">
            Get ₹50 free credits on signup. First consultation at just ₹1/min.
          </p>
          <Link to="/astrologers" className="btn-gold inline-flex items-center gap-2 text-base px-8 py-4">
            <Star className="w-5 h-5 fill-current" />
            Consult Now — First Min Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cosmic-800/40 py-8 px-4 text-center text-sm text-cosmic-600">
        <p>© 2025 CosmicSage. All rights reserved.</p>
        <p className="mt-1">Powered by Agora RTC • Payments by Razorpay</p>
      </footer>
    </div>
  )
}
