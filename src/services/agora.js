/**
 * CosmicSage — Agora RTC Service
 * Handles all real-time audio/video communications
 */

import AgoraRTC from 'agora-rtc-sdk-ng'

// Configure Agora logging level
AgoraRTC.setLogLevel(1) // 0=DEBUG, 1=INFO, 2=WARNING, 3=ERROR, 4=NONE

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'YOUR_AGORA_APP_ID'

export const CallType = {
  AUDIO: 'audio',
  VIDEO: 'video',
  CHAT: 'chat',
}

class AgoraService {
  constructor() {
    this.client = null
    this.localAudioTrack = null
    this.localVideoTrack = null
    this.remoteUsers = new Map()
    this.onUserJoinedCb = null
    this.onUserLeftCb = null
    this.onUserPublishedCb = null
    this.onConnectionStateChangeCb = null
  }

  /**
   * Initialize Agora RTC client
   * @param {string} mode - 'rtc' for 1-to-1 calls, 'live' for broadcasting
   */
  initClient(mode = 'rtc') {
    this.client = AgoraRTC.createClient({ mode, codec: 'vp8' })
    this._setupEventListeners()
    return this.client
  }

  _setupEventListeners() {
    if (!this.client) return

    this.client.on('user-joined', (user) => {
      console.log('[Agora] User joined:', user.uid)
      this.remoteUsers.set(user.uid, user)
      this.onUserJoinedCb?.(user)
    })

    this.client.on('user-left', (user, reason) => {
      console.log('[Agora] User left:', user.uid, reason)
      this.remoteUsers.delete(user.uid)
      this.onUserLeftCb?.(user, reason)
    })

    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType)
      console.log('[Agora] Subscribed to user:', user.uid, mediaType)

      if (mediaType === 'audio') {
        user.audioTrack?.play()
      }
      if (mediaType === 'video') {
        this.onUserPublishedCb?.(user, mediaType)
      }
    })

    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('[Agora] User unpublished:', user.uid, mediaType)
    })

    this.client.on('connection-state-change', (curState, prevState) => {
      console.log('[Agora] Connection state:', prevState, '->', curState)
      this.onConnectionStateChangeCb?.(curState, prevState)
    })

    this.client.on('exception', (event) => {
      console.error('[Agora] Exception:', event)
    })
  }

  /**
   * Join a channel for a consultation
   * @param {string} channelName - Unique channel for the consultation session
   * @param {string} token - RTC token from backend
   * @param {string|number} uid - User ID
   * @param {string} callType - 'audio' or 'video'
   */
  async joinChannel(channelName, token, uid, callType = CallType.VIDEO) {
    if (!this.client) this.initClient()

    try {
      await this.client.join(AGORA_APP_ID, channelName, token || null, uid)
      console.log('[Agora] Joined channel:', channelName)

      if (callType === CallType.AUDIO || callType === CallType.VIDEO) {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'speech_standard',
          AEC: true, // Acoustic Echo Cancellation
          ANS: true, // Automatic Noise Suppression
          AGC: true, // Automatic Gain Control
        })
      }

      if (callType === CallType.VIDEO) {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000,
          },
          optimizationMode: 'detail',
        })
      }

      const tracksToPublish = [
        this.localAudioTrack,
        this.localVideoTrack,
      ].filter(Boolean)

      if (tracksToPublish.length > 0) {
        await this.client.publish(tracksToPublish)
        console.log('[Agora] Local tracks published')
      }

      return {
        audioTrack: this.localAudioTrack,
        videoTrack: this.localVideoTrack,
      }
    } catch (error) {
      console.error('[Agora] Failed to join channel:', error)
      throw error
    }
  }

  /**
   * Play local video in a container element
   */
  playLocalVideo(elementId) {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(elementId)
    }
  }

  /**
   * Play remote video in a container element
   */
  playRemoteVideo(user, elementId) {
    if (user?.videoTrack) {
      user.videoTrack.play(elementId)
    }
  }

  /**
   * Toggle microphone mute/unmute
   */
  async toggleMute() {
    if (this.localAudioTrack) {
      const enabled = this.localAudioTrack.enabled
      await this.localAudioTrack.setEnabled(!enabled)
      return !enabled
    }
    return false
  }

  /**
   * Toggle camera on/off
   */
  async toggleCamera() {
    if (this.localVideoTrack) {
      const enabled = this.localVideoTrack.enabled
      await this.localVideoTrack.setEnabled(!enabled)
      return !enabled
    }
    return false
  }

  /**
   * Switch camera (front/back on mobile)
   */
  async switchCamera() {
    if (this.localVideoTrack) {
      const devices = await AgoraRTC.getCameras()
      const currentDevice = await this.localVideoTrack.getMediaStreamTrack()?.getSettings()?.deviceId
      const otherDevice = devices.find(d => d.deviceId !== currentDevice)
      if (otherDevice) {
        await this.localVideoTrack.setDevice(otherDevice.deviceId)
      }
    }
  }

  /**
   * Get network quality stats
   */
  enableDualStream() {
    this.client?.enableDualStream()
  }

  /**
   * Leave the channel and clean up tracks
   */
  async leaveChannel() {
    this.localAudioTrack?.close()
    this.localVideoTrack?.close()
    this.localAudioTrack = null
    this.localVideoTrack = null

    if (this.client) {
      await this.client.leave()
      console.log('[Agora] Left channel')
    }

    this.remoteUsers.clear()
  }

  /**
   * Set callback for when remote user joins
   */
  onUserJoined(callback) {
    this.onUserJoinedCb = callback
  }

  /**
   * Set callback for when remote user leaves
   */
  onUserLeft(callback) {
    this.onUserLeftCb = callback
  }

  /**
   * Set callback for when remote user publishes media
   */
  onUserPublished(callback) {
    this.onUserPublishedCb = callback
  }

  /**
   * Set callback for connection state changes
   */
  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCb = callback
  }

  /**
   * Get available audio/video input devices
   */
  static async getDevices() {
    const [cameras, microphones, speakers] = await Promise.all([
      AgoraRTC.getCameras(),
      AgoraRTC.getMicrophones(),
      AgoraRTC.getPlaybackDevices(),
    ])
    return { cameras, microphones, speakers }
  }
}

// Singleton instance
export const agoraService = new AgoraService()

/**
 * Generate a unique channel name for a consultation
 */
export const generateChannelName = (astrologerId, userId) => {
  const timestamp = Date.now()
  return `cosmicsage_${astrologerId}_${userId}_${timestamp}`
}

export default agoraService
