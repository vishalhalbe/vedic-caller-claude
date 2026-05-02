# 🌟 CosmicSage — Vedic Astrology Consultation Platform

> A full-featured AstroTalk clone with **Agora RTC** for live audio/video calls and **Razorpay** for seamless INR payments. Built with React + Vite.

[![CI](https://github.com/vishalhalbe/vedic-caller-claude/actions/workflows/ci.yml/badge.svg)](https://github.com/vishalhalbe/vedic-caller-claude/actions/workflows/ci.yml)
[![Deploy](https://github.com/vishalhalbe/vedic-caller-claude/actions/workflows/deploy.yml/badge.svg)](https://github.com/vishalhalbe/vedic-caller-claude/actions/workflows/deploy.yml)

---

## ✨ Features

| Feature | Tech |
|---------|------|
| 🎥 Video & Audio Calls | Agora RTC SDK (`agora-rtc-sdk-ng`) |
| 💬 Real-time Chat | Agora RTM (pluggable) |
| 💳 Wallet Top-up | Razorpay Checkout v1 |
| ⏱️ Per-minute Billing | Client-side ticker + Razorpay |
| 🔮 Astrologer Directory | Filterable, searchable listing |
| ⭐ Ratings & Reviews | Mock data, API-ready |
| 📱 Responsive UI | Tailwind CSS + Framer Motion |
| 🌌 Cosmic Theme | Cinzel + Nunito fonts, dark purple palette |

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/vishalhalbe/vedic-caller-claude.git
cd vedic-caller-claude

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# → Fill in VITE_AGORA_APP_ID and VITE_RAZORPAY_KEY_ID

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

---

## 🔑 Environment Variables

```env
# Agora — https://console.agora.io
VITE_AGORA_APP_ID=your_agora_app_id

# Razorpay — https://dashboard.razorpay.com → Settings → API Keys
# Use rzp_test_... for development
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Backend API (for order creation & signature verification)
VITE_API_URL=http://localhost:5000
```

---

## 🏗️ Project Structure

```
vedic-caller-claude/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation + wallet balance
│   │   ├── AstrologerCard.jsx  # Listing card with status badges
│   │   ├── CallModal.jsx       # Agora video/audio call UI
│   │   ├── WalletModal.jsx     # Razorpay recharge + transactions
│   │   ├── AuthModal.jsx       # Login / Sign up
│   │   └── StarField.jsx       # Animated cosmic background
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Astrologers.jsx     # Filterable directory
│   │   ├── AstrologerDetail.jsx # Profile + call initiation
│   │   ├── Wallet.jsx          # Full wallet page
│   │   └── Profile.jsx         # User account
│   ├── services/
│   │   ├── agora.js            # AgoraService class (join, publish, tracks)
│   │   └── razorpay.js         # RazorpayService (checkout, billing ticker)
│   ├── hooks/
│   │   ├── useAgoraCall.js     # React hook wrapping AgoraService
│   │   └── useRazorpay.js      # React hook wrapping RazorpayService
│   └── store/
│       └── index.js            # Zustand stores (auth, wallet, call, astrologers)
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint → Test → Security → Build → Lighthouse
│       ├── deploy.yml          # Staging (develop) & Production (main) pipelines
│       └── release.yml         # Semantic versioning + GitHub Releases
└── ...config files
```

---

## 🎙️ Agora Integration

`src/services/agora.js` — `AgoraService` singleton:

```js
import { agoraService, CallType } from './services/agora'

// Join a channel
const tracks = await agoraService.joinChannel(channelName, token, uid, CallType.VIDEO)

// Toggle controls
await agoraService.toggleMute()
await agoraService.toggleCamera()

// Leave
await agoraService.leaveChannel()
```

> **Token Security**: In production, generate RTC tokens on your backend and pass them to `joinChannel`. Never expose your App Certificate in the frontend.

---

## 💳 Razorpay Integration

`src/services/razorpay.js` — `RazorpayService` singleton:

```js
import { razorpayService } from './services/razorpay'

// Open checkout
await razorpayService.openWalletCheckout({
  amount: 500,           // INR
  user: { name, email, phone },
  onSuccess: ({ paymentId, amount }) => { /* credit wallet */ },
  onFailure: ({ message }) => { /* show error */ },
})

// Per-minute billing
const session = razorpayService.startConsultationBilling({
  ratePerMinute: 25,
  walletBalance: 300,
  onLowBalance: ({ minutesRemaining }) => { /* warn user */ },
  onBalanceExhausted: () => { /* end call */ },
})
```

> **Backend Required**: Razorpay order creation (`POST /api/payments/create-order`) and signature verification (`POST /api/payments/verify`) must run server-side to protect your secret key.

---

## 🔄 GitHub Actions Workflows

### CI Pipeline (`ci.yml`)
Triggered on every push and PR:

```
push/PR → Lint → Tests (Node 18 & 20) → Security Audit → Build → Lighthouse → PR Comment
```

### Deploy Pipeline (`deploy.yml`)
- `develop` branch → **Staging** (auto)
- `main` branch → **Production** (requires environment approval)

```
push → Setup Env → Tests → Build → Deploy (Vercel) → Smoke Tests → Notify Slack
```

### Release Pipeline (`release.yml`)
Triggered on `v*.*.*` tags or manual dispatch:

```
tag → Validate Version → Tests → Build → Changelog → GitHub Release → Deploy → Announce
```

---

## 🔐 GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `AGORA_APP_ID` | Agora App ID (production) |
| `AGORA_APP_ID_TEST` | Agora App ID (test) |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (production) |
| `RAZORPAY_KEY_TEST` | Razorpay Key ID (test) |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SLACK_WEBHOOK_URL` | Slack notifications webhook |
| `CODECOV_TOKEN` | Codecov coverage uploads |

---

## 🛠️ Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run lint         # ESLint
npm run format       # Prettier
npm run type-check   # TypeScript checks
```

---

## 📄 License

MIT © [Vishal Halbe](https://github.com/vishalhalbe)
