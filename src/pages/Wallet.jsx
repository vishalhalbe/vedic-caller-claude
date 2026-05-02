import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useWalletStore } from '../store'
import { WALLET_PACKAGES } from '../services/razorpay'
import { useRazorpay } from '../hooks/useRazorpay'

export default function WalletPage() {
  const { balance, transactions } = useWalletStore()
  const { topUpWallet, isLoading } = useRazorpay()

  return (
    <div className="pt-16 min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-white mb-8">My Wallet</h1>

        {/* Balance Card */}
        <div className="cosmic-card p-8 mb-8 text-center bg-gradient-to-br from-cosmic-800/60 to-cosmic-900/80">
          <Wallet className="w-10 h-10 text-gold-400 mx-auto mb-3" />
          <p className="text-cosmic-400 text-sm">Available Balance</p>
          <p className="font-display text-5xl font-bold text-gradient mt-2">₹{balance.toFixed(2)}</p>
          <p className="text-xs text-cosmic-500 mt-2">Powered by Razorpay • UPI, Cards, NetBanking accepted</p>
        </div>

        {/* Packages */}
        <div className="cosmic-card p-6 mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold-400" />
            Recharge Wallet
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WALLET_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => topUpWallet(pkg.amount)}
                disabled={isLoading}
                className={`relative p-4 rounded-xl border transition-all hover:scale-105 active:scale-95 text-left disabled:opacity-50 ${
                  pkg.popular
                    ? 'border-gold-500/50 bg-gold-500/10'
                    : 'border-cosmic-700/40 bg-cosmic-800/40 hover:bg-cosmic-700/40'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold-500 text-cosmic-950 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Popular
                  </span>
                )}
                <p className={`font-bold text-lg ${pkg.popular ? 'text-gold-400' : 'text-white'}`}>{pkg.label}</p>
                {pkg.bonus > 0 && <p className="text-xs text-emerald-400">+₹{pkg.bonus} bonus</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="cosmic-card p-6">
          <h2 className="font-semibold text-white mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-cosmic-500">
              <p className="text-4xl mb-2">📋</p>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-cosmic-800/40">
              {transactions.map(txn => (
                <div key={txn.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      txn.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      {txn.type === 'credit'
                        ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                        : <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-stardust">{txn.description}</p>
                      <p className="text-xs text-cosmic-500">
                        {new Date(txn.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
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
