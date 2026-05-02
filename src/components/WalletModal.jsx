import { X, Wallet, Plus, TrendingUp, Clock } from 'lucide-react'
import { WALLET_PACKAGES } from '../services/razorpay'
import { useRazorpay } from '../hooks/useRazorpay'
import { useWalletStore } from '../store'

export default function WalletModal({ isOpen, onClose }) {
  const { topUpWallet, isLoading } = useRazorpay()
  const { balance, transactions } = useWalletStore()

  if (!isOpen) return null

  const handleTopUp = async (pkg) => {
    await topUpWallet(pkg.amount)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative cosmic-card w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-cosmic-950/80">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cosmic-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white">My Wallet</h2>
              <p className="text-xs text-cosmic-400">Powered by Razorpay</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cosmic-800/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-cosmic-400" />
          </button>
        </div>

        {/* Balance */}
        <div className="p-6 bg-gradient-to-r from-cosmic-800/40 to-cosmic-900/40 border-b border-cosmic-700/30">
          <p className="text-cosmic-400 text-sm mb-1">Available Balance</p>
          <p className="font-display text-4xl font-bold text-gradient">₹{balance.toFixed(2)}</p>
          <p className="text-xs text-cosmic-500 mt-1">* Balance deducted per minute during calls</p>
        </div>

        {/* Recharge Packages */}
        <div className="p-6 border-b border-cosmic-700/30">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold-400" />
            Add Money
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {WALLET_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => handleTopUp(pkg)}
                disabled={isLoading}
                className={`relative p-4 rounded-xl border transition-all text-left hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  pkg.popular
                    ? 'border-gold-500/50 bg-gold-500/10 hover:bg-gold-500/20'
                    : 'border-cosmic-700/40 bg-cosmic-800/40 hover:bg-cosmic-700/40'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold-500 text-cosmic-950 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Best Value
                  </span>
                )}
                <p className={`font-display font-bold text-xl ${pkg.popular ? 'text-gold-400' : 'text-white'}`}>
                  {pkg.label}
                </p>
                {pkg.bonus > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">+₹{pkg.bonus} bonus</p>
                )}
                <p className="text-xs text-cosmic-400 mt-1">{pkg.coins} coins</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-cosmic-500 mt-3 text-center">
            🔒 100% secure payments via Razorpay. UPI, Cards, NetBanking accepted.
          </p>
        </div>

        {/* Recent Transactions */}
        <div className="p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cosmic-400" />
            Recent Transactions
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-cosmic-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(txn => (
                <div key={txn.id} className="flex items-center justify-between py-3 border-b border-cosmic-800/40 last:border-0">
                  <div>
                    <p className="text-sm text-stardust">{txn.description}</p>
                    <p className="text-xs text-cosmic-500">
                      {new Date(txn.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`font-semibold text-sm ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
