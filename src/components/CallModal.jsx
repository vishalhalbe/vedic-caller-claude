import { useState, useEffect, useRef } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
  MessageCircle, RotateCcw, Wifi, WifiOff, Clock
} from 'lucide-react'
import { useAgoraCall } from '../hooks/useAgoraCall'
import { useCallStore, useWalletStore } from '../store'
import { razorpayService } from '../services/razorpay'
import toast from 'react-hot-toast'

export default function CallModal({ astrologer, callType, onClose }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [billingSession, setBillingSession] = useState(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const { callDuration, callStatus } = useCallStore()
  const { balance } = useWalletStore()
  const {
    isConnecting, isConnected, remoteUser,
    initiateCall, endCall, toggleMute, toggleCamera,
    playLocalVideo, playRemoteVideo,
  } = useAgoraCall()

  // Format duration as MM:SS
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Start call on mount
  useEffect(() => {
    const start = async () => {
      try {
        const tracks = await initiateCall(astrologer, callType, `user_${Date.now()}`)
        if (tracks?.videoTrack && localVideoRef.current) {
          tracks.videoTrack.play(localVideoRef.current)
        }
      } catch (err) {
        console.error(err)
        onClose()
      }
    }
    start()

    return () => {
      endCall()
      billingSession?.stop()
    }
  }, [])

  // Start billing when connected
  useEffect(() => {
    if (isConnected) {
      const session = razorpayService.startConsultationBilling({
        ratePerMinute: astrologer.ratePerMin,
        walletBalance: balance,
        onLowBalance: ({ minutesRemaining }) => {
          toast(`⚠️ Only ${minutesRemaining} min remaining. Please recharge!`, {
            duration: 6000,
            icon: '💳',
          })
        },
        onBalanceExhausted: () => {
          toast.error('Wallet balance exhausted. Ending session.')
          handleEndCall()
        },
      })
      setBillingSession(session)
    }
  }, [isConnected])

  // Play remote video when user joins
  useEffect(() => {
    if (remoteUser && remoteVideoRef.current) {
      playRemoteVideo(remoteUser, remoteVideoRef.current)
    }
  }, [remoteUser])

  const handleEndCall = async () => {
    billingSession?.stop()
    await endCall()
    const totalMins = Math.floor(callDuration / 60)
    const cost = totalMins * astrologer.ratePerMin
    toast(`Session ended — ${totalMins}m ${callDuration % 60}s • ₹${cost.toFixed(0)} deducted`, {
      icon: '📞',
      duration: 5000,
    })
    onClose()
  }

  const handleToggleMute = async () => {
    const muted = await toggleMute()
    setIsMuted(muted)
  }

  const handleToggleCamera = async () => {
    const cameraOff = await toggleCamera()
    setIsCameraOff(cameraOff)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur">
      <div className="relative w-full max-w-2xl h-[90vh] max-h-[600px] bg-cosmic-950 rounded-3xl overflow-hidden shadow-2xl border border-cosmic-800/40">

        {/* Remote Video (main) */}
        <div className="absolute inset-0 bg-cosmic-900">
          {callType === 'video' ? (
            <div ref={remoteVideoRef} className="w-full h-full object-cover" />
          ) : (
            /* Audio call avatar */
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className={`relative ${isConnected ? 'animate-pulse-slow' : ''}`}>
                <img
                  src={astrologer.image}
                  alt={astrologer.name}
                  className="w-32 h-32 rounded-full border-4 border-cosmic-500/50 shadow-xl shadow-cosmic-500/20"
                />
                {isConnected && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-cosmic-400/30 animate-ping" />
                    <div className="absolute -inset-4 rounded-full border-2 border-cosmic-500/20 animate-ping" style={{ animationDelay: '0.3s' }} />
                  </>
                )}
              </div>
              <p className="font-display text-xl font-semibold text-white">{astrologer.name}</p>
              <p className="text-cosmic-400 text-sm">
                {isConnecting ? 'Connecting...' : isConnected ? 'Call in progress' : 'Initializing...'}
              </p>
            </div>
          )}

          {/* Connecting overlay */}
          {isConnecting && !isConnected && (
            <div className="absolute inset-0 bg-cosmic-950/80 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-3 border-cosmic-500/30 border-t-cosmic-400 rounded-full animate-spin" />
              <p className="text-stardust text-sm">Connecting to {astrologer.name}...</p>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        {callType === 'video' && (
          <div
            ref={localVideoRef}
            className="absolute top-4 right-4 w-28 h-40 rounded-xl overflow-hidden border-2 border-cosmic-700/50 shadow-xl bg-cosmic-900"
          />
        )}

        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-sm">{astrologer.name}</p>
              <p className="text-xs text-cosmic-300">₹{astrologer.ratePerMin}/min</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Duration */}
              <div className="flex items-center gap-1.5 bg-black/40 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-sm font-mono text-gold-300">{formatDuration(callDuration)}</span>
              </div>
              {/* Network quality */}
              <div className="flex items-center gap-1 bg-black/40 rounded-lg px-2.5 py-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Wallet balance indicator */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          {balance < astrologer.ratePerMin * 5 && (
            <div className="bg-amber-500/90 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ⚠️ Low balance: ₹{balance.toFixed(0)}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <button
              onClick={handleToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isMuted
                  ? 'bg-red-500/90 shadow-red-500/30 hover:bg-red-400'
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-xl shadow-red-500/30 transition-all hover:scale-110 active:scale-95 call-pulse"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            {/* Camera (video only) */}
            {callType === 'video' && (
              <button
                onClick={handleToggleCamera}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isCameraOff
                    ? 'bg-red-500/90 shadow-red-500/30 hover:bg-red-400'
                    : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </button>
            )}

            {/* Chat button (audio call) */}
            {callType === 'audio' && (
              <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
          <p className="text-center text-xs text-cosmic-500 mt-3">
            Secured by Agora RTC • End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
