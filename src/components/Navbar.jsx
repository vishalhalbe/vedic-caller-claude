import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, User, Menu, X, Star, Phone } from 'lucide-react'
import { useWalletStore, useAuthStore } from '../store'
import WalletModal from './WalletModal'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const location = useLocation()
  const { balance } = useWalletStore()
  const { isAuthenticated, user } = useAuthStore()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/astrologers', label: 'Astrologers' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cosmic-950/80 backdrop-blur-xl border-b border-cosmic-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-cosmic-500 flex items-center justify-center shadow-lg shadow-cosmic-500/30">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-cosmic-500/30 blur-md group-hover:blur-lg transition-all" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">CosmicSage</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link text-sm ${location.pathname === link.to ? 'text-white' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Wallet Balance */}
                  <button
                    onClick={() => setWalletOpen(true)}
                    className="hidden sm:flex items-center gap-2 bg-cosmic-800/60 hover:bg-cosmic-700/60 border border-cosmic-700/40 rounded-xl px-3 py-2 transition-all"
                  >
                    <Wallet className="w-4 h-4 text-gold-400" />
                    <span className="text-sm font-semibold text-stardust">₹{balance.toFixed(0)}</span>
                  </button>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 bg-cosmic-800/60 hover:bg-cosmic-700/60 border border-cosmic-700/40 rounded-xl px-3 py-2 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cosmic-400 to-gold-500 flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-stardust">{user?.name || 'Profile'}</span>
                  </Link>
                </>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-primary text-sm py-2 px-4">
                  Login / Sign Up
                </button>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-cosmic-300 hover:text-white transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-cosmic-950/95 backdrop-blur-xl border-t border-cosmic-800/40 px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block nav-link py-2"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => { setWalletOpen(true); setMenuOpen(false) }}
                className="flex items-center gap-2 text-stardust py-2"
              >
                <Wallet className="w-4 h-4 text-gold-400" />
                Wallet: ₹{balance.toFixed(0)}
              </button>
            )}
          </div>
        )}
      </nav>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
