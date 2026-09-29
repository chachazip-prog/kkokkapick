import 'package:flutter/material.dart';

import '../models/catalog_product.dart';
import '../theme/kkokkapick_theme.dart';
import 'brand_identity.dart';
import 'discovery_experience.dart';

String won(int? value) {
  if (value == null || value <= 0) return '가격 확인';
  final raw = value.toString();
  return '${raw.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',')}원';
}

class ApprovedHeader extends StatelessWidget {
  const ApprovedHeader({super.key, this.title, this.trailing = const []});
  final String? title;
  final List<Widget> trailing;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Row(children: [
          if (title == null)
            const KkokkapickBrandMark(compact: true)
          else
            Expanded(
              child: Text(title!,
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall
                      ?.copyWith(fontSize: 24, fontWeight: FontWeight.w900)),
            ),
          if (title == null) const Spacer(),
          ...trailing,
        ]),
      );
}

class CommerceSearchField extends StatelessWidget {
  const CommerceSearchField({
    super.key,
    this.controller,
    this.readOnly = false,
    this.onTap,
    this.onChanged,
    this.autofocus = false,
    this.hintText = '상품이나 브랜드를 검색해보세요',
  });
  final TextEditingController? controller;
  final bool readOnly;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final bool autofocus;
  final String hintText;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: TextField(
          controller: controller,
          readOnly: readOnly,
          onTap: onTap,
          onChanged: onChanged,
          autofocus: autofocus,
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(
            hintText: hintText,
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: controller != null && controller!.text.isNotEmpty
                ? IconButton(
                    tooltip: '검색어 지우기',
                    onPressed: () {
                      controller!.clear();
                      onChanged?.call('');
                    },
                    icon: const Icon(Icons.close_rounded),
                  )
                : null,
          ),
        ),
      );
}

class CategoryStrip extends StatelessWidget {
  const CategoryStrip({
    super.key,
    required this.categories,
    required this.selected,
    required this.onSelected,
  });
  final List<String> categories;
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 54,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          scrollDirection: Axis.horizontal,
          itemCount: categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final item = categories[index];
            final active = item == selected;
            return ChoiceChip(
              label: Text(item),
              selected: active,
              showCheckmark: false,
              onSelected: (_) => onSelected(item),
              labelStyle: TextStyle(
                fontSize: 13,
                fontWeight: active ? FontWeight.w800 : FontWeight.w600,
                color: active ? KkokkapickTheme.lavenderDeep : KkokkapickTheme.ink,
              ),
            );
          },
        ),
      );
}

class CommerceSectionHeader extends StatelessWidget {
  const CommerceSectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title,
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontSize: 20, fontWeight: FontWeight.w900)),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(subtitle!,
                    style: const TextStyle(
                        fontSize: 12, color: KkokkapickTheme.muted, height: 1.35)),
              ],
            ]),
          ),
          if (actionLabel != null)
            TextButton(
              onPressed: onAction,
              child: Text(actionLabel!,
                  style: const TextStyle(
                      color: KkokkapickTheme.muted, fontWeight: FontWeight.w600)),
            ),
        ]),
      );
}

class ApprovedProductCard extends StatelessWidget {
  const ApprovedProductCard({
    super.key,
    required this.product,
    required this.favorite,
    required this.onFavorite,
    required this.onTap,
    this.alertPrice,
  });
  final CatalogProduct product;
  final bool favorite;
  final VoidCallback onFavorite;
  final VoidCallback onTap;
  final int? alertPrice;

  @override
  Widget build(BuildContext context) => Semantics(
        button: true,
        label: '${product.brand ?? ''} ${product.displayName} ${won(product.minPrice)}',
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Stack(fit: StackFit.expand, children: [
                  ProductImage(url: product.imageUrl),
                  Positioned(
                    top: 7,
                    right: 7,
                    child: SizedBox(
                      width: 44,
                      height: 44,
                      child: IconButton(
                        tooltip: favorite ? '찜 해제' : '찜하기',
                        onPressed: onFavorite,
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: .94),
                          foregroundColor: favorite
                              ? KkokkapickTheme.lavenderDeep
                              : KkokkapickTheme.ink,
                        ),
                        icon: Icon(favorite ? Icons.favorite : Icons.favorite_border),
                      ),
                    ),
                  ),
                ]),
              ),
            ),
            const SizedBox(height: 9),
            Text(product.brand ?? '브랜드 확인',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: KkokkapickTheme.muted)),
            const SizedBox(height: 3),
            Text(product.displayName,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 14, height: 1.38, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(won(product.minPrice),
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
            if (alertPrice != null) ...[
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.notifications_none_rounded,
                    size: 14, color: KkokkapickTheme.lavenderDeep),
                const SizedBox(width: 4),
                Expanded(
                  child: Text('${won(alertPrice)} 알림',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 11,
                          color: KkokkapickTheme.lavenderDeep,
                          fontWeight: FontWeight.w700)),
                ),
              ]),
            ],
          ]),
        ),
      );
}

class ApprovedProductGrid extends StatelessWidget {
  const ApprovedProductGrid({
    super.key,
    required this.products,
    required this.favoriteIds,
    required this.onFavorite,
    required this.onTap,
    this.alerts = const {},
    this.limit,
  });
  final List<CatalogProduct> products;
  final Set<String> favoriteIds;
  final ValueChanged<String> onFavorite;
  final ValueChanged<CatalogProduct> onTap;
  final Map<String, int> alerts;
  final int? limit;

  @override
  Widget build(BuildContext context) {
    final data = limit == null ? products : products.take(limit!).toList();
    final width = MediaQuery.sizeOf(context).width;
    final ratio = width <= 340 ? .51 : .55;
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      itemCount: data.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 26,
        childAspectRatio: ratio,
      ),
      itemBuilder: (context, index) {
        final p = data[index];
        return ApprovedProductCard(
          product: p,
          favorite: favoriteIds.contains(p.id),
          alertPrice: alerts[p.id],
          onFavorite: () => onFavorite(p.id),
          onTap: () => onTap(p),
        );
      },
    );
  }
}

class ApprovedEmptyState extends StatelessWidget {
  const ApprovedEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 54),
        child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                  color: KkokkapickTheme.lavenderSoft, shape: BoxShape.circle),
              child: Icon(icon, size: 32, color: KkokkapickTheme.lavenderDeep),
            ),
            const SizedBox(height: 18),
            Text(title,
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: KkokkapickTheme.muted, height: 1.5)),
            if (actionLabel != null) ...[
              const SizedBox(height: 18),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ]),
        ),
      );
}

class MetricPill extends StatelessWidget {
  const MetricPill({super.key, required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
        decoration: BoxDecoration(
          color: KkokkapickTheme.surface,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 15, color: KkokkapickTheme.muted),
          const SizedBox(width: 5),
          Text(label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        ]),
      );
}
