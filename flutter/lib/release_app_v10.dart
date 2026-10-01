import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'models/catalog_product.dart';
import 'repositories/catalog_repository.dart';
import 'repositories/child_profile_repository.dart';
import 'repositories/favorites_repository.dart';
import 'repositories/price_alert_repository.dart';
import 'release_app_v9.dart' show V9FavoritesPage, V9MyPage, V9Sort;
import 'services/home_feed_ranking.dart';
import 'theme/kkokkapick_theme.dart';
import 'widgets/brand_identity.dart';
import 'widgets/discovery_experience.dart';
import 'widgets/v9_commerce.dart';

void runReleaseAppV10() => runApp(const KkokkapickReleaseAppV10());

class KkokkapickReleaseAppV10 extends StatelessWidget {
  const KkokkapickReleaseAppV10({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: '꼬까픽',
        debugShowCheckedModeBanner: false,
        theme: KkokkapickTheme.light(),
        home: const V10ReleaseShell(),
      );
}

class V10ReleaseShell extends StatefulWidget {
  const V10ReleaseShell({super.key});

  @override
  State<V10ReleaseShell> createState() => _V10ReleaseShellState();
}

class _V10ReleaseShellState extends State<V10ReleaseShell> {
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
  Map<String, int> _priceDropBaselines = <String, int>{};
  ChildProfile? _profile;
  String _category = '전체';
  V9Sort _sort = V9Sort.recommended;
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
          ? _catalog.fetchSupabase(supabaseUrl: _supabaseUrl, anonKey: _supabaseAnonKey)
          : _catalog.fetchCatalog(_demoEndpoint);
      final values = await Future.wait<Object?>([
        catalogFuture,
        _favorites.load(),
        _profiles.load(),
        _alerts.loadAll(),
      ]);
      if (!mounted) return;
      final dedup = <String, CatalogProduct>{};
      for (final product in values[0] as List<CatalogProduct>) {
        if (product.id.trim().isEmpty) continue;
        final existing = dedup[product.id];
        if (existing == null ||
            product.offers.length > existing.offers.length ||
            product.galleryUrls.length > existing.galleryUrls.length) {
          dedup[product.id] = product;
        }
      }
      setState(() {
        _products = dedup.values.toList();
        _favoriteIds = values[1] as Set<String>;
        _profile = values[2] as ChildProfile?;
        _priceDropBaselines = values[3] as Map<String, int>;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error;
        _loading = false;
      });
    }
  }

  List<String> get _categories {
    final values = <String>{
      for (final product in _products)
        if (product.category.trim().isNotEmpty) product.category,
    }.toList()
      ..sort();
    return ['전체', ...values];
  }

  HomeFeedSignals get _signals => HomeFeedSignals(
        profile: _profile,
        favoriteProductIds: _favoriteIds,
        priceAlertProductIds: _priceDropBaselines.keys.toSet(),
      );

  RankedHomeFeed get _personalized =>
      _ranking.rankPersonalized(_products, _signals, limit: 14);

  RankedHomeFeed get _discovery =>
      _ranking.rankTrending(_products, limit: 30);

  List<CatalogProduct> get _searchResults {
    final terms = _search.text
        .trim()
        .toLowerCase()
        .split(RegExp(r'\s+'))
        .where((term) => term.isNotEmpty)
        .toList();
    final out = _products.where((product) {
      final haystack = '${product.displayName} ${product.brand ?? ''} '
              '${product.category} ${product.stage ?? ''} ${product.specs.material ?? ''}'
          .toLowerCase();
      return (_category == '전체' || product.category == _category) &&
          terms.every(haystack.contains);
    }).toList();
    switch (_sort) {
      case V9Sort.low:
        out.sort((a, b) => (a.minPrice ?? 1 << 62).compareTo(b.minPrice ?? 1 << 62));
        return out;
      case V9Sort.high:
        out.sort((a, b) => (b.minPrice ?? 0).compareTo(a.minPrice ?? 0));
        return out;
      case V9Sort.recommended:
        return _ranking.rankPersonalized(out, _signals, limit: out.length).items;
    }
  }

  Future<void> _toggleFavorite(CatalogProduct product) async {
    setState(() {
      if (!_favoriteIds.add(product.id)) _favoriteIds.remove(product.id);
    });
    await _favorites.save(_favoriteIds);
  }

  Future<void> _togglePriceDrop(CatalogProduct product) async {
    final enable = !_priceDropBaselines.containsKey(product.id);
    final baseline = (product.minPrice ?? 0) > 0 ? product.minPrice! : 1;
    await _alerts.set(product.id, enable ? baseline : null);
    if (!mounted) return;
    setState(() {
      if (enable) {
        _priceDropBaselines[product.id] = baseline;
      } else {
        _priceDropBaselines.remove(product.id);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(enable ? '가격이 내려가면 알려드릴게요.' : '가격 다운 알림을 껐어요.')),
    );
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
      builder: (context) => SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.viewInsetsOf(context).bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('우리 아이 정보를 알려주세요',style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              const Text('월령과 성장 정보를 바탕으로 더 잘 맞는 상품을 추천해요.',style: TextStyle(color: KkokkapickTheme.muted)),
              const SizedBox(height: 18),
              TextField(controller: months,keyboardType: TextInputType.number,decoration: const InputDecoration(labelText: '월령')),
              const SizedBox(height: 10),
              TextField(controller: height,keyboardType: const TextInputType.numberWithOptions(decimal: true),decoration: const InputDecoration(labelText: '키', suffixText: 'cm')),
              const SizedBox(height: 10),
              TextField(controller: weight,keyboardType: const TextInputType.numberWithOptions(decimal: true),decoration: const InputDecoration(labelText: '몸무게', suffixText: 'kg')),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () {
                  final profile = ChildProfile(
                    months: int.tryParse(months.text) ?? 0,
                    heightCm: double.tryParse(height.text) ?? 0,
                    weightKg: double.tryParse(weight.text) ?? 0,
                  );
                  if (profile.months > 0 && profile.heightCm > 0 && profile.weightKg > 0) {
                    Navigator.pop(context, profile);
                  }
                },
                child: const Text('완료하기'),
              ),
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

  Future<void> _showProduct(CatalogProduct product) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.white,
      builder: (context) => V10ProductDetailSheet(
        product: product,
        favorite: _favoriteIds.contains(product.id),
        alertEnabled: _priceDropBaselines.containsKey(product.id),
        onFavorite: () => _toggleFavorite(product),
        onAlert: () => _togglePriceDrop(product),
      ),
    );
  }

  Future<void> _showCategory(String category) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (context) => V10CategoryPage(
          title: category,
          products: _products.where((product) => product.category == category).toList(),
          favorites: _favoriteIds,
          alerts: _priceDropBaselines.keys.toSet(),
          onFavorite: _toggleFavorite,
          onAlert: _togglePriceDrop,
          onProduct: _showProduct,
        ),
      ),
    );
    if (mounted) setState(() {});
  }

  void _openSearch() => setState(() => _tab = 1);

  @override
  Widget build(BuildContext context) {
    if (_loading) return const KkokkapickLaunchSurface();
    if (_error != null) {
      return Scaffold(
        body: SafeArea(
          child: Center(
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
      );
    }

    final pages = <Widget>[
      V10HomePage(
        categories: _categories.where((item) => item != '전체').take(8).toList(),
        profile: _profile,
        personalized: _personalized,
        discovery: _discovery,
        favorites: _favoriteIds,
        alerts: _priceDropBaselines.keys.toSet(),
        onSearch: _openSearch,
        onFavorites: () => setState(() => _tab = 2),
        onAlerts: () => setState(() => _tab = 3),
        onCategory: _showCategory,
        onProfile: _editProfile,
        onFavorite: _toggleFavorite,
        onAlert: _togglePriceDrop,
        onProduct: _showProduct,
      ),
      V10SearchPage(
        controller: _search,
        categories: _categories,
        category: _category,
        sort: _sort,
        products: _searchResults,
        favorites: _favoriteIds,
        alerts: _priceDropBaselines.keys.toSet(),
        onChanged: () => setState(() {}),
        onCategory: (value) => setState(() => _category = value),
        onSort: (value) => setState(() => _sort = value),
        onFavorite: _toggleFavorite,
        onAlert: _togglePriceDrop,
        onProduct: _showProduct,
      ),
      V9FavoritesPage(
        products: _products.where((product) => _favoriteIds.contains(product.id)).toList(),
        favorites: _favoriteIds,
        alerts: _priceDropBaselines.keys.toSet(),
        onFavorite: _toggleFavorite,
        onAlert: _togglePriceDrop,
        onProduct: _showProduct,
        onExplore: _openSearch,
      ),
      V9MyPage(
        profile: _profile,
        favoriteCount: _favoriteIds.length,
        alertCount: _priceDropBaselines.length,
        onEditProfile: _editProfile,
        onFavorites: () => setState(() => _tab = 2),
        onSearch: _openSearch,
      ),
    ];

    return Scaffold(
      body: IndexedStack(index: _tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (index) => setState(() => _tab = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined),selectedIcon: Icon(Icons.home_rounded),label: '홈'),
          NavigationDestination(icon: Icon(Icons.search_rounded),label: '검색'),
          NavigationDestination(icon: Icon(Icons.favorite_border_rounded),selectedIcon: Icon(Icons.favorite_rounded),label: '찜'),
          NavigationDestination(icon: Icon(Icons.person_outline_rounded),selectedIcon: Icon(Icons.person_rounded),label: '마이'),
        ],
      ),
    );
  }
}

