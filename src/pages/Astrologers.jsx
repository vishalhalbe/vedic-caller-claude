import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useAstrologerStore } from '../store'
import AstrologerCard from '../components/AstrologerCard'

const SKILLS = ['all', 'Vedic Astrology', 'Tarot', 'Numerology', 'KP Astrology', 'Palmistry', 'Western Astrology']
const LANGUAGES = ['all', 'Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi']
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
]

export default function Astrologers() {
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { filters, setFilters, getFiltered } = useAstrologerStore()

  const filtered = getFiltered().filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="pt-16 min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Find Your Astrologer</h1>
          <p className="text-cosmic-400">{filtered.length} expert astrologers available</p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-500" />
            <input
              className="input-cosmic pl-10"
              placeholder="Search by name or skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-cosmic-500 hover:text-white" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
              showFilters
                ? 'bg-cosmic-700/60 border-cosmic-500/50 text-white'
                : 'bg-cosmic-900/60 border-cosmic-700/40 text-cosmic-300 hover:border-cosmic-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="cosmic-card p-5 mb-6 space-y-5">
            {/* Sort */}
            <div>
              <label className="text-xs text-cosmic-400 font-semibold uppercase tracking-wider mb-2 block">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters({ sortBy: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      filters.sortBy === opt.value
                        ? 'bg-cosmic-500 text-white'
                        : 'bg-cosmic-800/60 text-cosmic-300 hover:bg-cosmic-700/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs text-cosmic-400 font-semibold uppercase tracking-wider mb-2 block">Specialty</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setFilters({ skill })}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                      filters.skill === skill
                        ? 'bg-gold-500/80 text-cosmic-950 font-semibold'
                        : 'bg-cosmic-800/60 text-cosmic-300 hover:bg-cosmic-700/60'
                    }`}
                  >
                    {skill === 'all' ? 'All Skills' : skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs text-cosmic-400 font-semibold uppercase tracking-wider mb-2 block">Language</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setFilters({ language: lang })}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                      filters.language === lang
                        ? 'bg-cosmic-500 text-white'
                        : 'bg-cosmic-800/60 text-cosmic-300 hover:bg-cosmic-700/60'
                    }`}
                  >
                    {lang === 'all' ? 'All Languages' : lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-cosmic-500">
            <p className="text-5xl mb-4">🔮</p>
            <p className="text-lg font-medium">No astrologers found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(a => <AstrologerCard key={a.id} astrologer={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}
