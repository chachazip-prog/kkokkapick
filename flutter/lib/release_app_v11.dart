import 'package:flutter/material.dart';

import 'models/catalog_product.dart';
import 'repositories/catalog_repository.dart';
import 'repositories/child_profile_repository.dart';
import 'repositories/favorites_repository.dart';
import 'repositories/price_alert_repository.dart';
import 'release_app_v10.dart';
import 'release_app_v9.dart' show V9FavoritesPage, V9Sort;
import 'services/app_session_orchestrator.dart';
import 'services/authentication.dart';
import 'services/home_feed_ranking.dart';
import 'services/local_account_data_store.dart';
import 'services/overlay_coordinator.dart';
import 'services/secure_session_token_store.dart';
import 'services/supabase_authentication_gateway.dart';
import 'theme/kkokkapick_theme.dart';
import 'widgets/brand_identity.dart';
import 'widgets/v10_account_page.dart';

void runReleaseAppV11() => runApp(const KkokkapickReleaseAppV11());

class KkokkapickReleaseAppV11 extends StatelessWidget {
  const KkokkapickReleaseAppV11({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: '꼬까픽',
        debugShowCheckedModeBanner: false,
        theme: KkokkapickTheme.light(),
        home: const V11ReleaseShell(),
      );
}

class V11ReleaseShell extends StatefulWidget {
  const V11ReleaseShell({super.key});

  @override
  State<V11ReleaseShell> createState() => _V11ReleaseShellState();
}

class _V11ReleaseShellState extends State<V11ReleaseShell> {
  static final _demoEndpoint = Uri.parse(
    'https://chachazip-prog.github.io/kkokkapick/data/catalog.json',
  );
  static const _appEnvironment =
      String.fromEnvironment('APP_ENV', defaultValue: 'preview');
  static const _supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const _supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  final _catalog = CatalogRepository();
  final _favorites = FavoritesRepository();
  final _profiles = ChildProfileRepository();
  final _alerts = PriceAlertRepository();
  final _ranking = const HomeFeedRankingService();
  final _search = TextEditingController();
  final _localData = LocalAccountDataStore();
  final _overlayCoordinator = OverlayCoordinator();

  List<CatalogProduct> _products = const [];
  Set<String> _favoriteIds = <String>{};
  Map<String, int> _priceDropBaselines = <String, int>{};
  ChildProfile? _profile;
  String _category = '전체';
  V9Sort _sort = V9Sort.recommended;
  int _tab = 0;
  bool _loading = true;
  Object? _error;

  AppSessionState _sessionState = AppSessionState.guest;
  bool _sessionBusy = false;
  SupabaseAuthenticationGateway? _authentication;
  AppSessionOrchestrator? _session;

  bool get _sessionConfigured =>
      _supabaseUrl.trim().isNotEmpty && _supabaseAnonKey.trim().isNotEmpty;
  bool get _productionCandidate => _appEnvironment == 'production';

  @override
  void initState() {
    super.initState();
    if (_sessionConfigured) {
      _authentication = SupabaseAuthenticationGateway(
        baseUrl: _supabaseUrl,
        anonKey: _supabaseAnonKey,
        tokenStore: SecureSessionTokenStore(),
      );
      _session = AppSessionOrchestrator(
        authentication: _authentication!,
        localData: _localData,
        supabaseUrl: _supabaseUrl,
        anonKey: _supabaseAnonKey,
      );
    }
    _bootstrap();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await _loadCatalogAndLocal();
    if (_session != null) await _restoreSession();
  }

  Future<void> _loadCatalogAndLocal() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_productionCandidate && !_sessionConfigured) {
        throw StateError(
          'Production candidate requires Supabase public configuration.',
        );
      }
      final catalogFuture = _sessionConfigured
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

  Future<void> _reloadLocalState() async {
    final values = await Future.wait<Object?>([
      _favorites.load(),
      _profiles.load(),
      _alerts.loadAll(),
    ]);
    if (!mounted) return;
    setState(() {
      _favoriteIds = values[0] as Set<String>;
      _profile = values[1] as ChildProfile?;
      _priceDropBaselines = values[2] as Map<String, int>;
    });
  }