class V10HomePage extends StatelessWidget {
  const V10HomePage({
    super.key,
    required this.categories,
    required this.profile,
    required this.personalized,
    required this.discovery,
    required this.favorites,
    required this.alerts,
    required this.onSearch,
    required this.onFavorites,
    required this.onAlerts,
    required this.onCategory,
    required this.onProfile,
    required this.onFavorite,
    required this.onAlert,
    required this.onProduct,
  });

  final List<String> categories;
  final ChildProfile? profile;
  final RankedHomeFeed personalized, discovery;
  final Set<String> favorites, alerts;
  final VoidCallback onSearch, onFavorites, onAlerts, onProfile;
  final ValueChanged<String> onCategory;
  final ValueChanged<CatalogProduct> onFavorite, onAlert, onProduct;

  @override
  Widget build(BuildContext context) {
    final heroProduct = discovery.items.isEmpty ? null : discovery.items.first;
    final horizontal = personalized.items.take(8).toList();
    final vertical = discovery.items.skip(horizontal.length > 4 ? 2 : 0).take(20).toList();
    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const KkokkapickBrandMark(compact: true),
                      const Spacer(),
                      IconButton(tooltip: '가격 알림',onPressed: onAlerts,icon: const Icon(Icons.notifications_none_rounded)),
                      IconButton(tooltip: '찜',onPressed: onFavorites,icon: const Icon(Icons.shopping_bag_outlined)),
                    ],
                  ),
                  const SizedBox(height: 18),
                  V9HeroBanner(
                    product: heroProduct,
                    onTap: heroProduct == null ? onSearch : () => onProduct(heroProduct),
                  ),
                  const SizedBox(height: 16),
                  V9CategoryStrip(categories: categories, onSelected: onCategory),
                  const SizedBox(height: 24),
                  _V10SectionHeader(
                    eyebrow: profile == null ? 'FOR YOUR KID' : '${profile!.months} MONTHS',
                    title: profile == null ? '우리 아이를 위한 추천' : '${profile!.months}개월 아이를 위한 추천',
                    action: profile == null ? '아이 정보 입력' : '정보 수정',
                    onAction: onProfile,
                  ),
                  const SizedBox(height: 12),
                  V9EditorialStrip(products: horizontal, onTap: onProduct),
                  const SizedBox(height: 28),
                  _V10SectionHeader(
                    eyebrow: 'DISCOVER',
                    title: discovery.supportsPopularityClaim ? '지금 많이 보는 상품' : '지금 둘러볼 상품',
                    action: '전체 보기',
                    onAction: onSearch,
                  ),
                  const SizedBox(height: 12),
                  V10ProductRail(
                    products: vertical.take(8).toList(),
                    favorites: favorites,
                    alerts: alerts,
                    onFavorite: onFavorite,
                    onAlert: onAlert,
                    onProduct: onProduct,
                  ),
                  const SizedBox(height: 30),
                  const _V10SectionHeader(
                    eyebrow: 'MORE TO EXPLORE',
                    title: '계속 둘러보세요',
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
          V10ProductGrid(
            products: vertical,
            favorites: favorites,
            alerts: alerts,
            onFavorite: onFavorite,
            onAlert: onAlert,
            onProduct: onProduct,
            bottomPadding: 22,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
              child: V10EditorialFooter(
                product: discovery.items.length > 2 ? discovery.items[2] : heroProduct,
                onTap: onSearch,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class V10SearchPage extends StatelessWidget {
  const V10SearchPage({
    super.key,
    required this.controller,
    required this.categories,
    required this.category,
    required this.sort,
    required this.products,
    required this.favorites,
    required this.alerts,
    required this.onChanged,
    required this.onCategory,
    required this.onSort,
    required this.onFavorite,
    required this.onAlert,
    required this.onProduct,
  });

  final TextEditingController controller;
  final List<String> categories;
  final String category;
  final V9Sort sort;
  final List<CatalogProduct> products;
  final Set<String> favorites, alerts;
  final VoidCallback onChanged;
  final ValueChanged<String> onCategory;
  final ValueChanged<V9Sort> onSort;
  final ValueChanged<CatalogProduct> onFavorite, onAlert, onProduct;

  Future<void> _openSort(BuildContext context) async {
    final selected = await showModalBottomSheet<V9Sort>(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (context) => SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final entry in const [
              (V9Sort.recommended, '추천순'),
              (V9Sort.low, '낮은 가격순'),
              (V9Sort.high, '높은 가격순'),
            ])
              ListTile(
                leading: Icon(sort == entry.$1 ? Icons.radio_button_checked : Icons.radio_button_off),
                title: Text(entry.$2),
                onTap: () => Navigator.pop(context, entry.$1),
              ),
            const SizedBox(height: 12),
          ],
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
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('검색',style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900,letterSpacing: -1.2)),
                    const SizedBox(height: 16),
                    TextField(
                      controller: controller,
                      onChanged: (_) => onChanged(),
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.search_rounded),
                        hintText: '상품명이나 브랜드를 검색해보세요',
                        suffixIcon: Icon(Icons.tune_rounded),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: MediaQuery.textScalerOf(context).scale(14) > 20 ? 58 : 42,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: categories.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final item = categories[index];
                          final selected = item == category;
                          return InkWell(
                            borderRadius: BorderRadius.circular(999),
                            onTap: () => onCategory(item),
                            child: Container(
                              constraints: const BoxConstraints(minWidth: 70),
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              decoration: BoxDecoration(
                                color: selected ? KkokkapickTheme.lavenderSoft : Colors.white,
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: selected ? KkokkapickTheme.lavender : const Color(0xFFE5E2E9)),
                              ),
                              alignment: Alignment.center,
                              child: Text(item,softWrap: false,style: TextStyle(fontWeight: selected ? FontWeight.w800 : FontWeight.w600,color: KkokkapickTheme.ink)),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Text('총 ${products.length}개',style: const TextStyle(fontWeight: FontWeight.w800)),
                        const Spacer(),
                        TextButton.icon(
                          onPressed: () => _openSort(context),
                          icon: const Icon(Icons.swap_vert_rounded, size: 18),
                          label: Text(switch (sort) {V9Sort.recommended => '추천순',V9Sort.low => '낮은 가격순',V9Sort.high => '높은 가격순'}),
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
                child: Center(child: Text('검색 결과가 없어요')),
              )
            else
              V10ProductGrid(
                products: products,
                favorites: favorites,
                alerts: alerts,
                onFavorite: onFavorite,
                onAlert: onAlert,
                onProduct: onProduct,
                bottomPadding: 96,
              ),
          ],
        ),
      );
}

