import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/catalog_product.dart';
import '../repositories/child_profile_repository.dart';
import '../services/home_feed_ranking.dart';
import '../services/kkokkafit_engine.dart';
import '../theme/kkokkapick_theme.dart';
import '../widgets/approved_commerce.dart';
import '../widgets/discovery_experience.dart';

typedef ProductCallback = void Function(CatalogProduct product);

class ApprovedHomeTab extends StatelessWidget {
  const ApprovedHomeTab({
    super.key,
    required this.products,
    required this.favoriteIds,
    required this.alerts,
    required this.profile,
    required this.onFavorite,
    required this.onProductTap,
    required this.onSearch,
    required this.onExplore,
    required this.onEditProfile,
  });

  final List<CatalogProduct> products;
  final Set<String> favoriteIds;
  final Map<String, int> alerts;
  final ChildProfile? profile;
  final ValueChanged<String> onFavorite;
  final ProductCallback onProductTap;
  final VoidCallback onSearch;
  final VoidCallback onExplore;
  final VoidCallback onEditProfile;

  @override
  Widget build(BuildContext context) {
    const ranking = HomeFeedRankingService();
    final signals = HomeFeedSignals(
      profile: profile,
      favoriteProductIds: favoriteIds,
      priceAlertProductIds: alerts.keys.toSet(),
    );
    final personalized = ranking.rankPersonalized(products, signals, limit: 4);
    final discovery = ranking.rankTrending(products, limit: 8);
    final categories = <String>[
      '전체',
      ...{for (final p in products) p.category}.where((e) => e.trim().isNotEmpty).take(7),
    ];

    return CustomScrollView(
      key: const PageStorageKey('approved-home'),
      slivers: [
        SliverToBoxAdapter(
          child: SafeArea(
            bottom: false,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              ApprovedHeader(
                trailing: [
                  IconButton(
                    tooltip: '찜',
                    onPressed: onExplore,
                    icon: const Icon(Icons.favorite_border_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              CommerceSearchField(readOnly: true, onTap: onSearch),
              const SizedBox(height: 6),
              CategoryStrip(
                categories: categories,
                selected: '전체',
                onSelected: (_) => onExplore(),
              ),
              if (profile == null)
                _ProfileNudge(onTap: onEditProfile)
              else
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 2),
                  child: Row(children: [
                    const Icon(Icons.auto_awesome_rounded,
                        size: 17, color: KkokkapickTheme.lavenderDeep),
                    const SizedBox(width: 7),
                    Text('${profile!.months}개월 · ${profile!.heightCm.toStringAsFixed(0)}cm 기준 추천',
                        style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: KkokkapickTheme.lavenderDeep)),
                  ]),
                ),
              CommerceSectionHeader(
                title: personalized.evidence == HomeFeedEvidence.personalized
                    ? '우리 아이에게 추천해요'
                    : '추천 상품',
                subtitle: personalized.evidence == HomeFeedEvidence.personalized
                    ? '아이 정보와 관심 상품을 바탕으로 자동으로 골랐어요'
                    : '상품 정보가 충실한 아이템부터 보여드려요',
                actionLabel: '더보기',
                onAction: onExplore,
              ),
            ]),
          ),
        ),
        SliverToBoxAdapter(
          child: ApprovedProductGrid(
            products: personalized.items,
            favoriteIds: favoriteIds,
            alerts: alerts,
            limit: 4,
            onFavorite: onFavorite,
            onTap: onProductTap,
          ),
        ),
        SliverToBoxAdapter(
          child: CommerceSectionHeader(
            title: discovery.supportsPopularityClaim ? '지금 많이 보는 상품' : '지금 만나볼 상품',
            subtitle: discovery.supportsPopularityClaim
                ? '최근 반응을 반영해 자동으로 업데이트돼요'
                : '카탈로그 품질과 가격 정보를 기준으로 자동 구성돼요',
            actionLabel: '전체 보기',
            onAction: onExplore,
          ),
        ),
        SliverToBoxAdapter(
          child: ApprovedProductGrid(
            products: discovery.items,
            favoriteIds: favoriteIds,
            alerts: alerts,
            limit: 8,
            onFavorite: onFavorite,
            onTap: onProductTap,
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ],
    );
  }
}

class _ProfileNudge extends StatelessWidget {
  const _ProfileNudge({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 2),
        child: Material(
          color: KkokkapickTheme.lavenderSoft,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Row(children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                  child: const Icon(Icons.child_care_rounded,
                      color: KkokkapickTheme.lavenderDeep),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('아이 정보를 알려주세요',
                        style: TextStyle(fontWeight: FontWeight.w900)),
                    SizedBox(height: 3),
                    Text('월령·키·몸무게로 추천과 꼬까핏을 더 정확하게 만들어요',
                        style: TextStyle(
                            fontSize: 12, color: KkokkapickTheme.muted, height: 1.35)),
                  ]),
                ),
                const Icon(Icons.chevron_right_rounded),
              ]),
            ),
          ),
        ),
      );
}

