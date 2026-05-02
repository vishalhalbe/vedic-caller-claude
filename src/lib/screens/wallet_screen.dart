// lib/screens/wallet_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/payment_provider.dart';
import '../services/payment_service.dart';
import '../theme/app_theme.dart';
 
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});
 
  @override
  Widget build(BuildContext context) {
    final payment = context.watch<PaymentProvider>();
 
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Wallet'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBalanceCard(context, payment),
            const SizedBox(height: 28),
            _buildRechargeSection(context, payment),
            if (payment.state == PaymentState.success) ...[
              const SizedBox(height: 20),
              _buildSuccessBanner(context, payment),
            ],
            if (payment.state == PaymentState.failed &&
                payment.errorMessage != null) ...[
              const SizedBox(height: 20),
              _buildErrorBanner(context, payment.errorMessage!),
            ],
          ],
        ),
      ),
    );
  }
 
  Widget _buildBalanceCard(BuildContext context, PaymentProvider payment) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.indigo, AppTheme.indigoMid],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.indigo.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.account_balance_wallet_rounded,
                  color: AppTheme.gold, size: 22),
              SizedBox(width: 8),
              Text(
                'AstroCall Wallet',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            payment.walletFormatted,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 38,
              fontWeight: FontWeight.w700,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Available balance',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 13,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const Icon(Icons.info_outline_rounded,
                  color: Colors.white54, size: 14),
              const SizedBox(width: 4),
              Text(
                'Balance never expires',
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
 
  Widget _buildRechargeSection(BuildContext context, PaymentProvider payment) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recharge Wallet',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textDark,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Select a pack to instantly add credits',
          style: TextStyle(
            fontSize: 13,
            color: AppTheme.textMid,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
          ),
          itemCount: PaymentService.packages.length,
          itemBuilder: (context, index) {
            final pkg = PaymentService.packages[index];
            return _PackageCard(
              package: pkg,
              isSelected:
                  payment.selectedPackage?.amountPaise == pkg.amountPaise,
              onTap: () => payment.selectPackage(pkg),
            );
          },
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: payment.selectedPackage != null && !payment.isLoading
              ? () => payment.initiateRecharge(
                    package: payment.selectedPackage!,
                    userName: 'User',
                    userEmail: 'user@example.com',
                    userPhone: '9999999999',
                  )
              : null,
          child: payment.isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(
                  payment.selectedPackage != null
                      ? 'Pay ${payment.selectedPackage!.label}'
                      : 'Select a Pack',
                ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_rounded, size: 14, color: AppTheme.textMid),
              const SizedBox(width: 4),
              Text(
                'Secured by Razorpay',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.textMid,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
 
  Widget _buildSuccessBanner(BuildContext context, PaymentProvider payment) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.success.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.success.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle_rounded,
              color: AppTheme.success, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Recharge Successful!',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.success,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  '₹${((payment.lastRechargeAmount ?? 0) / 100).toStringAsFixed(0)} added to your wallet',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.textMid,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
 
  Widget _buildErrorBanner(BuildContext context, String message) {
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
              message,
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
}
 
class _PackageCard extends StatelessWidget {
  final RechargePackage package;
  final bool isSelected;
  final VoidCallback onTap;
  const _PackageCard(
      {required this.package,
      required this.isSelected,
      required this.onTap});
 
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.saffron.withOpacity(0.1)
              : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppTheme.saffron : AppTheme.textLight,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppTheme.indigo.withOpacity(0.06),
              blurRadius: 10,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  package.label,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? AppTheme.saffron : AppTheme.textDark,
                    fontFamily: 'Poppins',
                  ),
                ),
                if (package.tag != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.gold,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      package.tag!,
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textDark,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (package.bonus > 0)
                  Text(
                    package.bonusLabel,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.success,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                Text(
                  package.totalLabel,
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.textMid,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
