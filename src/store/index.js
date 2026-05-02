/**
 * CosmicSage — Global State Store (Zustand)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Auth Store ────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (userData, token) => set({
        user: userData,
        isAuthenticated: true,
        token,
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        token: null,
      }),

      updateUser: (updates) => set(state => ({
        user: { ...state.user, ...updates },
      })),
    }),
    { name: 'cosmicsage-auth' }
  )
)

// ─── Wallet Store ───────────────────────────────────────────────────────────
export const useWalletStore = create(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      addBalance: (amount, description = 'Wallet Top-up') => set(state => ({
        balance: state.balance + amount,
        transactions: [
          {
            id: `txn_${Date.now()}`,
            type: 'credit',
            amount,
            description,
            timestamp: new Date().toISOString(),
          },
          ...state.transactions,
        ],
      })),

      deductBalance: (amount, description = 'Consultation') => {
        const { balance } = get()
        if (balance < amount) return false

        set(state => ({
          balance: Math.max(0, state.balance - amount),
          transactions: [
            {
              id: `txn_${Date.now()}`,
              type: 'debit',
              amount,
              description,
              timestamp: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        }))
        return true
      },

      getFormattedBalance: () => {
        const { balance } = get()
        return `₹${balance.toFixed(2)}`
      },
    }),
    { name: 'cosmicsage-wallet' }
  )
)

// ─── Call Store ─────────────────────────────────────────────────────────────
export const useCallStore = create((set) => ({
  activeCall: null,
  callStatus: 'idle', // idle | connecting | connected | ended
  callDuration: 0,
  isMuted: false,
  isCameraOff: false,
  channelName: null,

  startCall: (astrologer, type, channelName) => set({
    activeCall: { astrologer, type, startTime: Date.now() },
    callStatus: 'connecting',
    callDuration: 0,
    isMuted: false,
    isCameraOff: false,
    channelName,
  }),

  setCallConnected: () => set({ callStatus: 'connected' }),

  endCall: () => set({
    activeCall: null,
    callStatus: 'idle',
    callDuration: 0,
    channelName: null,
  }),

  incrementDuration: () => set(state => ({ callDuration: state.callDuration + 1 })),

  toggleMute: (muted) => set({ isMuted: muted }),
  toggleCamera: (off) => set({ isCameraOff: off }),
}))

// ─── Astrologers Store ──────────────────────────────────────────────────────
export const useAstrologerStore = create((set, get) => ({
  astrologers: MOCK_ASTROLOGERS,
  featured: MOCK_ASTROLOGERS.filter(a => a.featured),
  filters: {
    skill: 'all',
    language: 'all',
    priceRange: [0, 100],
    sortBy: 'rating',
  },

  setFilters: (filters) => set(state => ({
    filters: { ...state.filters, ...filters },
  })),

  getFiltered: () => {
    const { astrologers, filters } = get()
    return astrologers
      .filter(a => filters.skill === 'all' || a.skills.includes(filters.skill))
      .filter(a => filters.language === 'all' || a.languages.includes(filters.language))
      .filter(a => a.ratePerMin >= filters.priceRange[0] && a.ratePerMin <= filters.priceRange[1])
      .sort((a, b) => {
        if (filters.sortBy === 'rating') return b.rating - a.rating
        if (filters.sortBy === 'price_low') return a.ratePerMin - b.ratePerMin
        if (filters.sortBy === 'price_high') return b.ratePerMin - a.ratePerMin
        if (filters.sortBy === 'experience') return b.experience - a.experience
        return 0
      })
  },
}))

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_ASTROLOGERS = [
  {
    id: 'a1',
    name: 'Pandit Rajesh Shastri',
    image: 'https://i.pravatar.cc/150?img=57',
    skills: ['Vedic Astrology', 'Numerology', 'Vastu'],
    languages: ['Hindi', 'English'],
    experience: 15,
    rating: 4.9,
    reviews: 8423,
    ratePerMin: 25,
    status: 'online',
    featured: true,
    bio: 'Expert in Vedic astrology with 15+ years of experience. Specializes in marriage, career and financial predictions.',
    specializations: ['Marriage', 'Career', 'Finance', 'Health'],
    totalConsultations: 45000,
    accuracy: 94,
    zodiacSigns: ['Aries', 'Taurus', 'Gemini'],
    callTypes: ['chat', 'audio', 'video'],
  },
  {
    id: 'a2',
    name: 'Dr. Meera Devi',
    image: 'https://i.pravatar.cc/150?img=47',
    skills: ['Tarot', 'Psychic Reading', 'Crystal Healing'],
    languages: ['English', 'Tamil', 'Telugu'],
    experience: 10,
    rating: 4.8,
    reviews: 6201,
    ratePerMin: 35,
    status: 'online',
    featured: true,
    bio: 'Renowned tarot reader and psychic with a gift for uncovering hidden truths. Provides deep emotional and spiritual guidance.',
    specializations: ['Love & Relationships', 'Spiritual Healing', 'Life Path'],
    totalConsultations: 32000,
    accuracy: 91,
    zodiacSigns: ['Cancer', 'Scorpio', 'Pisces'],
    callTypes: ['chat', 'audio', 'video'],
  },
  {
    id: 'a3',
    name: 'Acharya Vikram Joshi',
    image: 'https://i.pravatar.cc/150?img=68',
    skills: ['KP Astrology', 'Horoscope', 'Prashna'],
    languages: ['Hindi', 'Marathi', 'English'],
    experience: 20,
    rating: 4.95,
    reviews: 12000,
    ratePerMin: 50,
    status: 'busy',
    featured: true,
    bio: 'Grand Master of KP Astrology. Author of 3 books on predictive astrology. Trusted by thousands of clients worldwide.',
    specializations: ['Business', 'Property', 'Litigation', 'Elections'],
    totalConsultations: 78000,
    accuracy: 97,
    zodiacSigns: ['Virgo', 'Capricorn', 'Aquarius'],
    callTypes: ['chat', 'audio'],
  },
  {
    id: 'a4',
    name: 'Jyotika Anand',
    image: 'https://i.pravatar.cc/150?img=44',
    skills: ['Western Astrology', 'Numerology', 'Angel Cards'],
    languages: ['English', 'Bengali'],
    experience: 8,
    rating: 4.7,
    reviews: 3890,
    ratePerMin: 20,
    status: 'online',
    featured: false,
    bio: 'Combines Western astrology and numerology to provide holistic life guidance for personal growth.',
    specializations: ['Personal Growth', 'Relationships', 'Career Change'],
    totalConsultations: 18000,
    accuracy: 88,
    zodiacSigns: ['Libra', 'Gemini', 'Aquarius'],
    callTypes: ['chat', 'audio', 'video'],
  },
  {
    id: 'a5',
    name: 'Sadhu Premnath',
    image: 'https://i.pravatar.cc/150?img=65',
    skills: ['Vedic Astrology', 'Palmistry', 'Face Reading'],
    languages: ['Hindi', 'Punjabi', 'English'],
    experience: 25,
    rating: 4.85,
    reviews: 15200,
    ratePerMin: 40,
    status: 'offline',
    featured: false,
    bio: 'Master of ancient Vedic sciences. Expert in palmistry and face reading with unparalleled accuracy.',
    specializations: ['Past Life', 'Karma', 'Spiritual Guidance', 'Health'],
    totalConsultations: 95000,
    accuracy: 95,
    zodiacSigns: ['Aries', 'Leo', 'Sagittarius'],
    callTypes: ['chat', 'audio'],
  },
  {
    id: 'a6',
    name: 'Priya Malhotra',
    image: 'https://i.pravatar.cc/150?img=41',
    skills: ['Tarot', 'Oracle Cards', 'Rune Reading'],
    languages: ['English', 'Hindi'],
    experience: 6,
    rating: 4.6,
    reviews: 2100,
    ratePerMin: 18,
    status: 'online',
    featured: false,
    bio: 'Young and intuitive tarot reader with a fresh perspective on ancient divination arts.',
    specializations: ['Love', 'Career', 'Decision Making'],
    totalConsultations: 9500,
    accuracy: 85,
    zodiacSigns: ['Taurus', 'Libra', 'Pisces'],
    callTypes: ['chat', 'video'],
  },
]
