import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'models/catalog_product.dart';
import 'repositories/catalog_repository.dart';
import 'repositories/child_profile_repository.dart';
import 'repositories/favorites_repository.dart';
import 'repositories/price_alert_repository.dart';
import 'services/home_feed_ranking.dart';
import 'services/kkokkafit_engine.dart';
import 'theme/kkokkapick_theme.dart';
import 'widgets/brand_identity.dart';
import 'widgets/discovery_experience.dart';

void runReleaseApp() => runApp(const KkokkapickReleaseApp());

class KkokkapickReleaseApp extends StatelessWidget {
  const KkokkapickReleaseApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: '꼬까픽',
        debugShowCheckedModeBanner: false,
        theme: KkokkapickTheme.light(),
        home: const ReleaseShell(),
      );
}

enum ReleaseSort { recommended, low, high }

class ReleaseShell extends StatefulWidget {
  const ReleaseShell({super.key});

  @override
  State<ReleaseShell> createState() => _ReleaseShellState();
}

class _ReleaseShellState extends State<ReleaseShell> {
  static final _demoEndpoint = Uri.parse(
    'https://chachazip-prog.github.io/kkokkapick/data/catalog.json',
  );
  static const _supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const _supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  final _catalog = CatalogRepository();
  final _favorites = FavoritesRepository();
  final _profiles = ChildProfileRepository();
  final _alerts = PriceAlertRepository();
  final _ranking = const HomeFeedRankingService();
  final _search = TextEditingController();