enum ApprovedSort { recommended, low, high }

class ApprovedSearchTab extends StatefulWidget {
  const ApprovedSearchTab({
    super.key,
    required this.products,
    required this.favoriteIds,
    required this.alerts,
    required this.onFavorite,
    required this.onProductTap,
  });
  final List<CatalogProduct> products;
  final Set<String> favoriteIds;
  final Map<String, int> alerts;
  final ValueChanged<String> onFavorite;
  final ProductCallback onProductTap;

  @override
  State<ApprovedSearchTab> createState() => _ApprovedSearchTabState();
}

class _ApprovedSearchTabState extends State<ApprovedSearchTab> {
  final _controller = TextEditingController();
  String _category = '전체';
  ApprovedSort _sort = ApprovedSort.recommended;
  bool _fitOnly = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<String> get _categories => <String>[
        '전체',
        ...{for (final p in widget.products) p.category}.where((e) => e.trim().isNotEmpty).toList()..sort(),
      ];

  List<CatalogProduct> get _visible {
    final terms = _controller.text
        .trim()
        .toLowerCase()
        .split(RegExp(r'\s+'))
        .where((e) => e.isNotEmpty)
        .toList();
    final out = widget.products.where((p) {
      final hay = '${p.displayName} ${p.brand ?? ''} ${p.category}'.toLowerCase();
      return (_category == '전체' || p.category == _category) &&
          (!_fitOnly || p.fitStatus == 'verified') &&
          terms.every(hay.contains);
    }).toList();
    switch (_sort) {
      case ApprovedSort.low:
        out.sort((a, b) => (a.minPrice ?? 1 << 62).compareTo(b.minPrice ?? 1 << 62));
      case ApprovedSort.high:
        out.sort((a, b) => (b.minPrice ?? 0).compareTo(a.minPrice ?? 0));
      case ApprovedSort.recommended:
        const ranking = HomeFeedRankingService();
        final order = ranking.rankTrending(out, limit: out.length).items;
        return order;
    }
    return out;
  }

