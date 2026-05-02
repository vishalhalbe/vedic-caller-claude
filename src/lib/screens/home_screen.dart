// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/astrologer.dart';
import '../providers/payment_provider.dart';
import '../theme/app_theme.dart';
import '../router.dart';
 
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
 
  @override
  Widget build(BuildContext context) {
    final payment = context.watch<PaymentProvider>();
 
    return Scaffold(
      backgroundColor: AppTheme.cream,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context, payment),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _buildSectionHeader('Top Astrologers'),
                const SizedBox(height: 12),
                _AstrologerCard(astrologer: Astrologer.demo),
              ]),
            ),
          ),
        ],
      ),
    );
  }
 
  Widget _buildSliverAppBar(BuildContext context, PaymentProvider payment) {
    return SliverAppBar(
      expandedHeight: 160,
      pinned: true,
      backgroundColor: AppTheme.indigo,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppTheme.indigo, AppTheme.indigoMid],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Namaste 🙏',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: AppTheme.textLight),
                          ),
                          const Text(
                            'AstroCall',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                      // Wallet chip
                      GestureDetector(
                        onTap: () => context.push(AppRouter.wallet),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.2),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.account_balance_wallet_rounded,
                                  color: AppTheme.gold, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                payment.walletFormatted,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Connect with expert Vedic astrologers',
                    style: TextStyle(
                      color: AppTheme.textLight,
                      fontSize: 13,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
 
  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppTheme.textDark,
        fontFamily: 'Poppins',
      ),
    );
  }
}
 
// ── Astrologer Card ────────────────────────────────────────────────────────────
 
class _AstrologerCard extends StatelessWidget {
  final Astrologer astrologer;
  const _AstrologerCard({required this.astrologer});
 
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(AppRouter.astrologer),
      child: Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  // Avatar
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 38,
                        backgroundColor: AppTheme.indigoLight,
                        backgroundImage: NetworkImage(astrologer.imageUrl),
                      ),
                      if (astrologer.isAvailable)
                        Positioned(
                          bottom: 2,
                          right: 2,
                          child: Container(
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              color: AppTheme.callGreen,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          astrologer.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textDark,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        Text(
                          astrologer.title,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.textMid,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded,
                                color: AppTheme.gold, size: 16),
                            const SizedBox(width: 2),
                            Text(
                              '${astrologer.rating}',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.textDark,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            Text(
                              ' (${_formatCount(astrologer.reviewCount)})',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textMid,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.work_rounded,
                                color: AppTheme.textMid, size: 14),
                            const SizedBox(width: 2),
                            Text(
                              '${astrologer.yearsExperience} yrs',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textMid,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Rate + CTA
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        astrologer.rateFormatted,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.saffron,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: astrologer.isAvailable
                              ? AppTheme.saffron
                              : AppTheme.textLight,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          astrologer.isAvailable ? 'Call Now' : 'Busy',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Specialization chips
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: astrologer.specializations
                    .take(4)
                    .map(
                      (s) => Chip(
                        label: Text(s),
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
 
  String _formatCount(int count) {
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}k';
    return count.toString();
  }
}