  List<CatalogProduct> _products = const [];
  Set<String> _favoriteIds = <String>{};
  Map<String, int> _priceAlerts = <String, int>{};
  ChildProfile? _profile;
  String _category = '전체';
  ReleaseSort _sort = ReleaseSort.recommended;
  int _tab = 0;
  bool _loading = true;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final catalogFuture = _supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty
          ? _catalog.fetchSupabase(
              supabaseUrl: _supabaseUrl,
              anonKey: _supabaseAnonKey,
            )
          : _catalog.fetchCatalog(_demoEndpoint);
      final values = await Future.wait<Object?>([
        catalogFuture,
        _favorites.load(),
        _profiles.load(),
        _alerts.loadAll(),
      ]);
      if (!mounted) return;
      setState(() {
        _products = values[0] as List<CatalogProduct>;
        _favoriteIds = values[1] as Set<String>;
        _profile = values[2] as ChildProfile?;
        _priceAlerts = values[3] as Map<String, int>;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  List<String> get _categories {
    final values = <String>{for (final p in _products) p.category}.toList()..sort();
    return ['전체', ...values];
  }

  List<CatalogProduct> get _searchResults {
    final terms = _search.text
        .trim()
        .toLowerCase()
        .split(RegExp(r'\s+'))
        .where((term) => term.isNotEmpty)
        .toList();
    final out = _products.where((p) {
      final hay = '${p.displayName} ${p.brand ?? ''} ${p.category} ${p.stage ?? ''}'
          .toLowerCase();
      return (_category == '전체' || p.category == _category) &&
          terms.every(hay.contains);
    }).toList();
    switch (_sort) {
      case ReleaseSort.low:
        out.sort((a, b) => (a.minPrice ?? 1 << 62).compareTo(b.minPrice ?? 1 << 62));
      case ReleaseSort.high:
        out.sort((a, b) => (b.minPrice ?? 0).compareTo(a.minPrice ?? 0));
      case ReleaseSort.recommended:
        final ranked = _ranking.rankPersonalized(
          out,
          _signals,
          limit: out.length,
        );
        return ranked.items;
    }
    return out;
  }

  HomeFeedSignals get _signals => HomeFeedSignals(
        profile: _profile,
        favoriteProductIds: _favoriteIds,
        priceAlertProductIds: _priceAlerts.keys.toSet(),
      );

  RankedHomeFeed get _personalized =>
      _ranking.rankPersonalized(_products, _signals, limit: 8);

  RankedHomeFeed get _discovery =>
      _ranking.rankTrending(_products, limit: 12);

  Future<void> _toggleFavorite(CatalogProduct product) async {
    setState(() {
      if (!_favoriteIds.add(product.id)) _favoriteIds.remove(product.id);
    });
    await _favorites.save(_favoriteIds);
  }

  Future<void> _editProfile() async {
    final months = TextEditingController(text: _profile?.months.toString() ?? '');
    final height = TextEditingController(text: _profile?.heightCm.toString() ?? '');
    final weight = TextEditingController(text: _profile?.weightKg.toString() ?? '');
    final saved = await showModalBottomSheet<ChildProfile>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            20,
            0,
            20,
            MediaQuery.viewInsetsOf(context).bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                '우리 아이 정보를 알려주세요',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 6),
              const Text(
                '월령과 성장 정보를 바탕으로 더 잘 맞는 상품을 추천해요.',
                style: TextStyle(color: KkokkapickTheme.muted),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: months,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '월령', hintText: '예: 8'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: height,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: '키', suffixText: 'cm'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: weight,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: '몸무게', suffixText: 'kg'),
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: () {
                  final profile = ChildProfile(
                    months: int.tryParse(months.text) ?? 0,
                    heightCm: double.tryParse(height.text) ?? 0,
                    weightKg: double.tryParse(weight.text) ?? 0,
                  );
                  if (profile.months > 0 &&
                      profile.heightCm > 0 &&
                      profile.weightKg > 0) {
                    Navigator.pop(context, profile);
                  }
                },
                child: const Text('완료하기'),
              ),
              const SizedBox(height: 4),
            ],
          ),
        ),
      ),
    );
    months.dispose();
    height.dispose();
    weight.dispose();
    if (saved != null) {
      await _profiles.save(saved);
      if (mounted) setState(() => _profile = saved);
    }
  }

  Future<void> _setPriceAlert(CatalogProduct product) async {
    final initial = _priceAlerts[product.id] ?? product.minPrice;
    final controller = TextEditingController(text: initial?.toString() ?? '');
    final value = await showModalBottomSheet<int?>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            0,
            20,
            MediaQuery.viewInsetsOf(context).bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                '가격 알림 설정',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                product.displayName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: KkokkapickTheme.muted),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                autofocus: true,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: '희망 가격',
                  prefixText: '₩ ',
                ),
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () => Navigator.pop(
                  context,
                  int.tryParse(controller.text.replaceAll(',', '')),
                ),
                child: const Text('가격 알림 설정하기'),
              ),
              if (_priceAlerts.containsKey(product.id))
                TextButton(
                  onPressed: () => Navigator.pop(context, 0),
                  child: const Text('가격 알림 해제'),
                ),
            ],
          ),
        ),
      ),
    );
    controller.dispose();
    if (value == null) return;
    await _alerts.set(product.id, value > 0 ? value : null);
    if (!mounted) return;
    setState(() {
      if (value > 0) {
        _priceAlerts[product.id] = value;
      } else {
        _priceAlerts.remove(product.id);
      }
    });
  }

  Future<void> _showProduct(CatalogProduct product) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => _ProductDetailSheet(
        product: product,
        profile: _profile,
        favorite: _favoriteIds.contains(product.id),
        alertPrice: _priceAlerts[product.id],
        onFavorite: () => _toggleFavorite(product),
        onPriceAlert: () => _setPriceAlert(product),
      ),
    );
  }

  void _openSearch({String? category}) {
    setState(() {
      _tab = 1;
      if (category != null) _category = category;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const KkokkapickLaunchSurface();
    if (_error != null) {
      return Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.cloud_off_outlined, size: 42),
                  const SizedBox(height: 12),
                  const Text('상품 정보를 불러오지 못했어요.'),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: _load, child: const Text('다시 시도')),
                ],
              ),
            ),
          ),
        ),
      );
    }

    final pages = [
      _HomePage(
        products: _products,
        categories: _categories,
        profile: _profile,
        personalized: _personalized,
        discovery: _discovery,
        favorites: _favoriteIds,
        onSearch: () => _openSearch(),
        onCategory: (category) => _openSearch(category: category),
        onProfile: _editProfile,
        onFavorite: _toggleFavorite,
        onProduct: _showProduct,
      ),
      _SearchPage(
        controller: _search,
        categories: _categories,
        category: _category,
        sort: _sort,
        products: _searchResults,
        favorites: _favoriteIds,
        onChanged: () => setState(() {}),
        onCategory: (value) => setState(() => _category = value),
        onSort: (value) => setState(() => _sort = value),
        onFavorite: _toggleFavorite,
        onProduct: _showProduct,
      ),
      _FavoritesPage(
        products: _products.where((p) => _favoriteIds.contains(p.id)).toList(),
        alerts: _priceAlerts,
        favorites: _favoriteIds,
        onFavorite: _toggleFavorite,
        onProduct: _showProduct,
        onExplore: () => _openSearch(),
        onAlert: _setPriceAlert,
      ),
      _MyPage(
        profile: _profile,
        favoriteCount: _favoriteIds.length,
        alertCount: _priceAlerts.length,
        onEditProfile: _editProfile,
        onFavorites: () => setState(() => _tab = 2),
        onSearch: () => _openSearch(),
      ),
    ];

    return Scaffold(
      body: IndexedStack(index: _tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (index) => setState(() => _tab = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: '홈',
          ),
          NavigationDestination(icon: Icon(Icons.search_rounded), label: '검색'),
          NavigationDestination(
            icon: Icon(Icons.favorite_border_rounded),
            selectedIcon: Icon(Icons.favorite_rounded),
            label: '찜',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: '마이',
          ),
        ],
      ),
    );
  }
}