  Future<void> _showFilterSheet() async {
    var nextFit = _fitOnly;
    var nextSort = _sort;
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('필터와 정렬',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 18),
              const Text('정렬', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              ...ApprovedSort.values.map((value) => RadioListTile<ApprovedSort>(
                    contentPadding: EdgeInsets.zero,
                    value: value,
                    groupValue: nextSort,
                    onChanged: (v) => setSheetState(() => nextSort = v!),
                    title: Text(switch (value) {
                      ApprovedSort.recommended => '추천순',
                      ApprovedSort.low => '낮은 가격순',
                      ApprovedSort.high => '높은 가격순',
                    }),
                  )),
              const Divider(height: 28),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: nextFit,
                onChanged: (v) => setSheetState(() => nextFit = v),
                title: const Text('꼬까핏 가능한 상품만',
                    style: TextStyle(fontWeight: FontWeight.w800)),
                subtitle: const Text('검증된 사이즈 정보가 있는 상품만 보여줘요'),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('적용하기'),
                ),
              ),
            ]),
          ),
        ),
      ),
    );
    if (result == true) setState(() { _fitOnly = nextFit; _sort = nextSort; });
  }

  @override
  Widget build(BuildContext context) {
    final visible = _visible;
    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        key: const PageStorageKey('approved-search'),
        slivers: [
          SliverToBoxAdapter(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const ApprovedHeader(title: '검색'),
              CommerceSearchField(
                controller: _controller,
                onChanged: (_) => setState(() {}),
                hintText: '상품명·브랜드 검색',
              ),
              const SizedBox(height: 5),
              CategoryStrip(
                categories: _categories,
                selected: _category,
                onSelected: (v) => setState(() => _category = v),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
                child: Row(children: [
                  Expanded(
                    child: Text('총 ${visible.length}개 상품',
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                  ),
                  OutlinedButton.icon(
                    onPressed: _showFilterSheet,
                    icon: const Icon(Icons.tune_rounded, size: 18),
                    label: const Text('필터'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: KkokkapickTheme.ink,
                      side: const BorderSide(color: Color(0xFFECE9F2)),
                    ),
                  ),
                ]),
              ),
            ]),
          ),
          if (visible.isEmpty)
            const SliverToBoxAdapter(
              child: ApprovedEmptyState(
                icon: Icons.search_off_rounded,
                title: '검색 결과가 없어요',
                message: '검색어나 필터를 조금 넓혀보세요.',
              ),
            )
          else
            SliverToBoxAdapter(
              child: ApprovedProductGrid(
                products: visible,
                favoriteIds: widget.favoriteIds,
                alerts: widget.alerts,
                onFavorite: widget.onFavorite,
                onTap: widget.onProductTap,
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 30)),
        ],
      ),
    );
  }
}

class ApprovedFavoritesTab extends StatefulWidget {
  const ApprovedFavoritesTab({
    super.key,
    required this.products,
    required this.favoriteIds,
    required this.alerts,
    required this.onFavorite,
    required this.onProductTap,
    required this.onExplore,
  });
  final List<CatalogProduct> products;
  final Set<String> favoriteIds;
  final Map<String, int> alerts;
  final ValueChanged<String> onFavorite;
  final ProductCallback onProductTap;
  final VoidCallback onExplore;

  @override
  State<ApprovedFavoritesTab> createState() => _ApprovedFavoritesTabState();
}

class _ApprovedFavoritesTabState extends State<ApprovedFavoritesTab> {
  int _segment = 0;

  @override
  Widget build(BuildContext context) {
    final favorites = widget.products.where((p) => widget.favoriteIds.contains(p.id)).toList();
    final alertProducts = widget.products.where((p) => widget.alerts.containsKey(p.id)).toList();
    final list = _segment == 0 ? favorites : alertProducts;
    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        key: const PageStorageKey('approved-favorites'),
        slivers: [
          SliverToBoxAdapter(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const ApprovedHeader(title: '찜'),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 6, 16, 16),
                child: SegmentedButton<int>(
                  segments: [
                    ButtonSegment(value: 0, label: Text('찜한 상품 ${favorites.length}')),
                    ButtonSegment(value: 1, label: Text('가격 알림 ${alertProducts.length}')),
                  ],
                  selected: {_segment},
                  showSelectedIcon: false,
                  onSelectionChanged: (value) => setState(() => _segment = value.first),
                  style: ButtonStyle(
                    visualDensity: VisualDensity.compact,
                    backgroundColor: WidgetStateProperty.resolveWith((s) =>
                        s.contains(WidgetState.selected)
                            ? KkokkapickTheme.lavenderSoft
                            : Colors.white),
                  ),
                ),
              ),
            ]),
          ),
          if (list.isEmpty)
            SliverToBoxAdapter(
              child: ApprovedEmptyState(
                icon: _segment == 0 ? Icons.favorite_border_rounded : Icons.notifications_none_rounded,
                title: _segment == 0 ? '아직 찜한 상품이 없어요' : '설정한 가격 알림이 없어요',
                message: _segment == 0
                    ? '마음에 드는 상품의 하트를 눌러 모아보세요.'
                    : '상품 상세에서 원하는 가격을 정하면 여기에 모아드려요.',
                actionLabel: '상품 둘러보기',
                onAction: widget.onExplore,
              ),
            )
          else
            SliverToBoxAdapter(
              child: ApprovedProductGrid(
                products: list,
                favoriteIds: widget.favoriteIds,
                alerts: widget.alerts,
                onFavorite: widget.onFavorite,
                onTap: widget.onProductTap,
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 30)),
        ],
      ),
    );
  }
}

