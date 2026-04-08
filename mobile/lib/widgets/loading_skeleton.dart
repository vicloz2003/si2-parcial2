import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Caja de skeleton con shimmer.
class SkeletonBox extends StatelessWidget {
  final double? width;
  final double height;
  final BorderRadius? borderRadius;

  const SkeletonBox({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: context.appColors.surface,
        borderRadius: borderRadius ?? BorderRadius.circular(AppRadius.sm),
      ),
    );
  }
}

/// Wrapper que aplica shimmer a sus children.
class AppShimmer extends StatelessWidget {
  final Widget child;
  const AppShimmer({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: context.appColors.surfaceAlt,
      highlightColor: context.appColors.surface,
      period: const Duration(milliseconds: 1400),
      child: child,
    );
  }
}

/// Skeleton para una tarjeta tipica de incidente.
class IncidentCardSkeleton extends StatelessWidget {
  const IncidentCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return AppShimmer(
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: context.appColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                SkeletonBox(width: 70, height: 22),
                SizedBox(width: 8),
                SkeletonBox(width: 60, height: 22),
                Spacer(),
                SkeletonBox(width: 80, height: 22),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            const SkeletonBox(width: double.infinity, height: 14),
            const SizedBox(height: AppSpacing.sm),
            const SkeletonBox(width: 200, height: 14),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: const [
                SkeletonBox(width: 14, height: 14),
                SizedBox(width: 8),
                SkeletonBox(width: 140, height: 12),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class IncidentListSkeleton extends StatelessWidget {
  final int itemCount;
  const IncidentListSkeleton({super.key, this.itemCount = 4});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.md,
        100,
      ),
      itemCount: itemCount,
      itemBuilder: (_, _) => const IncidentCardSkeleton(),
    );
  }
}
