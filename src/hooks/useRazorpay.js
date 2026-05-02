/**
 * useRazorpay — React hook for handling payments
 */

import { useState, useCallback } from 'react'
import { razorpayService } from '../services/razorpay'
import { useWalletStore } from '../store'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false)
  const { addBalance } = useWalletStore()
  const { user } = useAuthStore()

  const topUpWallet = useCallback(async (amount) => {
    setIsLoading(true)

    return new Promise((resolve, reject) => {
      razorpayService.openWalletCheckout({
        amount,
        user: {
          name: user?.name || 'CosmicSage User',
          email: user?.email || '',
          phone: user?.phone || '',
        },
        onSuccess: (data) => {
          setIsLoading(false)
          addBalance(amount, `Wallet Top-up via Razorpay`)
          toast.success(`₹${amount} added to your wallet! 🌟`, { duration: 4000 })
          resolve(data)
        },
        onFailure: (error) => {
          setIsLoading(false)
          toast.error(`Payment failed: ${error.message}`)
          reject(error)
        },
        onDismiss: () => {
          setIsLoading(false)
          resolve(null)
        },
      })
    })
  }, [user, addBalance])

  return { topUpWallet, isLoading }
}