class ApprovedMyTab extends StatelessWidget {
  const ApprovedMyTab({
    super.key,
    required this.profile,
    required this.favoriteCount,
    required this.alertCount,
    required this.signedIn,
    required this.offlineAuthenticated,
    required this.onEditProfile,
    required this.onAuth,
    required this.onSignOut,
    required this.onDeleteAccount,
  });
  final ChildProfile? profile;
  final int favoriteCount;
  final int alertCount;
  final bool signedIn;
  final bool offlineAuthenticated;
  final VoidCallback onEditProfile;
  final VoidCallback onAuth;
  final VoidCallback onSignOut;
  final VoidCallback onDeleteAccount;

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: ListView(
          key: const PageStorageKey('approved-my'),
          padding: EdgeInsets.zero,
          children: [
            const ApprovedHeader(title: '마이'),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                    color: KkokkapickTheme.surface,
                    borderRadius: BorderRadius.circular(18)),
                child: Row(children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                        color: KkokkapickTheme.lavenderSoft, shape: BoxShape.circle),
                    child: const Icon(Icons.person_rounded,
                        color: KkokkapickTheme.lavenderDeep, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(signedIn ? '꼬까픽 계정' : '게스트로 이용 중',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 4),
                      Text(
                        offlineAuthenticated
                            ? '오프라인 상태예요. 연결되면 계정 동기화를 다시 시도해요.'
                            : signedIn
                                ? '찜과 아이 정보를 안전하게 동기화해요.'
                                : '로그인하면 기기 변경 후에도 데이터를 이어볼 수 있어요.',
                        style: const TextStyle(
                            fontSize: 12, color: KkokkapickTheme.muted, height: 1.4),
                      ),
                    ]),
                  ),
                  if (!signedIn)
                    TextButton(onPressed: onAuth, child: const Text('로그인')),
                ]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
              child: Row(children: [
                Expanded(child: _CountCard(label: '찜한 상품', count: favoriteCount)),
                const SizedBox(width: 10),
                Expanded(child: _CountCard(label: '가격 알림', count: alertCount)),
              ]),
            ),
            const CommerceSectionHeader(title: '아이 정보'),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Material(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: Color(0xFFECE9F2))),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: onEditProfile,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: profile == null
                        ? const Row(children: [
                            Icon(Icons.add_circle_outline_rounded,
                                color: KkokkapickTheme.lavenderDeep),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text('아이 정보 등록',
                                    style: TextStyle(fontWeight: FontWeight.w900)),
                                SizedBox(height: 3),
                                Text('추천과 꼬까핏 정확도를 높여요',
                                    style: TextStyle(
                                        fontSize: 12, color: KkokkapickTheme.muted)),
                              ]),
                            ),
                            Icon(Icons.chevron_right_rounded),
                          ])
                        : Row(children: [
                            Container(
                              width: 46,
                              height: 46,
                              decoration: const BoxDecoration(
                                  color: KkokkapickTheme.lavenderSoft,
                                  shape: BoxShape.circle),
                              child: const Icon(Icons.child_care_rounded,
                                  color: KkokkapickTheme.lavenderDeep),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('우리 아이',
                                    style: TextStyle(fontWeight: FontWeight.w900)),
                                const SizedBox(height: 4),
                                Wrap(spacing: 6, runSpacing: 6, children: [
                                  MetricPill(
                                      icon: Icons.calendar_today_outlined,
                                      label: '${profile!.months}개월'),
                                  MetricPill(
                                      icon: Icons.height_rounded,
                                      label: '${profile!.heightCm.toStringAsFixed(0)}cm'),
                                  MetricPill(
                                      icon: Icons.monitor_weight_outlined,
                                      label: '${profile!.weightKg.toStringAsFixed(1)}kg'),
                                ]),
                              ]),
                            ),
                            const Icon(Icons.chevron_right_rounded),
                          ]),
                  ),
                ),
              ),
            ),
            const CommerceSectionHeader(title: '서비스'),
            _MenuTile(
                icon: Icons.help_outline_rounded,
                title: '고객지원',
                subtitle: '문의와 자주 묻는 질문'),
            _MenuTile(
                icon: Icons.settings_outlined,
                title: '앱 설정',
                subtitle: '알림·개인정보·약관'),
            if (signedIn) ...[
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: OutlinedButton(onPressed: onSignOut, child: const Text('로그아웃')),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextButton(
                  onPressed: onDeleteAccount,
                  style: TextButton.styleFrom(foregroundColor: Colors.red.shade700),
                  child: const Text('계정 삭제'),
                ),
              ),
            ],
            const SizedBox(height: 36),
          ],
        ),
      );
}