class V10CategoryPage extends StatelessWidget {
  const V10CategoryPage({
    super.key,
    required this.title,
    required this.products,
    required this.favorites,
    required this.alerts,
    required this.onFavorite,
    required this.onAlert,
    required this.onProduct,
  });

  final String title;
  final List<CatalogProduct> products;
  final Set<String> favorites, alerts;
  final ValueChanged<CatalogProduct> onFavorite, onAlert, onProduct;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title,style: const TextStyle(fontWeight: FontWeight.w900))),
        body: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Text('${products.length}개 상품',style: const TextStyle(color: KkokkapickTheme.muted,fontWeight: FontWeight.w700)),
              ),
            ),
            V10ProductGrid(
              products: products,
              favorites: favorites,
              alerts: alerts,
              onFavorite: onFavorite,
              onAlert: onAlert,
              onProduct: onProduct,
              bottomPadding: 40,
            ),
          ],
        ),
      );
}

class V10ProductDetailSheet extends StatefulWidget {
  const V10ProductDetailSheet({super.key,required this.product,required this.favorite,required this.alertEnabled,required this.onFavorite,required this.onAlert});
  final CatalogProduct product;
  final bool favorite, alertEnabled;
  final VoidCallback onFavorite, onAlert;

  @override
  State<V10ProductDetailSheet> createState() => _V10ProductDetailSheetState();
}

