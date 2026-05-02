// lib/screens/astrologer_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/astrologer.dart';
import '../providers/call_provider.dart';
import '../providers/payment_provider.dart';
import '../theme/app_theme.dart';
import '../router.dart';
 
class AstrologerScreen extends StatelessWidget {
  const AstrologerScreen({super.key});
 
  @override
  Widget build(BuildContext context) {
    final call = context.watch<CallProvider>();
    final payment = context.watch<PaymentProvider>();
    final astrologer = Astrologer.demo;
 
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context, astrologer),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _buildProfileCard(context, astrologer),
                const SizedBox(height: 20),
                _buildStats(context, astrologer),
                const SizedBox(height: 20),
                _buildBio(context, astrologer),
                const SizedBox(height: 20),
                _buildSpecializations(context, astrologer),
                const SizedBox(height: 20),
                _buildLanguages(context, astrologer),
                if (call.error != null) ...[
                  const SizedBox(height: 16),
                  _buildErrorBanner(context, call.error!),
                ],
              ]),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(context, astrologer, call, payment),
    );
  }
 
  Widget _buildAppBar(BuildContext context, Astrologer astrologer) {
    return SliverAppBar(
      expandedHeight: 240,
      pinned: true,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded),
        onPressed: () => context.pop(),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.share_rounded),
          onPressed: () {},
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.indigo, AppTheme.indigoMid],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 40),
                  CircleAvatar(
                    radius: 54,
                    backgroundColor: AppTheme.indigoLight,
                    backgroundImage: NetworkImage(astrologer.imageUrl),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    astrologer.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    astrologer.title,
                    style: TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 13,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
 
  Widget _buildProfileCard(BuildContext context, Astrologer astrologer) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _StatItem(
              value: '${astrologer.rating}',
              label: 'Rating',
              icon: Icons.star_rounded,
              iconColor: AppTheme.gold,
            ),
            _divider(),
            _StatItem(
              value: _formatCount(astrologer.reviewCount),
              label: 'Reviews',
              icon: Icons.chat_bubble_rounded,
              iconColor: AppTheme.indigoLight,
            ),
            _divider(),
            _StatItem(
              value: '${astrologer.yearsExperience}+',
              label: 'Years Exp.',
              icon: Icons.workspace_premium_rounded,
              iconColor: AppTheme.saffron,
            ),
          ],
        ),
      ),
    );
  }
 
  Widget _divider() => Container(
        width: 1,
        height: 40,
        color: AppTheme.textLight.withOpacity(0.3),
      );
 
  Widget _buildStats(BuildContext context, Astrologer astrologer) {
    return Row(
      children: [
        Expanded(
          child: _InfoBox(
            label: 'Rate',
            value: astrologer.rateFormatted,
            icon: Icons.currency_rupee_rounded,
            color: AppTheme.saffron,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _InfoBox(
            label: 'Status',
            value: astrologer.isAvailable ? 'Available' : 'Busy',
            icon: Icons.circle,
            color: astrologer.isAvailable ? AppTheme.callGreen : AppTheme.error,
          ),
        ),
      ],
    );
  }
 
  Widget _buildBio(BuildContext context, Astrologer astrologer) {
    return _Section(
      title: 'About',
      child: Text(
        astrologer.bio,
        style: TextStyle(
          fontSize: 14,
          color: AppTheme.textMid,
          height: 1.6,
          fontFamily: 'Poppins',
        ),
      ),
    );
  }
 
  Widget _buildSpecializations(BuildContext context, Astrologer astrologer) {
    return _Section(
      title: 'Specializations',
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: astrologer.specializations
            .map(
              (s) => Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.saffron.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: AppTheme.saffron.withOpacity(0.3), width: 1),
                ),
                child: Text(
                  s,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.saffron,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
 
  Widget _buildLanguages(BuildContext context, Astrologer astrologer) {
    return _Section(
      title: 'Languages',
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: astrologer.languages
            .map(
              (l) => Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.indigoLight.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: AppTheme.indigoLight.withOpacity(0.3), width: 1),
                ),
                child: Text(
                  l,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.indigoLight,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
 
  Widget _buildErrorBanner(BuildContext context, String error) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.error.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded,
              color: AppTheme.error, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              error,
              style: const TextStyle(
                color: AppTheme.error,
                fontSize: 13,
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }
 
  Widget _buildBottomBar(
    BuildContext context,
    Astrologer astrologer,
    CallProvider call,
    PaymentProvider payment,
  ) {
    final canCall = astrologer.isAvailable &&
        payment.walletBalance >= astrologer.ratePerMinute;
 
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppTheme.indigo.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Wallet balance row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.account_balance_wallet_rounded,
                      color: AppTheme.textMid, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Balance: ${payment.walletFormatted}',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.textMid,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
              if (!canCall)
                TextButton(
                  onPressed: () => context.push(AppRouter.wallet),
                  child: const Text(
                    'Recharge',
                    style: TextStyle(
                      color: AppTheme.saffron,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: canCall
                ? () async {
                    context.read<CallProvider>().clearError();
                    await context.read<CallProvider>().startCall(
                          astrologer: astrologer,
                          appId: '',
                        );
                    if (context.mounted &&
                        context.read<CallProvider>().error == null) {
                      context.push(AppRouter.call);
                    }
                  }
                : null,
            icon: const Icon(Icons.phone_rounded),
            label: Text(
              canCall
                  ? 'Start Call · ${astrologer.rateFormatted}'
                  : astrologer.isAvailable
                      ? 'Recharge to Call'
                      : 'Astrologer Busy',
            ),
          ),
        ],
      ),
    );
  }
 
  String _formatCount(int count) {
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}k';
    return count.toString();
  }
}
 
// ── Reusable sub-widgets ──────────────────────────────────────────────────────
 
class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color iconColor;
  const _StatItem(
      {required this.value,
      required this.label,
      required this.icon,
      required this.iconColor});
 
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textDark,
            fontFamily: 'Poppins',
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: AppTheme.textMid,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
}
 
class _InfoBox extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _InfoBox(
      {required this.label,
      required this.value,
      required this.icon,
      required this.color});
 
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: AppTheme.textMid,
                  fontFamily: 'Poppins',
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: color,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
 
class _Section extends StatelessWidget {
  final String title;
  final Widget child;
  const _Section({required this.title, required this.child});
 
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppTheme.textDark,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 10),
        child,
      ],
    );
  }
}