class _CountCard extends StatelessWidget {
  const _CountCard({required this.label, required this.count});
  final String label;
  final int count;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFECE9F2))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('$count',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(label,
              style: const TextStyle(fontSize: 12, color: KkokkapickTheme.muted)),
        ]),
      );
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20),
        leading: Icon(icon),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: () => ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$title 화면은 릴리즈 준비 중이에요.'))),
      );
}

class ApprovedProductDetailPage extends StatefulWidget {
  const ApprovedProductDetailPage({
    super.key,
    required this.product,
    required this.profile,
    required this.favorite,
    required this.alertPrice,
    required this.onFavorite,
    required this.onSetAlert,
    required this.onEditProfile,
  });
  final CatalogProduct product;
  final ChildProfile? profile;
  final bool favorite;
  final int? alertPrice;
  final VoidCallback onFavorite;
  final Future<void> Function(int? price) onSetAlert;
  final VoidCallback onEditProfile;

  @override
  State<ApprovedProductDetailPage> createState() => _ApprovedProductDetailPageState();
}

class _ApprovedProductDetailPageState extends State<ApprovedProductDetailPage> {
  bool _favorite = false;
  int? _alertPrice;

  @override
  void initState() {
    super.initState();
    _favorite = widget.favorite;
    _alertPrice = widget.alertPrice;
  }