class _V10ProductDetailSheetState extends State<V10ProductDetailSheet> {
  int _imageIndex = 0;

  Future<void> _openOffer(BuildContext context, ProductOffer offer) async {
    final uri = Uri.tryParse(offer.affiliateUrl);
    if (uri == null || (uri.scheme != 'https' && uri.scheme != 'http')) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('구매 링크를 확인할 수 없어요.')));
      return;
    }
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('구매 페이지를 열지 못했어요.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final images = product.galleryUrls;
    final rows = <(String,String)>[
      ('카테고리', product.category),
      if (product.sizeRangeLabel != null) ('사이즈', product.sizeRangeLabel!),
      if (product.specs.material?.trim().isNotEmpty ?? false) ('소재', product.specs.material!.trim()),
      if (product.specs.season?.trim().isNotEmpty ?? false) ('시즌', product.specs.season!.trim()),
      if (product.specs.thickness?.trim().isNotEmpty ?? false) ('두께', product.specs.thickness!.trim()),
      if ((product.specs.colorCount ?? 0) > 0) ('색상', '${product.specs.colorCount}개'),
      ('판매처', '${product.merchantCount}곳'),
    ];
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: .94,
      minChildSize: .60,
      maxChildSize: .99,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 36),
        children: [
          AspectRatio(
            aspectRatio: 1.05,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFFAFAFB),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE9E7EC)),
              ),
              clipBehavior: Clip.antiAlias,
              child: images.length <= 1
                  ? ProductImage(url: images.isEmpty ? product.imageUrl : images.first)
                  : Stack(
                      children: [
                        PageView.builder(
                          itemCount: images.length,
                          onPageChanged: (value) => setState(() => _imageIndex = value),
                          itemBuilder: (_, index) => ProductImage(url: images[index]),
                        ),
                        Positioned(
                          right: 12,bottom: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                            decoration: BoxDecoration(color: Colors.black54,borderRadius: BorderRadius.circular(999)),
                            child: Text('${_imageIndex + 1}/${images.length}',style: const TextStyle(color: Colors.white, fontSize: 11)),
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 18),
          Text(product.brand ?? product.merchant,style: const TextStyle(color: KkokkapickTheme.muted,fontWeight: FontWeight.w800)),
          const SizedBox(height: 5),
          Text(product.displayName,style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900,height: 1.28)),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 7,
                  runSpacing: 2,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    const Text(
                      '최저가',
                      style: TextStyle(
                        color: KkokkapickTheme.lavenderDeep,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      v9Won(product.minPrice),
                      style: const TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: widget.onFavorite,
                icon: Icon(
                  widget.favorite
                      ? Icons.favorite_rounded
                      : Icons.favorite_border_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const Text('상품 정보',style: TextStyle(fontSize: 17,fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFFAF9FB),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE9E7EC)),
            ),
            child: Column(
              children: [
                for (var i = 0; i < rows.length; i++) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(width: 72,child: Text(rows[i].$1,style: const TextStyle(color: KkokkapickTheme.muted,fontWeight: FontWeight.w700))),
                        Expanded(child: Text(rows[i].$2,style: const TextStyle(fontWeight: FontWeight.w700))),
                      ],
                    ),
                  ),
                  if (i != rows.length - 1) const Divider(height: 1),
                ],
                if (rows.length <= 2)
                  const Padding(
                    padding: EdgeInsets.only(top: 8, bottom: 4),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text('사이즈·소재 상세는 판매처 제공 정보가 확인되는 대로 표시해요.',style: TextStyle(color: KkokkapickTheme.muted,fontSize: 12,height: 1.4)),
                    ),
                  ),
              ],
            ),
          ),
          if (product.reviews.isNotEmpty) ...[
            const SizedBox(height: 22),
            const Text('판매처별 리뷰',style: TextStyle(fontSize: 17,fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            for (final review in product.reviews)
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(review.source),
                subtitle: Text('${review.rating == null ? '' : '★ ${review.rating!.toStringAsFixed(1)} · '}${review.count}개 후기'),
              ),
          ],
          const SizedBox(height: 18),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            title: const Text('가격 내려가면 알림받기',style: TextStyle(fontWeight: FontWeight.w900)),
            subtitle: const Text('현재 최저가보다 내려가면 알려드려요.'),
            value: widget.alertEnabled,
            onChanged: (_) => widget.onAlert(),
          ),
          const SizedBox(height: 18),
          const Text('판매처 비교',style: TextStyle(fontSize: 17,fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          for (final offer in product.offers)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE9E7EC)),borderRadius: BorderRadius.circular(14)),
              child: ListTile(
                title: Text(offer.merchant,style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text(v9Won(offer.price)),
                trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                onTap: () => _openOffer(context, offer),
              ),
            ),
        ],
      ),
    );
  }
}

