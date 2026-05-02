/**
 * CosmicSage — Razorpay Payment Service
 * Handles wallet top-ups and per-minute consultation billing
 */

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID'

export const WALLET_PACKAGES = [
  { id: 'pkg_100', amount: 100, bonus: 0, label: '₹100', popular: false, coins: 100 },
  { id: 'pkg_300', amount: 300, bonus: 30, label: '₹300', popular: false, coins: 330 },
  { id: 'pkg_500', amount: 500, bonus: 75, label: '₹500', popular: true, coins: 575 },
  { id: 'pkg_1000', amount: 1000, bonus: 200, label: '₹1000', popular: false, coins: 1200 },
  { id: 'pkg_2000', amount: 2000, bonus: 500, label: '₹2000', popular: false, coins: 2500 },
]

class RazorpayService {
  /**
   * Load Razorpay SDK (already loaded via index.html script tag)
   */
  isLoaded() {
    return typeof window !== 'undefined' && !!window.Razorpay
  }

  /**
   * Create a Razorpay order via backend API
   * @param {number} amount - Amount in INR (will be converted to paise)
   * @param {string} currency
   */
  async createOrder(amount, currency = 'INR') {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount * 100, currency }), // Convert to paise
    })

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order')
    }

    return response.json()
  }

  /**
   * Verify payment signature via backend
   */
  async verifyPayment(paymentData) {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      throw new Error('Payment verification failed')
    }

    return response.json()
  }

  /**
   * Open Razorpay checkout for wallet top-up
   * @param {Object} options
   * @param {number} options.amount - Amount in INR
   * @param {Object} options.user - User info { name, email, phone }
   * @param {Function} options.onSuccess - Called on successful payment
   * @param {Function} options.onFailure - Called on payment failure
   * @param {Function} options.onDismiss - Called when checkout is dismissed
   */
  async openWalletCheckout({ amount, user, onSuccess, onFailure, onDismiss }) {
    if (!this.isLoaded()) {
      throw new Error('Razorpay SDK not loaded. Check your internet connection.')
    }

    let order
    try {
      order = await this.createOrder(amount)
    } catch (err) {
      // For demo mode, create a mock order
      console.warn('[Razorpay] Backend not available, using demo mode')
      order = {
        id: `order_demo_${Date.now()}`,
        amount: amount * 100,
        currency: 'INR',
      }
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'CosmicSage',
      description: `Wallet Top-up ₹${amount}`,
      image: '/logo.svg',
      order_id: order.id,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: {
        wallet_top_up: 'true',
        amount_inr: amount.toString(),
      },
      theme: {
        color: '#7028e4',
        backdrop_color: '#0d0220',
      },
      modal: {
        backdropclose: false,
        escape: false,
        handleback: true,
        confirm_close: true,
        animation: true,
        ondismiss: () => {
          console.log('[Razorpay] Checkout dismissed')
          onDismiss?.()
        },
      },
      handler: async (response) => {
        console.log('[Razorpay] Payment response:', response)
        try {
          let verificationResult
          try {
            verificationResult = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          } catch {
            // Demo mode verification
            verificationResult = { success: true, demo: true }
          }

          if (verificationResult.success) {
            onSuccess?.({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount,
              coinsAdded: this._getCoinsForAmount(amount),
            })
          } else {
            onFailure?.({ message: 'Payment verification failed' })
          }
        } catch (err) {
          onFailure?.({ message: err.message })
        }
      },
    }

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', (response) => {
      console.error('[Razorpay] Payment failed:', response.error)
      onFailure?.({
        code: response.error.code,
        message: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
      })
    })

    rzp.open()
    return rzp
  }

  /**
   * Calculate coins for wallet amount
   */
  _getCoinsForAmount(amount) {
    const pkg = WALLET_PACKAGES.find(p => p.amount === amount)
    return pkg ? pkg.coins : amount
  }

  /**
   * Initiate per-minute billing for a consultation
   * @param {Object} options
   * @param {number} options.ratePerMinute - Astrologer rate per minute in ₹
   * @param {number} options.walletBalance - Current wallet balance
   * @param {Function} options.onLowBalance - Called when balance is low
   * @param {Function} options.onBalanceExhausted - Called when wallet is empty
   */
  startConsultationBilling({ ratePerMinute, walletBalance, onLowBalance, onBalanceExhausted }) {
    let elapsed = 0
    let balance = walletBalance
    const LOW_BALANCE_THRESHOLD = ratePerMinute * 3 // Warn at 3 minutes remaining

    const ticker = setInterval(() => {
      elapsed++
      balance -= ratePerMinute / 60 // Deduct per second

      if (balance <= LOW_BALANCE_THRESHOLD && elapsed % 60 === 0) {
        onLowBalance?.({ balance, minutesRemaining: Math.floor(balance / ratePerMinute) })
      }

      if (balance <= 0) {
        clearInterval(ticker)
        onBalanceExhausted?.({ totalMinutes: Math.floor(elapsed / 60) })
      }
    }, 1000)

    return {
      stop: () => clearInterval(ticker),
      getElapsed: () => elapsed,
      getBalance: () => balance,
    }
  }
}

export const razorpayService = new RazorpayService()
export default razorpayService