  Future<void> _priceAlert() async {
    final controller = TextEditingController(
        text: _alertPrice?.toString() ??
            ((widget.product.minPrice ?? 0) > 0
                ? ((widget.product.minPrice! * .9).round()).toString()
                : ''));
    final result = await showModalBottomSheet<int?>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
              20, 4, 20, MediaQuery.viewInsetsOf(context).bottom + 20),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text('가격 알림 설정',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w900)),
            const SizedBox(height: 6),
            const Text('원하는 가격 이하가 되면 알려드릴게요.',
                style: TextStyle(color: KkokkapickTheme.muted)),
            const SizedBox(height: 18),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: '희망 가격', prefixText: '₩ '),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                final value = int.tryParse(controller.text.replaceAll(',', ''));
                if (value != null && value > 0) Navigator.pop(context, value);
              },
              child: const Text('가격 알림 설정하기'),
            ),
            if (_alertPrice != null)
              TextButton(
                  onPressed: () => Navigator.pop(context, -1),
                  child: const Text('가격 알림 해제')),
          ]),
        ),
      ),
    );
    controller.dispose();
    if (result == null) return;
    final next = result == -1 ? null : result;
    await widget.onSetAlert(next);
    if (mounted) setState(() => _alertPrice = next);
  }

  Future<void> _openOffer(ProductOffer offer) async {
    final uri = Uri.tryParse(offer.affiliateUrl);
    if (uri == null || offer.affiliateUrl.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('구매 링크를 확인할 수 없어요.')));
      return;
    }
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('구매처를 열 수 없어요.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final fit = KkokkafitEngine().evaluate(widget.profile, p);
    final offers = [...p.offers]..sort((a, b) => (a.price ?? 1 << 62).compareTo(b.price ?? 1 << 62));
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(slivers: [
        SliverAppBar(
          pinned: true,
          backgroundColor: Colors.white,
          foregroundColor: KkokkapickTheme.ink,
          title: Text(p.brand ?? '상품 상세',
              maxLines: 1, overflow: TextOverflow.ellipsis),
          actions: [
            IconButton(
              tooltip: _favorite ? '찜 해제' : '찜하기',
              onPressed: () {
                widget.onFavorite();
                setState(() => _favorite = !_favorite);
              },
              icon: Icon(_favorite ? Icons.favorite : Icons.favorite_border,
                  color: _favorite ? KkokkapickTheme.lavenderDeep : null),
            ),
          ],
        ),
        SliverToBoxAdapter(
          child: AspectRatio(
            aspectRatio: 1,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(18)),
              child: ProductImage(url: p.imageUrl),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 0),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p.brand ?? '브랜드 확인',
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: KkokkapickTheme.muted)),
              const SizedBox(height: 6),
              Text(p.displayName,
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontSize: 22, height: 1.3, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Text(won(p.minPrice),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(height: 18),
              Row(children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _priceAlert,
                    icon: Icon(_alertPrice == null
                        ? Icons.notifications_none_rounded
                        : Icons.notifications_active_outlined),
                    label: Text(_alertPrice == null ? '가격 알림' : won(_alertPrice)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: offers.isEmpty ? null : () => _openOffer(offers.first),
                    child: const Text('구매처 보기'),
                  ),
                ),
              ]),
              const SizedBox(height: 26),
              Text('꼬까핏',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                    color: fit.status == 'recommended'
                        ? KkokkapickTheme.fit
                        : KkokkapickTheme.surface,
                    borderRadius: BorderRadius.circular(14)),
                child: Row(children: [
                  Icon(fit.status == 'recommended'
                      ? Icons.check_circle_outline_rounded
                      : Icons.info_outline_rounded),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(fit.label,
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                  ),
                  if (widget.profile == null)
                    TextButton(onPressed: widget.onEditProfile, child: const Text('입력')),
                ]),
              ),
              const SizedBox(height: 26),
              Text('판매처 비교',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
            ]),
          ),
        ),
        if (offers.isEmpty)
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 4, 16, 24),
              child: Text('현재 확인 가능한 판매처가 없어요.',
                  style: TextStyle(color: KkokkapickTheme.muted)),
            ),
          )
        else
          SliverList.separated(
            itemCount: offers.length,
            separatorBuilder: (_, __) => const Divider(height: 1, indent: 16, endIndent: 16),
            itemBuilder: (context, index) {
              final offer = offers[index];
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
                leading: CircleAvatar(
                  backgroundColor: index == 0
                      ? KkokkapickTheme.lavenderSoft
                      : KkokkapickTheme.surface,
                  child: Text('${index + 1}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: KkokkapickTheme.lavenderDeep)),
                ),
                title: Text(offer.merchant,
                    style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: index == 0 ? const Text('현재 최저가') : null,
                trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text(won(offer.price),
                      style: const TextStyle(fontWeight: FontWeight.w900)),
                  const SizedBox(width: 8),
                  const Icon(Icons.open_in_new_rounded, size: 18),
                ]),
                onTap: () => _openOffer(offer),
              );
            },
          ),
        const SliverToBoxAdapter(child: SizedBox(height: 40)),
      ]),
    );
  }
}