class V10ProductRail extends StatelessWidget {
  const V10ProductRail({super.key,required this.products,required this.favorites,required this.alerts,required this.onFavorite,required this.onAlert,required this.onProduct});
  final List<CatalogProduct> products;
  final Set<String> favorites, alerts;
  final ValueChanged<CatalogProduct> onFavorite, onAlert, onProduct;

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 370,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: products.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (context, index) {
            final product = products[index];
            return SizedBox(
              width: 178,
              child: V9ProductCard(
                product: product,
                favorite: favorites.contains(product.id),
                alertEnabled: alerts.contains(product.id),
                onFavorite: () => onFavorite(product),
                onAlert: () => onAlert(product),
                onTap: () => onProduct(product),
              ),
            );
          },
        ),
      );
}

class V10ProductGrid extends StatelessWidget {
  const V10ProductGrid({super.key,required this.products,required this.favorites,required this.alerts,required this.onFavorite,required this.onAlert,required this.onProduct,required this.bottomPadding});
  final List<CatalogProduct> products;
  final Set<String> favorites, alerts;
  final ValueChanged<CatalogProduct> onFavorite, onAlert, onProduct;
  final double bottomPadding;

  @override
  Widget build(BuildContext context) => SliverPadding(
        padding: EdgeInsets.fromLTRB(16, 0, 16, bottomPadding),
        sliver: SliverLayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.crossAxisExtent;
            final columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
            final textScale = MediaQuery.textScalerOf(context).scale(14) / 14;
            final baseAspect = width < 340 ? .43 : .47;
            final childAspectRatio = textScale > 1.5 ? baseAspect * .78 : baseAspect;
            return SliverGrid.builder(
              itemCount: products.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                crossAxisSpacing: 12,
                mainAxisSpacing: 16,
                childAspectRatio: childAspectRatio,
              ),
              itemBuilder: (context, index) {
                final product = products[index];
                return V9ProductCard(
                  product: product,
                  favorite: favorites.contains(product.id),
                  alertEnabled: alerts.contains(product.id),
                  onFavorite: () => onFavorite(product),
                  onAlert: () => onAlert(product),
                  onTap: () => onProduct(product),
                );
              },
            );
          },
        ),
      );
}