class _HomePage extends StatelessWidget {
  const _HomePage({
    required this.products,
    required this.categories,
    required this.profile,
    required this.personalized,
    required this.discovery,
    required this.favorites,
    required this.onSearch,
    required this.onCategory,
    required this.onProfile,
    required this.onFavorite,
    required this.onProduct,
  });

  final List<CatalogProduct> products;
  final List<String> categories;
  final ChildProfile? profile;
  final RankedHomeFeed personalized;
  final RankedHomeFeed discovery;
  final Set<String> favorites;
  final VoidCallback onSearch;
  final ValueChanged<String> onCategory;
  final VoidCallback onProfile;
  final ValueChanged<CatalogProduct> onFavorite;
  final ValueChanged<CatalogProduct> onProduct;

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: () async {},
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const KkokkapickBrandMark(compact: true),
                          const Spacer(),
                          IconButton(
                            tooltip: '아이 정보',
                            onPressed: onProfile,
                            icon: const Icon(Icons.face_rounded),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: onSearch,
                        child: Container(
                          height: 48,
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          decoration: BoxDecoration(
                            color: KkokkapickTheme.surface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.search_rounded, size: 21),
                              SizedBox(width: 10),
                              Text(
                                '브랜드, 상품을 검색해보세요',
                                style: TextStyle(color: KkokkapickTheme.muted),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      _CategoryStrip(
                        categories: categories.where((e) => e != '전체').take(8).toList(),
                        onSelected: onCategory,
                      ),
                      const SizedBox(height: 30),
                      _SectionHeader(
                        title: profile == null
                            ? '지금 만나볼 상품'
                            : '${profile!.months}개월 아이에게 추천해요',
                        action: profile == null ? '아이 정보 입력' : '정보 수정',
                        onAction: onProfile,
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
              _ProductGridSliver(
                products: personalized.items.take(6).toList(),
                favorites: favorites,
                onFavorite: onFavorite,
                onProduct: onProduct,
                bottomPadding: 12,
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
                  child: _SectionHeader(
                    title: discovery.supportsPopularityClaim
                        ? '지금 많이 보는 상품'
                        : '새롭게 둘러볼 상품',
                    action: '전체 보기',
                    onAction: onSearch,
                  ),
                ),
              ),
              _ProductGridSliver(
                products: discovery.items.take(8).toList(),
                favorites: favorites,
                onFavorite: onFavorite,
                onProduct: onProduct,
                bottomPadding: 96,
              ),
            ],
          ),
        ),
      );
}

