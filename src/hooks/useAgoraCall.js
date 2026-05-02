/**
 * useAgoraCall — React hook for managing Agora video/audio calls
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { agoraService, generateChannelName } from '../services/agora'
import { useCallStore } from '../store'
import toast from 'react-hot-toast'

export function useAgoraCall() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [remoteUser, setRemoteUser] = useState(null)
  const [networkQuality, setNetworkQuality] = useState(null)
  const durationTimerRef = useRef(null)

  const { startCall, setCallConnected, endCall, incrementDuration, toggleMute, toggleCamera } = useCallStore()

  // Setup Agora event listeners
  useEffect(() => {
    agoraService.onUserJoined((user) => {
      console.log('[useAgoraCall] Remote user joined:', user.uid)
      setRemoteUser(user)
    })

    agoraService.onUserLeft((user, reason) => {
      console.log('[useAgoraCall] Remote user left:', reason)
      setRemoteUser(null)
      if (reason === 'Quit') {
        toast('The astrologer has ended the session', { icon: '📡' })
        handleEndCall()
      }
    })

    agoraService.onUserPublished((user, mediaType) => {
      if (mediaType === 'video') {
        setRemoteUser({ ...user })
      }
    })

    agoraService.onConnectionStateChange((curState) => {
      if (curState === 'CONNECTED') {
        setIsConnected(true)
        setCallConnected()
        setIsConnecting(false)
        // Start duration timer
        durationTimerRef.current = setInterval(incrementDuration, 1000)
      } else if (curState === 'DISCONNECTED' || curState === 'FAILED') {
        setIsConnected(false)
        setIsConnecting(false)
      }
    })

    return () => {
      clearInterval(durationTimerRef.current)
    }
  }, [])

  const initiateCall = useCallback(async (astrologer, callType, userId) => {
    setIsConnecting(true)

    const channelName = generateChannelName(astrologer.id, userId)
    startCall(astrologer, callType, channelName)

    try {
      const tracks = await agoraService.joinChannel(
        channelName,
        null, // Token — fetch from backend in production
        userId,
        callType
      )

      toast.success('Connecting to astrologer...', { icon: '🌟' })
      return tracks
    } catch (error) {
      setIsConnecting(false)
      console.error('[useAgoraCall] Failed to initiate call:', error)
      toast.error('Failed to connect. Please try again.')
      endCall()
      throw error
    }
  }, [])

  const handleEndCall = useCallback(async () => {
    clearInterval(durationTimerRef.current)
    await agoraService.leaveChannel()
    setIsConnected(false)
    setRemoteUser(null)
    endCall()
  }, [])

  const handleToggleMute = useCallback(async () => {
    try {
      const isMuted = !(await agoraService.toggleMute())
      toggleMute(isMuted)
      return isMuted
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleToggleCamera = useCallback(async () => {
    try {
      const isCameraOff = !(await agoraService.toggleCamera())
      toggleCamera(isCameraOff)
      return isCameraOff
    } catch (err) {
      console.error(err)
    }
  }, [])

  return {
    isConnecting,
    isConnected,
    remoteUser,
    networkQuality,
    initiateCall,
    endCall: handleEndCall,
    toggleMute: handleToggleMute,
    toggleCamera: handleToggleCamera,
    playLocalVideo: agoraService.playLocalVideo.bind(agoraService),
    playRemoteVideo: agoraService.playRemoteVideo.bind(agoraService),
  }
}
