import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import StarField from './components/StarField'
import Home from './pages/Home'
import Astrologers from './pages/Astrologers'
import AstrologerDetail from './pages/AstrologerDetail'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import CallSession from './pages/CallSession'
import './index.css'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cosmic-950 relative">
        <StarField />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/astrologers" element={<Astrologers />} />
            <Route path="/astrologer/:id" element={<AstrologerDetail />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/session/:channelName" element={<CallSession />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2c0a5e',
              color: '#e8d5ff',
              border: '1px solid rgba(112, 40, 228, 0.3)',
              borderRadius: '12px',
              fontFamily: 'Nunito, sans-serif',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#2c0a5e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#2c0a5e' } },
          }}
        />
      </div>
    </Router>
  )
}