class _SearchPage extends StatelessWidget {
  const _SearchPage({
    required this.controller,
    required this.categories,
    required this.category,
    required this.sort,
    required this.products,
    required this.favorites,
    required this.onChanged,
    required this.onCategory,
    required this.onSort,
    required this.onFavorite,
    required this.onProduct,
  });

  final TextEditingController controller;
  final List<String> categories;
  final String category;
  final ReleaseSort sort;
  final List<CatalogProduct> products;
  final Set<String> favorites;
  final VoidCallback onChanged;
  final ValueChanged<String> onCategory;
  final ValueChanged<ReleaseSort> onSort;
  final ValueChanged<CatalogProduct> onFavorite;
  final ValueChanged<CatalogProduct> onProduct;

  Future<void> _openSort(BuildContext context) async {
    final selected = await showModalBottomSheet<ReleaseSort>(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '정렬 방식 선택',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 12),
              for (final entry in const [
                (ReleaseSort.recommended, '추천순'),
                (ReleaseSort.low, '낮은 가격순'),
                (ReleaseSort.high, '높은 가격순'),
              ])
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    sort == entry.$1
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    color: sort == entry.$1
                        ? KkokkapickTheme.lavenderDeep
                        : KkokkapickTheme.muted,
                  ),
                  title: Text(entry.$2),
                  onTap: () => Navigator.pop(context, entry.$1),
                ),
            ],
          ),
        ),
      ),
    );
    if (selected != null) onSort(selected);
  }

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '검색',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: controller,
                      onChanged: (_) => onChanged(),
                      textInputAction: TextInputAction.search,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.search_rounded),
                        hintText: '상품명이나 브랜드를 검색해보세요',
                        suffixIcon: Icon(Icons.qr_code_scanner_rounded),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 40,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: categories.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final item = categories[index];
                          return ChoiceChip(
                            label: Text(item),
                            selected: item == category,
                            onSelected: (_) => onCategory(item),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Text(
                          '총 ${products.length}개',
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        const Spacer(),
                        TextButton.icon(
                          onPressed: () => _openSort(context),
                          icon: const Icon(Icons.swap_vert_rounded, size: 18),
                          label: Text(switch (sort) {
                            ReleaseSort.recommended => '추천순',
                            ReleaseSort.low => '낮은 가격순',
                            ReleaseSort.high => '높은 가격순',
                          }),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            if (products.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptyState(
                  icon: Icons.search_off_rounded,
                  title: '검색 결과가 없어요',
                  body: '다른 검색어나 카테고리로 찾아보세요.',
                ),
              )
            else
              _ProductGridSliver(
                products: products,
                favorites: favorites,
                onFavorite: onFavorite,
                onProduct: onProduct,
                bottomPadding: 96,
              ),
          ],
        ),
      );
}

class _FavoritesPage extends StatelessWidget {
  const _FavoritesPage({
    required this.products,
    required this.alerts,
    required this.favorites,
    required this.onFavorite,
    required this.onProduct,
    required this.onExplore,
    required this.onAlert,
  });

