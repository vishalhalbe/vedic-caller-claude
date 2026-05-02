// lib/screens/call_screen.dart
//
// Full-screen call UI (dark indigo theme).
// Handles: joining, connected, reconnecting, failed states.
// Shows: live timer, wallet balance drain, mute/speaker controls,
//        network quality badge, remote-user-joined indicator.
//
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import '../models/astrologer.dart';
import '../providers/call_provider.dart';
import '../providers/payment_provider.dart';
import '../services/agora_service.dart';
import '../theme/app_theme.dart';
import '../router.dart';
 
class CallScreen extends StatefulWidget {
  const CallScreen({super.key});
 
  @override
  State<CallScreen> createState() => _CallScreenState();
}
 
class _CallScreenState extends State<CallScreen> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }
 
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
 
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Audio continues in background due to iOS Background Audio + VoIP config.
    // Android uses Foreground Service (see AndroidManifest.xml).
    if (state == AppLifecycleState.paused) {
      debugPrint('[CallScreen] App backgrounded — audio continues');
    } else if (state == AppLifecycleState.resumed) {
      debugPrint('[CallScreen] App foregrounded');
    }
  }
 
  // ── End call and navigate to post-call ───────────────────────────────────────
  Future<void> _handleEndCall(BuildContext context) async {
    final call = context.read<CallProvider>();
    await call.endCall();
    if (context.mounted) {
      context.pushReplacement(AppRouter.postCall);
    }
  }
 
  @override
  Widget build(BuildContext context) {
    final call = context.watch<CallProvider>();
    final astrologer = call.astrologer ?? Astrologer.demo;
 
    return Scaffold(
      backgroundColor: AppTheme.indigo,
      body: SafeArea(
        child: _buildBody(context, call, astrologer),
      ),
    );
  }
 
  Widget _buildBody(
    BuildContext context,
    CallProvider call,
    Astrologer astrologer,
  ) {
    switch (call.status) {
      case AgoraCallStatus.failed:
        return _FailedView(onRetry: () async {
          call.clearError();
          await call.startCall(astrologer: astrologer, appId: '');
        }, onLeave: () => _handleEndCall(context));
 
      default:
        return _ActiveCallView(
          call: call,
          astrologer: astrologer,
          onEndCall: () => _handleEndCall(context),
        );
    }
  }
}
 
// ── Active Call View ───────────────────────────────────────────────────────────
 
class _ActiveCallView extends StatelessWidget {
  final CallProvider call;
  final Astrologer astrologer;
  final VoidCallback onEndCall;
 
