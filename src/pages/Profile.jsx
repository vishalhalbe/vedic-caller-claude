import { User, Settings, LogOut, Wallet, Star } from 'lucide-react'
import { useAuthStore, useWalletStore } from '../store'
import { Link, useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { balance, transactions } = useWalletStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <div className="pt-24 text-center px-4">
        <User className="w-12 h-12 text-cosmic-600 mx-auto mb-4" />
        <h2 className="font-display text-2xl text-white mb-2">Not Logged In</h2>
        <p className="text-cosmic-400 mb-6">Please login to view your profile</p>
        <Link to="/" className="btn-primary">Go to Home</Link>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const consultations = transactions.filter(t => t.type === 'debit').length
  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0)

  return (
    <div className="pt-16 min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="cosmic-card p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-400 to-gold-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-xl shadow-cosmic-500/20">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 className="font-display text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-cosmic-400 text-sm mt-1">{user.email}</p>
          {user.phone && <p className="text-cosmic-400 text-sm">{user.phone}</p>}
          <p className="text-xs text-cosmic-600 mt-2">
            Member since {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Wallet', value: `₹${balance.toFixed(0)}`, icon: Wallet, color: 'text-gold-400' },
            { label: 'Sessions', value: consultations, icon: Star, color: 'text-cosmic-300' },
            { label: 'Spent', value: `₹${totalSpent.toFixed(0)}`, icon: User, color: 'text-emerald-400' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="cosmic-card p-4 text-center">
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className="font-bold text-white text-lg">{stat.value}</p>
                <p className="text-xs text-cosmic-500">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="cosmic-card divide-y divide-cosmic-800/40">
          <Link to="/wallet" className="flex items-center gap-3 p-4 hover:bg-cosmic-800/30 transition-colors">
            <Wallet className="w-5 h-5 text-gold-400" />
            <span className="text-stardust">My Wallet</span>
          </Link>
          <button className="flex items-center gap-3 p-4 hover:bg-cosmic-800/30 transition-colors w-full text-left">
            <Settings className="w-5 h-5 text-cosmic-400" />
            <span className="text-stardust">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors w-full text-left text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