  Future<void> _restoreSession() async {
    final session = _session;
    if (session == null) return;
    setState(() {
      _sessionBusy = true;
      _sessionState = AppSessionState.restoring;
    });
    final result = await session.restore();
    if (!mounted) return;
    setState(() {
      _sessionState = result.state;
      _sessionBusy = false;
    });
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
        out.sort((a, b) =>
            (a.minPrice ?? 1 << 62).compareTo(b.minPrice ?? 1 << 62));
        return out;
      case V9Sort.high:
        out.sort((a, b) => (b.minPrice ?? 0).compareTo(a.minPrice ?? 0));
        return out;
      case V9Sort.recommended:
        return _ranking.rankPersonalized(out, _signals, limit: out.length).items;
    }
  }

  Future<void> _toggleFavorite(CatalogProduct product) async {
    final enabled = !_favoriteIds.contains(product.id);
    setState(() {
      if (enabled) {
        _favoriteIds.add(product.id);
      } else {
        _favoriteIds.remove(product.id);
      }
    });
    await _favorites.save(_favoriteIds);
    if (_sessionState == AppSessionState.authenticated) {
      try {
        await _session?.setFavorite(product.id, enabled);
      } catch (_) {
        _toast('기기에는 저장했어요. 계정 동기화는 연결되면 다시 시도합니다.');
      }
    }
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
    if (_sessionState == AppSessionState.authenticated) {
      try {
        await _session?.setPriceAlert(product.id, enable ? baseline : null);
      } catch (_) {
        _toast('기기에는 저장했어요. 계정 동기화는 연결되면 다시 시도합니다.');
      }
    }
    _toast(enable ? '가격이 내려가면 알려드릴게요.' : '가격 다운 알림을 껐어요.');
  }

  Future<void> _editProfile() async {
    final months = TextEditingController(text: _profile?.months.toString() ?? '');
    final height = TextEditingController(text: _profile?.heightCm.toString() ?? '');
    final weight = TextEditingController(text: _profile?.weightKg.toString() ?? '');
    final saved = await coordinatedModal<ChildProfile>(
      context: context,
      coordinator: _overlayCoordinator,
      backgroundColor: Colors.white,
      showDragHandle: true,
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
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 6),
              const Text(
                '월령과 성장 정보를 바탕으로 더 잘 맞는 상품을 추천해요.',
                style: TextStyle(color: KkokkapickTheme.muted),
              ),
              const SizedBox(height: 18),
              TextField(
                controller: months,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '월령'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: height,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: '키', suffixText: 'cm'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: weight,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration:
                    const InputDecoration(labelText: '몸무게', suffixText: 'kg'),
              ),
              const SizedBox(height: 18),
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
            ],
          ),
        ),
      ),
    );
    months.dispose();
    height.dispose();
    weight.dispose();
    if (saved == null) return;
    await _profiles.save(saved);
    if (_sessionState == AppSessionState.authenticated) {
      try {
        await _session?.setChildProfile({
          'months': saved.months,
          'heightCm': saved.heightCm,
          'weightKg': saved.weightKg,
        });
      } catch (_) {
        _toast('기기에는 저장했어요. 계정 동기화는 연결되면 다시 시도합니다.');
      }
    }
    if (mounted) setState(() => _profile = saved);
  }

  Future<void> _showProduct(CatalogProduct product) async {
    await coordinatedModal<void>(
      context: context,
      coordinator: _overlayCoordinator,
      isScrollControlled: true,
      showDragHandle: false,
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
          products:
              _products.where((product) => product.category == category).toList(),
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

  Future<void> _signIn() async {
    final authentication = _authentication;
    if (authentication == null || _session == null) return;
    final credentials = await _showEmailAuthSheet();
    if (credentials == null || !mounted) return;
    setState(() => _sessionBusy = true);
    try {
      final coordinator = AuthenticationCoordinator(authentication);
      await coordinator.email(
        email: credentials.email,
        password: credentials.password,
        create: credentials.create,
      );
      if (authentication.tokens == null) {
        _toast('이메일 확인 후 로그인해주세요.');
        return;
      }
      if (!mounted) return;
      setState(() => _sessionState = AppSessionState.authenticated);
      await _askFirstSignInSync();
    } on AuthenticationException catch (error) {
      _toast('로그인하지 못했어요. (${error.statusCode})');
    } catch (_) {
      _toast('로그인하지 못했어요. 입력값과 네트워크를 확인해주세요.');
    } finally {
      if (mounted) setState(() => _sessionBusy = false);
    }
  }

  Future<_EmailCredentials?> _showEmailAuthSheet() async {
    final email = TextEditingController();
    final password = TextEditingController();
    bool create = false;
    final result = await coordinatedModal<_EmailCredentials>(
      context: context,
      coordinator: _overlayCoordinator,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      showDragHandle: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => SafeArea(
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
                  create ? '계정 만들기' : '로그인',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: email,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  decoration: const InputDecoration(labelText: '이메일'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: password,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: '비밀번호'),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () {
                    if (email.text.trim().isEmpty || password.text.isEmpty) return;
                    Navigator.pop(
                      context,
                      _EmailCredentials(
                        email: email.text.trim(),
                        password: password.text,
                        create: create,
                      ),
                    );
                  },
                  child: Text(create ? '계정 만들기' : '로그인'),
                ),
                TextButton(
                  onPressed: () => setModalState(() => create = !create),
                  child: Text(create
                      ? '이미 계정이 있어요 · 로그인'
                      : '처음이에요 · 계정 만들기'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
    email.dispose();
    password.dispose();
    return result;
  }

  Future<void> _askFirstSignInSync() async {
    final choice = await showDialog<FirstSignInDataChoice>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('이 기기의 데이터를 계정에 저장할까요?'),
        content: const Text(
          '찜, 아이 정보, 가격 알림은 지금까지 이 기기에만 저장되어 있었어요. '
          '원할 때만 계정에 동기화합니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(
              context,
              FirstSignInDataChoice.keepDeviceOnly,
            ),
            child: const Text('기기에만 유지'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(
              context,
              FirstSignInDataChoice.syncDeviceData,
            ),
            child: const Text('계정에 동기화'),
          ),
        ],
      ),
    );
    if (choice == null) return;
    try {
      final merged = await _session?.applyFirstSignInChoice(choice);
      if (merged != null) {
        await _localData.replaceWith(merged);
        await _reloadLocalState();
      }
      _toast(choice == FirstSignInDataChoice.syncDeviceData
          ? '기기 데이터를 계정에 동기화했어요.'
          : '기기 데이터는 이 기기에만 유지합니다.');
    } catch (_) {
      _toast('동기화를 완료하지 못했어요. 기기 데이터는 그대로 유지됩니다.');
    }
  }

  Future<void> _signOut() async {
    if (!await _confirm(
      title: '로그아웃할까요?',
      body: '이 기기의 찜, 아이 정보, 가격 알림은 삭제되지 않습니다.',
      confirmLabel: '로그아웃',
    )) return;
    setState(() => _sessionBusy = true);
    try {
      await _session?.signOut();
      if (mounted) setState(() => _sessionState = AppSessionState.guest);
    } finally {
      if (mounted) setState(() => _sessionBusy = false);
    }
  }

  Future<void> _deleteAppData() async {
    if (!await _confirm(
      title: '꼬까픽 데이터를 삭제할까요?',
      body: '찜, 아이 정보, 가격 알림이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '데이터 삭제',
      destructive: true,
    )) return;
    setState(() => _sessionBusy = true);
    try {
      if (_sessionState == AppSessionState.authenticated) {
        await _session!.deleteAppData();
      } else {
        await _localData.clearAppData();
      }
      await _reloadLocalState();
      _toast('꼬까픽 데이터를 삭제했어요.');
    } catch (_) {
      _toast('데이터를 삭제하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      if (mounted) setState(() => _sessionBusy = false);
    }
  }

  Future<void> _deleteAccount() async {
    if (!await _confirm(
      title: '계정을 영구 삭제할까요?',
      body: '계정과 서버 데이터, 이 기기의 꼬까픽 데이터가 모두 삭제됩니다. '
          '이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '계정 삭제',
      destructive: true,
    )) return;
    setState(() => _sessionBusy = true);
    try {
      await _session?.deleteAccount();
      await _reloadLocalState();
      if (mounted) setState(() => _sessionState = AppSessionState.guest);
      _toast('계정을 삭제했어요.');
    } catch (_) {
      _toast('계정을 삭제하지 못했어요. 다시 로그인한 뒤 시도해주세요.');
    } finally {
      if (mounted) setState(() => _sessionBusy = false);
    }
  }

  Future<bool> _confirm({
    required String title,
    required String body,
    required String confirmLabel,
    bool destructive = false,
  }) async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(title),
            content: Text(body),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('취소'),
              ),
              FilledButton(
                style: destructive
                    ? FilledButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.error,
                      )
                    : null,
                onPressed: () => Navigator.pop(context, true),
                child: Text(confirmLabel),
              ),
            ],
          ),
        ) ??
        false;
  }

  void _toast(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
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
                FilledButton(onPressed: _bootstrap, child: const Text('다시 시도')),
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
        products: _products
            .where((product) => _favoriteIds.contains(product.id))
            .toList(),
        favorites: _favoriteIds,
        alerts: _priceDropBaselines.keys.toSet(),
        onFavorite: _toggleFavorite,
        onAlert: _togglePriceDrop,
        onProduct: _showProduct,
        onExplore: _openSearch,
      ),
      V10AccountPage(
        profile: _profile,
        favoriteCount: _favoriteIds.length,
        alertCount: _priceDropBaselines.length,
        sessionState: _sessionState,
        sessionConfigured: _sessionConfigured,
        sessionBusy: _sessionBusy,
        onEditProfile: _editProfile,
        onFavorites: () => setState(() => _tab = 2),
        onSearch: _openSearch,
        onSignIn: _signIn,
        onSignOut: _signOut,
        onDeleteAppData: _deleteAppData,
        onDeleteAccount: _deleteAccount,
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

class _EmailCredentials {
  const _EmailCredentials({
    required this.email,
    required this.password,
    required this.create,
  });

  final String email, password;
  final bool create;
}