  const _ActiveCallView({
    required this.call,
    required this.astrologer,
    required this.onEndCall,
  });
 
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        children: [
          _buildTopBar(context),
          const Spacer(),
          _buildAstrologerInfo(),
          const SizedBox(height: 20),
          _buildStatusLabel(),
          const SizedBox(height: 8),
          _buildTimer(),
          const SizedBox(height: 6),
          _buildWalletInfo(),
          if (call.networkQuality >= 4) _buildNetworkBadge(),
          const Spacer(),
          _buildControls(context),
          const SizedBox(height: 40),
          _buildEndCallButton(context),
        ],
      ),
    );
  }
 
  Widget _buildTopBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(
          icon: const Icon(Icons.keyboard_arrow_down_rounded,
              color: Colors.white54, size: 28),
          onPressed: () => context.pop(),
          tooltip: 'Minimize',
        ),
        const Text(
          'Voice Call',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
        // Network quality dot
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: _networkColor(call.networkQuality),
            shape: BoxShape.circle,
          ),
        ),
      ],
    );
  }
 
  Widget _buildAstrologerInfo() {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            // Pulsing ring when connected
            if (call.status == AgoraCallStatus.connected && call.remoteJoined)
              AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.saffron.withOpacity(0.15),
                ),
              ),
            CircleAvatar(
              radius: 56,
              backgroundColor: AppTheme.indigoLight,
              backgroundImage: NetworkImage(astrologer.imageUrl),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          astrologer.name,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w700,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 4),
        Text(
          astrologer.title,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 13,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
 
  Widget _buildStatusLabel() {
    String label;
    Color color;
    switch (call.status) {
      case AgoraCallStatus.joining:
        label = 'Connecting…';
        color = AppTheme.gold;
        break;
      case AgoraCallStatus.connected:
        label = call.remoteJoined ? 'Connected' : 'Waiting for astrologer…';
        color = call.remoteJoined ? AppTheme.callGreen : AppTheme.gold;
        break;
      case AgoraCallStatus.reconnecting:
        label = 'Reconnecting…';
        color = AppTheme.gold;
        break;
      default:
        label = call.status.name;
        color = Colors.white54;
    }
 
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (call.status == AgoraCallStatus.joining ||
            call.status == AgoraCallStatus.reconnecting) ...[
          SizedBox(
            width: 14,
            height: 14,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: color,
            ),
          ),
          const SizedBox(width: 8),
        ],
        Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 15,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
 
  Widget _buildTimer() {
    return Text(
      call.formattedDuration,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 48,
        fontWeight: FontWeight.w300,
        fontFamily: 'Poppins',
        letterSpacing: 4,
      ),
    );
  }
 
  Widget _buildWalletInfo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.account_balance_wallet_rounded,
            color: AppTheme.gold, size: 14),
        const SizedBox(width: 4),
        Text(
          '${call.walletFormatted} · ~${call.minutesRemaining} min left',
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 12,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
 
  Widget _buildNetworkBadge() {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.error.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.error.withOpacity(0.4)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.signal_wifi_bad_rounded,
                color: AppTheme.error, size: 14),
            SizedBox(width: 4),
            Text(
              'Poor network',
              style: TextStyle(
                color: AppTheme.error,
                fontSize: 11,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }
 
  Widget _buildControls(BuildContext context) {
    final connected = call.isConnected;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _ControlButton(
          key: const Key('mute-btn'),
          icon: call.muted ? Icons.mic_off_rounded : Icons.mic_rounded,
          label: call.muted ? 'Unmute' : 'Mute',
          onPressed: connected ? () => context.read<CallProvider>().toggleMute() : null,
          active: call.muted,
          activeColor: AppTheme.saffron,
        ),
        _ControlButton(
          key: const Key('speaker-btn'),
          icon: call.speakerOn
              ? Icons.volume_up_rounded
              : Icons.volume_down_rounded,
          label: call.speakerOn ? 'Speaker' : 'Earpiece',
          onPressed: () => context.read<CallProvider>().toggleSpeaker(),
          active: call.speakerOn,
          activeColor: AppTheme.indigoLight,
        ),
      ],
    );
  }
 
  Widget _buildEndCallButton(BuildContext context) {
    return GestureDetector(
      key: const Key('end-call-btn'),
      onTap: onEndCall,
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          color: AppTheme.callRed,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppTheme.callRed.withOpacity(0.4),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: const Icon(
          Icons.call_end_rounded,
          color: Colors.white,
          size: 32,
        ),
      ),
    );
  }
 
  Color _networkColor(int quality) {
    if (quality <= 2) return AppTheme.callGreen;
    if (quality <= 3) return AppTheme.gold;
    return AppTheme.error;
  }
}
 
// ── Failed View ───────────────────────────────────────────────────────────────
 
class _FailedView extends StatelessWidget {
  final VoidCallback onRetry;
  final VoidCallback onLeave;
  const _FailedView({required this.onRetry, required this.onLeave});
 
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.signal_wifi_connected_no_internet_4_rounded,
                color: AppTheme.error, size: 64),
            const SizedBox(height: 20),
            const Text(
              'Connection Failed',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w700,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Unable to connect to the call. Check your internet connection and try again.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white54,
                fontSize: 14,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              key: const Key('retry-btn'),
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: onLeave,
              child: const Text(
                'Leave',
                style: TextStyle(color: Colors.white54, fontFamily: 'Poppins'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
 
// ── Permission denied view ────────────────────────────────────────────────────
 
class _PermissionDeniedView extends StatelessWidget {
  final bool isPermanent;
  final VoidCallback onRetry;
  const _PermissionDeniedView(
      {required this.isPermanent, required this.onRetry});
 
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.mic_off_rounded, color: AppTheme.error, size: 64),
            const SizedBox(height: 20),
            const Text(
              'Microphone Required',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w700,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isPermanent
                  ? 'Microphone access is permanently denied. Please enable it in Settings.'
                  : 'Microphone permission is required to make voice calls.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white54,
                fontSize: 14,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: isPermanent ? openAppSettings : onRetry,
              icon: Icon(isPermanent ? Icons.settings_rounded : Icons.refresh_rounded),
              label: Text(isPermanent ? 'Open Settings' : 'Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
 
// ── Control Button ────────────────────────────────────────────────────────────
 
class _ControlButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  final bool active;
  final Color activeColor;
 
  const _ControlButton({
    super.key,
    required this.icon,
    required this.label,
    required this.onPressed,
    this.active = false,
    required this.activeColor,
  });
 
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: onPressed,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: active
                  ? activeColor.withOpacity(0.25)
                  : Colors.white.withOpacity(0.08),
              shape: BoxShape.circle,
              border: Border.all(
                color: active
                    ? activeColor.withOpacity(0.6)
                    : Colors.white.withOpacity(0.12),
                width: 1.5,
              ),
            ),
            child: Icon(
              icon,
              color: onPressed == null
                  ? Colors.white24
                  : active
                      ? activeColor
                      : Colors.white,
              size: 26,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            color: onPressed == null ? Colors.white24 : Colors.white54,
            fontSize: 11,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
}