class _V10SectionHeader extends StatelessWidget {
  const _V10SectionHeader({required this.eyebrow,required this.title,this.action,this.onAction});
  final String eyebrow, title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(eyebrow,style: const TextStyle(fontSize: 9.5,letterSpacing: 1.35,fontWeight: FontWeight.w800,color: KkokkapickTheme.lavenderDeep)),
          const SizedBox(height: 5),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 20,fontWeight: FontWeight.w900,letterSpacing: -.7,height: 1.15),
                ),
              ),
              if (action != null) ...[
                const SizedBox(width: 8),
                TextButton(onPressed: onAction,child: Text(action!,style: const TextStyle(fontSize: 12,fontWeight: FontWeight.w700))),
              ],
            ],
          ),
        ],
      );
}

class V10EditorialFooter extends StatelessWidget {
  const V10EditorialFooter({super.key,this.product,required this.onTap});
  final CatalogProduct? product;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          height: 142,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: const Color(0xFFF1ECE5),
            border: Border.all(color: const Color(0xFFE8E1D9)),
          ),
          child: Stack(
            children: [
              if (product?.imageUrl != null)
                Positioned(right: 0,top: 0,bottom: 0,width: 155,child: ProductImage(url: product!.imageUrl,fit: BoxFit.cover)),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,end: Alignment.centerRight,
                      colors: [const Color(0xFFF1ECE5),const Color(0xFFF1ECE5).withValues(alpha: .96),const Color(0xFFF1ECE5).withValues(alpha: .12)],
                      stops: const [0,.60,1],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(18),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 220),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('꼬까픽이 제안하는\n이번 주 스타일',style: TextStyle(fontSize: 18,fontWeight: FontWeight.w900,height: 1.2,letterSpacing: -.5)),
                      SizedBox(height: 8),
                      Text('같은 상품은 모아 보고, 판매처별 가격은 비교해보세요.',style: TextStyle(fontSize: 11,color: KkokkapickTheme.muted,height: 1.4)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}