  final List<CatalogProduct> products;
  final Map<String, int> alerts;
  final Set<String> favorites;
  final ValueChanged<CatalogProduct> onFavorite;
  final ValueChanged<CatalogProduct> onProduct;
  final VoidCallback onExplore;
  final ValueChanged<CatalogProduct> onAlert;

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '찜',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: KkokkapickTheme.surface,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: KkokkapickTheme.lavenderSoft,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '찜한 상품 ${products.length}',
                                style: const TextStyle(
                                  color: KkokkapickTheme.lavenderDeep,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              child: Text(
                                '가격 알림 ${alerts.length}',
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (products.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptyState(
                  icon: Icons.favorite_border_rounded,
                  title: '아직 찜한 상품이 없어요',
                  body: '마음에 드는 옷의 하트를 눌러 한곳에 모아보세요.',
                  actionLabel: '상품 둘러보기',
                  onAction: onExplore,
                ),
              )
            else
              _ProductGridSliver(
                products: products,
                favorites: favorites,
                onFavorite: onFavorite,
                onProduct: onProduct,
                bottomPadding: alerts.isEmpty ? 96 : 20,
              ),
            if (alerts.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
                  child: Text(
                    '가격 알림',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                ),
              ),
            if (alerts.isNotEmpty)
              SliverList.separated(
                itemCount: alerts.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final id = alerts.keys.elementAt(index);
                  final product = products.cast<CatalogProduct?>().firstWhere(
                        (p) => p?.id == id,
                        orElse: () => null,
                      );
                  if (product == null) return const SizedBox.shrink();
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    title: Text(product.displayName, maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text('희망가 ${_won(alerts[id])}'),
                    trailing: TextButton(
                      onPressed: () => onAlert(product),
                      child: const Text('변경'),
                    ),
                  );
                },
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 96)),
          ],
        ),
      );
}

class _MyPage extends StatelessWidget {
  const _MyPage({
    required this.profile,
    required this.favoriteCount,
    required this.alertCount,
    required this.onEditProfile,
    required this.onFavorites,
    required this.onSearch,
  });

  final ChildProfile? profile;
  final int favoriteCount;
  final int alertCount;
  final VoidCallback onEditProfile;
  final VoidCallback onFavorites;
  final VoidCallback onSearch;

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 96),
          children: [
            Row(
              children: [
                const KkokkapickBrandMark(compact: true),
                const Spacer(),
                IconButton(
                  tooltip: '설정',
                  onPressed: () {},
                  icon: const Icon(Icons.settings_outlined),
                ),
              ],
            ),
            const SizedBox(height: 26),
            Text(
              profile == null ? '우리 아이 정보를 등록해보세요' : '${profile!.months}개월 아이와 함께 쇼핑 중',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 8),
            const Text(
              '아이 정보는 더 알맞은 상품과 사이즈를 추천하는 데 사용해요.',
              style: TextStyle(color: KkokkapickTheme.muted),
            ),
            const SizedBox(height: 20),
            InkWell(
              borderRadius: BorderRadius.circular(18),
              onTap: onEditProfile,
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: KkokkapickTheme.surface,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: KkokkapickTheme.lavenderSoft,
                      child: const Icon(Icons.child_care_rounded, color: KkokkapickTheme.lavenderDeep),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile == null ? '아이 정보 입력' : '${profile!.stage} · ${profile!.heightCm.toStringAsFixed(0)}cm · ${profile!.weightKg.toStringAsFixed(1)}kg',
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            profile == null ? '월령, 키, 몸무게를 입력해 주세요.' : '탭해서 정보를 수정할 수 있어요.',
                            style: const TextStyle(color: KkokkapickTheme.muted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(
                  child: _StatButton(
                    icon: Icons.favorite_border_rounded,
                    label: '찜한 상품',
                    value: '$favoriteCount',
                    onTap: onFavorites,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatButton(
                    icon: Icons.notifications_none_rounded,
                    label: '가격 알림',
                    value: '$alertCount',
                    onTap: onFavorites,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            _MyMenuTile(icon: Icons.history_rounded, title: '최근 본 상품', onTap: onSearch),
            _MyMenuTile(icon: Icons.storefront_outlined, title: '관심 브랜드', onTap: onSearch),
            _MyMenuTile(icon: Icons.help_outline_rounded, title: '고객센터', onTap: () {}),
            _MyMenuTile(icon: Icons.shield_outlined, title: '개인정보 및 데이터', onTap: () {}),
            _MyMenuTile(icon: Icons.settings_outlined, title: '앱 설정', onTap: () {}),
          ],
        ),
      );
}

class _CategoryStrip extends StatelessWidget {
  const _CategoryStrip({required this.categories, required this.onSelected});

  final List<String> categories;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 68,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 16),
          itemBuilder: (context, index) {
            final label = categories[index];
            final icon = switch (index % 6) {
              0 => Icons.checkroom_rounded,
              1 => Icons.dry_cleaning_rounded,
              2 => Icons.child_friendly_rounded,
              3 => Icons.roller_skating_rounded,
              4 => Icons.shopping_bag_outlined,
              _ => Icons.auto_awesome_rounded,
            };
            return InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () => onSelected(label),
              child: SizedBox(
                width: 54,
                child: Column(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: KkokkapickTheme.surface,
                      ),
                      child: Icon(icon, size: 20, color: KkokkapickTheme.ink),
                    ),
                    const SizedBox(height: 5),
                    Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11)),
                  ],
                ),
              ),
            );
          },
        ),
      );
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    this.action,
    this.onAction,
  });

  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ),
          if (action != null)
            TextButton(onPressed: onAction, child: Text(action!)),
        ],
      );
}

