// lib/screens/post_call_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/call_provider.dart';
import '../providers/payment_provider.dart';
import '../theme/app_theme.dart';
import '../router.dart';
 
class PostCallScreen extends StatefulWidget {
  const PostCallScreen({super.key});
 
  @override
  State<PostCallScreen> createState() => _PostCallScreenState();
}
 
class _PostCallScreenState extends State<PostCallScreen> {
  int _rating = 0;
  final _feedbackController = TextEditingController();
 
  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }
 
  @override
  Widget build(BuildContext context) {
    final call = context.watch<CallProvider>();
    final payment = context.watch<PaymentProvider>();
    final session = call.currentSession;
 
    return Scaffold(
      appBar: AppBar(
        title: const Text('Call Summary'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildSummaryCard(context, call, session),
            const SizedBox(height: 20),
            _buildRatingCard(),
            const SizedBox(height: 20),
            _buildWalletCard(payment),
            const SizedBox(height: 32),
            _buildActions(context),
          ],
        ),
      ),
    );
  }
 
  Widget _buildSummaryCard(BuildContext context, CallProvider call, session) {
    final astrologer = call.astrologer;
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Header
            Row(
              children: [
                if (astrologer != null)
                  CircleAvatar(
                    radius: 28,
                    backgroundImage: NetworkImage(astrologer.imageUrl),
                    backgroundColor: AppTheme.indigoLight,
                  ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      astrologer?.name ?? 'Astrologer',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textDark,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const Text(
                      'Call Completed',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppTheme.success,
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                const Icon(Icons.check_circle_rounded,
                    color: AppTheme.success, size: 32),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 12),
            // Stats grid
            Row(
              children: [
                Expanded(
                  child: _SummaryItem(
                    label: 'Duration',
                    value: session?.formattedDuration ?? call.formattedDuration,
                    icon: Icons.timer_rounded,
                    color: AppTheme.indigoLight,
                  ),
                ),
                Expanded(
                  child: _SummaryItem(
                    label: 'Amount Charged',
                    value: session?.costFormatted ?? '₹0',
                    icon: Icons.currency_rupee_rounded,
                    color: AppTheme.saffron,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
 
  Widget _buildRatingCard() {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Rate Your Experience',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppTheme.textDark,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'How was your consultation?',
              style: TextStyle(
                fontSize: 13,
                color: AppTheme.textMid,
                fontFamily: 'Poppins',
              ),
            ),
            const SizedBox(height: 16),
            // Star rating
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                5,
                (index) => GestureDetector(
                  onTap: () => setState(() => _rating = index + 1),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Icon(
                      _rating > index ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: _rating > index ? AppTheme.gold : AppTheme.textLight,
                      size: 40,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _feedbackController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Share your feedback (optional)',
                hintStyle: TextStyle(
                  color: AppTheme.textLight,
                  fontFamily: 'Poppins',
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
 
  Widget _buildWalletCard(PaymentProvider payment) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppTheme.gold.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.account_balance_wallet_rounded,
                  color: AppTheme.gold),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Remaining Balance',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.textMid,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  payment.walletFormatted,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textDark,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
            const Spacer(),
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
      ),
    );
  }
 
  Widget _buildActions(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: () {
            // In production: submit rating to backend
            context.go(AppRouter.home);
          },
          child: Text(_rating > 0 ? 'Submit & Go Home' : 'Go Home'),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => context.go(AppRouter.astrologer),
          icon: const Icon(Icons.phone_rounded),
          label: const Text('Call Again'),
        ),
      ],
    );
  }
}
 
class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _SummaryItem(
      {required this.label,
      required this.value,
      required this.icon,
      required this.color});
 
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 6),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: color,
            fontFamily: 'Poppins',
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textMid,
            fontFamily: 'Poppins',
          ),
        ),
      ],
    );
  }
}
