import { useState } from 'react'
import { X, Star, Eye, EyeOff } from 'lucide-react'
import { useAuthStore, useWalletStore } from '../store'
import toast from 'react-hot-toast'

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login') // login | signup
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const { login } = useAuthStore()
  const { addBalance } = useWalletStore()

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock auth — in production, call your backend
    const user = {
      id: `u_${Date.now()}`,
      name: mode === 'signup' ? form.name : 'Cosmic User',
      email: form.email,
      phone: form.phone,
      joinedAt: new Date().toISOString(),
    }
    login(user, `token_${Date.now()}`)

    if (mode === 'signup') {
      addBalance(50, '🎁 Welcome Bonus')
      toast.success('Welcome to CosmicSage! ₹50 bonus added to your wallet 🌟')
    } else {
      toast.success(`Welcome back! 🌟`)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative cosmic-card w-full max-w-sm shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
                <span className="font-display font-bold text-xl text-gradient">CosmicSage</span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              {mode === 'signup' && (
                <p className="text-xs text-emerald-400 mt-1">🎁 Get ₹50 welcome bonus!</p>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-cosmic-800/50 rounded-lg transition-colors">
              <X className="w-4 h-4 text-cosmic-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                className="input-cosmic"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            )}
            <input
              className="input-cosmic"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            {mode === 'signup' && (
              <input
                className="input-cosmic"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            )}
            <div className="relative">
              <input
                className="input-cosmic pr-12"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-400 hover:text-cosmic-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" className="btn-primary w-full">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-cosmic-400 mt-4">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-cosmic-300 hover:text-white underline"
            >
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