class _ProductGridSliver extends StatelessWidget {
  const _ProductGridSliver({
    required this.products,
    required this.favorites,
    required this.onFavorite,
    required this.onProduct,
    required this.bottomPadding,
  });

  final List<CatalogProduct> products;
  final Set<String> favorites;
  final ValueChanged<CatalogProduct> onFavorite;
  final ValueChanged<CatalogProduct> onProduct;
  final double bottomPadding;

  @override
  Widget build(BuildContext context) => SliverPadding(
        padding: EdgeInsets.fromLTRB(16, 0, 16, bottomPadding),
        sliver: SliverLayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.crossAxisExtent;
            final columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
            return SliverGrid.builder(
              itemCount: products.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                crossAxisSpacing: 12,
                mainAxisSpacing: 26,
                childAspectRatio: width < 340 ? .58 : .62,
              ),
              itemBuilder: (context, index) {
                final p = products[index];
                return _ProductCard(
                  product: p,
                  favorite: favorites.contains(p.id),
                  onFavorite: () => onFavorite(p),
                  onTap: () => onProduct(p),
                );
              },
            );
          },
        ),
      );
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({
    required this.product,
    required this.favorite,
    required this.onFavorite,
    required this.onTap,
  });

  final CatalogProduct product;
  final bool favorite;
  final VoidCallback onFavorite;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: ProductImage(url: product.imageUrl),
                  ),
                  Positioned(
                    top: 7,
                    right: 7,
                    child: SizedBox(
                      width: 42,
                      height: 42,
                      child: IconButton(
                        tooltip: favorite ? '찜 해제' : '찜',
                        onPressed: onFavorite,
                        icon: Icon(
                          favorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        ),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: .94),
                          foregroundColor: favorite
                              ? KkokkapickTheme.lavenderDeep
                              : KkokkapickTheme.ink,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 9),
            Text(
              product.brand ?? product.merchant,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: KkokkapickTheme.muted,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              product.displayName,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 14, height: 1.3, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 6),
            Text(
              _won(product.minPrice),
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 3),
            Row(
              children: [
                if (product.offerCount > 1)
                  Flexible(
                    child: Text(
                      '${product.offerCount}개 판매처',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: KkokkapickTheme.muted),
                    ),
                  ),
                if (product.fitStatus == 'verified') ...[
                  const SizedBox(width: 6),
                  const Text(
                    '꼬까핏',
                    style: TextStyle(
                      fontSize: 11,
                      color: KkokkapickTheme.lavenderDeep,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      );
}

class _ProductDetailSheet extends StatelessWidget {
  const _ProductDetailSheet({
    required this.product,
    required this.profile,
    required this.favorite,
    required this.alertPrice,
    required this.onFavorite,
    required this.onPriceAlert,
  });

  final CatalogProduct product;
  final ChildProfile? profile;
  final bool favorite;
  final int? alertPrice;
  final VoidCallback onFavorite;
  final VoidCallback onPriceAlert;

  Future<void> _openOffer(BuildContext context, ProductOffer offer) async {
    final uri = Uri.tryParse(offer.affiliateUrl);
    if (uri == null || (uri.scheme != 'https' && uri.scheme != 'http')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('구매 링크를 확인할 수 없어요.')),
      );
      return;
    }
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('판매처를 열지 못했어요.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final offers = [...product.offers]
      ..sort((a, b) => (a.price ?? 1 << 62).compareTo(b.price ?? 1 << 62));
    final fit = const KkokkafitEngine().evaluate(profile, product);
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: .92,
      minChildSize: .58,
      maxChildSize: .96,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 30),
        children: [
          AspectRatio(
            aspectRatio: 1.05,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: ProductImage(url: product.imageUrl),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (product.brand != null)
                      Text(
                        product.brand!,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: KkokkapickTheme.muted,
                        ),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      product.displayName,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                            height: 1.3,
                          ),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: favorite ? '찜 해제' : '찜',
                onPressed: onFavorite,
                icon: Icon(favorite ? Icons.favorite_rounded : Icons.favorite_border_rounded),
                color: KkokkapickTheme.lavenderDeep,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _won(product.minPrice),
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onPriceAlert,
                  icon: const Icon(Icons.notifications_none_rounded),
                  label: Text(alertPrice == null ? '가격 알림' : '알림 ${_won(alertPrice)}'),
                ),
              ),
            ],
          ),
          const Divider(height: 34),
          Text(
            '꼬까핏',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 7),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: KkokkapickTheme.fit,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(fit.label),
          ),
          const Divider(height: 34),
          Text(
            '판매처 가격 비교',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 8),
          for (var i = 0; i < offers.length; i++)
            ListTile(
              contentPadding: EdgeInsets.zero,
              onTap: () => _openOffer(context, offers[i]),
              leading: CircleAvatar(
                backgroundColor: KkokkapickTheme.surface,
                child: Text(
                  '${i + 1}',
                  style: const TextStyle(color: KkokkapickTheme.ink),
                ),
              ),
              title: Text(offers[i].merchant),
              subtitle: i == 0 && offers.length > 1 ? const Text('현재 최저가') : null,
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    _won(offers[i].price),
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  const Text('구매하기 ›', style: TextStyle(fontSize: 11)),
                ],
              ),
            ),
          if (offers.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 18),
              child: Text(
                '현재 연결 가능한 판매처가 없어요.',
                style: TextStyle(color: KkokkapickTheme.muted),
              ),
            ),
          const SizedBox(height: 10),
          const Text(
            '가격·재고·옵션·배송 정보는 판매처에서 최종 확인해 주세요.',
            style: TextStyle(fontSize: 11, color: KkokkapickTheme.muted),
          ),
        ],
      ),
    );
  }
}

class _StatButton extends StatelessWidget {
  const _StatButton({
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFEDEAF2)),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Icon(icon, color: KkokkapickTheme.lavenderDeep),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: const TextStyle(fontSize: 12, color: KkokkapickTheme.muted)),
                    const SizedBox(height: 2),
                    Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
}

class _MyMenuTile extends StatelessWidget {
  const _MyMenuTile({required this.icon, required this.title, required this.onTap});

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: onTap,
      );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.body,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 42, color: KkokkapickTheme.lavender),
              const SizedBox(height: 12),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                body,
                textAlign: TextAlign.center,
                style: const TextStyle(color: KkokkapickTheme.muted),
              ),
              if (actionLabel != null) ...[
                const SizedBox(height: 16),
                FilledButton.tonal(onPressed: onAction, child: Text(actionLabel!)),
              ],
            ],
          ),
        ),
      );
}

String _won(int? value) {
  if (value == null || value <= 0) return '가격 확인';
  final text = value.toString().replaceAllMapped(
        RegExp(r'\B(?=(\d{3})+(?!\d))'),
        (_) => ',',
      );
  return '$text원';
}
