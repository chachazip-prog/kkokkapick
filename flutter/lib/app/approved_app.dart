import 'package:flutter/material.dart';

import '../models/catalog_product.dart';
import '../repositories/catalog_repository.dart';
import '../repositories/child_profile_repository.dart';
import '../repositories/favorites_repository.dart';
import '../repositories/price_alert_repository.dart';
import '../screens/approved_tabs.dart';
import '../services/account_snapshot_adapter.dart';
import '../services/account_sync.dart';
import '../services/app_session_orchestrator.dart';
import '../services/authentication.dart';
import '../services/local_account_data_store.dart';
import '../services/secure_session_token_store.dart';
import '../services/supabase_authentication_gateway.dart';
import '../theme/kkokkapick_theme.dart';
import '../widgets/approved_commerce.dart';
import '../widgets/brand_identity.dart';

class ApprovedCatalogApp extends StatefulWidget {
  const ApprovedCatalogApp({super.key});

  @override
  State<ApprovedCatalogApp> createState() => _ApprovedCatalogAppState();
}

class _ApprovedCatalogAppState extends State<ApprovedCatalogApp> {
  static final _demoEndpoint =
      Uri.parse('https://chachazip-prog.github.io/kkokkapick/data/catalog.json');
  static const _supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const _supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  final _catalog = CatalogRepository();
  final _favorites = FavoritesRepository();
  final _profiles = ChildProfileRepository();
  final _alerts = PriceAlertRepository();
  final _localAccountData = LocalAccountDataStore();
  final _snapshotAdapter = const AccountSnapshotAdapter();

  late final SupabaseAuthenticationGateway _authentication;
  late final AppSessionOrchestrator _session;

  List<CatalogProduct> _products = const [];
  Set<String> _favoriteIds = <String>{};
  Map<String, int> _priceAlerts = <String, int>{};
  ChildProfile? _profile;
  AppSessionState _sessionState = AppSessionState.guest;
  bool _loading = true;
  bool _authBusy = false;
  Object? _error;
  int _navIndex = 0;

  bool get _authConfigured =>
      _supabaseUrl.trim().isNotEmpty && _supabaseAnonKey.trim().isNotEmpty;
  bool get _signedIn =>
      _sessionState == AppSessionState.authenticated ||
      _sessionState == AppSessionState.offlineAuthenticated;

  @override
  void initState() {
    super.initState();
    _authentication = SupabaseAuthenticationGateway(
      baseUrl: _supabaseUrl,
      anonKey: _supabaseAnonKey,
      tokenStore: SecureSessionTokenStore(),
    );
    _session = AppSessionOrchestrator(
      authentication: _authentication,
      localData: _localAccountData,
      supabaseUrl: _supabaseUrl,
      anonKey: _supabaseAnonKey,
    );
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await _load();
    await _restoreSession();
  }

  Future<void> _restoreSession() async {
    if (!_authConfigured) return;
    if (mounted) setState(() => _sessionState = AppSessionState.restoring);
    try {
      final restored = await _session.restore();
      if (!mounted) return;
      setState(() => _sessionState = restored.state);
      if (restored.remote != null) {
        await _applyRemoteSnapshot(restored.remote!);
      }
    } catch (_) {
      if (mounted) setState(() => _sessionState = AppSessionState.guest);
    }
  }

  Future<void> _applyRemoteSnapshot(AccountSyncSnapshot remote) async {
    final merged = _snapshotAdapter.merge(
      localFavoriteProductIds: _favoriteIds,
      localPriceAlerts: _priceAlerts,
      localProfile: _profile,
      remote: remote,
    );

    await _favorites.save(merged.favoriteProductIds);
    for (final entry in merged.priceAlerts.entries) {
      await _alerts.set(entry.key, entry.value);
    }
    if (merged.profile != null) {
      await _profiles.save(merged.profile!);
    }

    if (!mounted) return;
    setState(() {
      _favoriteIds = merged.favoriteProductIds;
      _priceAlerts = merged.priceAlerts;
      _profile = merged.profile;
    });
  }

  Future<void> _load() async {
    if (mounted) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final catalogFuture = _authConfigured
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
      if (mounted) {
        setState(() {
          _error = e;
          _loading = false;
        });
      }
    }
  }

  Future<void> _toggleFavorite(String id) async {
    final next = {..._favoriteIds};
    final favorite = !next.contains(id);
    favorite ? next.add(id) : next.remove(id);
    setState(() => _favoriteIds = next);
    await _favorites.save(next);
    if (_signedIn && _sessionState == AppSessionState.authenticated) {
      try {
        await _session.setFavorite(id, favorite);
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('찜은 기기에 저장했어요. 계정 동기화는 연결되면 다시 시도해요.'),
            ),
          );
        }
      }
    }
  }

  Future<void> _setPriceAlert(String productId, int? price) async {
    await _alerts.set(productId, price);
    final next = {..._priceAlerts};
    if (price == null) {
      next.remove(productId);
    } else {
      next[productId] = price;
    }
    if (mounted) setState(() => _priceAlerts = next);
    if (_signedIn && _sessionState == AppSessionState.authenticated) {
      try {
        await _session.setPriceAlert(productId, price);
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('가격 알림은 기기에 저장했어요. 계정 동기화는 나중에 다시 시도해요.'),
            ),
          );
        }
      }
    }
  }

  Future<void> _saveProfile(ChildProfile profile) async {
    await _profiles.save(profile);
    if (mounted) setState(() => _profile = profile);
    if (_signedIn && _sessionState == AppSessionState.authenticated) {
      try {
        await _session.setChildProfile({
          'months': profile.months,
          'birthDate': null,
          'heightCm': profile.heightCm,
          'weightKg': profile.weightKg,
          'usualSize': null,
          'nickname': null,
        });
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('아이 정보는 기기에 저장했어요. 계정 동기화는 나중에 다시 시도해요.'),
            ),
          );
        }
      }
    }
  }

  Future<void> _editProfile() async {
    final month = TextEditingController(text: _profile?.months.toString() ?? '');
    final height = TextEditingController(
      text: _profile?.heightCm.toStringAsFixed(0) ?? '',
    );
    final weight = TextEditingController(
      text: _profile?.weightKg.toStringAsFixed(1) ?? '',
    );
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
            4,
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
                '추천과 꼬까핏에 사용하며, 행동 분석용 트렌딩 데이터에는 포함하지 않아요.',
                style: TextStyle(color: KkokkapickTheme.muted, height: 1.45),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: month,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: '월령',
                  hintText: '예: 8개월',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: height,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '키', suffixText: 'cm'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: weight,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: '몸무게', suffixText: 'kg'),
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () {
                  final value = ChildProfile(
                    months: int.tryParse(month.text) ?? 0,
                    heightCm: double.tryParse(height.text) ?? 0,
                    weightKg: double.tryParse(weight.text) ?? 0,
                  );
                  if (value.months > 0 &&
                      value.heightCm > 0 &&
                      value.weightKg > 0) {
                    Navigator.pop(context, value);
                  }
                },
                child: const Text('저장하기'),
              ),
            ],
          ),
        ),
      ),
    );
    month.dispose();
    height.dispose();
    weight.dispose();
    if (saved != null) await _saveProfile(saved);
  }

  Future<void> _showLogin() async {
    if (!_authConfigured) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('현재 프리뷰에는 계정 서버 설정이 연결되지 않았어요.')),
      );
      return;
    }
    final email = TextEditingController();
    final password = TextEditingController();
    var create = false;
    var sheetBusy = false;
    final success = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(
              20,
              4,
              20,
              MediaQuery.viewInsetsOf(context).bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  create ? '이메일로 가입하기' : '로그인',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 6),
                const Text(
                  '로그인 전까지 찜·아이 정보·가격 알림은 이 기기에만 저장돼요.',
                  style: TextStyle(color: KkokkapickTheme.muted, height: 1.45),
                ),
                const SizedBox(height: 18),
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
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: sheetBusy
                      ? null
                      : () async {
                          setSheetState(() => sheetBusy = true);
                          try {
                            await AuthenticationCoordinator(_authentication).email(
                              email: email.text,
                              password: password.text,
                              create: create,
                            );
                            if (!context.mounted) return;
                            if (_authentication.tokens == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('가입 확인 메일을 확인해 주세요.')),
                              );
                            } else {
                              Navigator.pop(context, true);
                            }
                          } on AuthenticationException catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('인증에 실패했어요. (HTTP ${e.statusCode})'),
                                ),
                              );
                            }
                          } on AuthenticationPayloadException {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('인증 응답을 확인할 수 없어요.')),
                              );
                            }
                          } catch (_) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('인증 중 문제가 발생했어요.')),
                              );
                            }
                          } finally {
                            if (context.mounted) {
                              setSheetState(() => sheetBusy = false);
                            }
                          }
                        },
                  child: sheetBusy
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(create ? '가입하기' : '로그인'),
                ),
                TextButton(
                  onPressed: sheetBusy
                      ? null
                      : () => setSheetState(() => create = !create),
                  child: Text(create ? '이미 계정이 있어요' : '처음이라면 이메일로 가입하기'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
    email.dispose();
    password.dispose();
    if (success == true) {
      if (mounted) {
        setState(() => _sessionState = AppSessionState.authenticated);
      }
      await _askSyncChoice();
    }
  }

  Future<void> _askSyncChoice() async {
    final choice = await showModalBottomSheet<FirstSignInDataChoice>(
      context: context,
      backgroundColor: Colors.white,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                '이 기기 데이터를 동기화할까요?',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              const Text(
                '찜·아이 정보·가격 알림은 선택하기 전까지 서버로 전송하지 않아요.',
                style: TextStyle(color: KkokkapickTheme.muted, height: 1.45),
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () => Navigator.pop(
                  context,
                  FirstSignInDataChoice.syncDeviceData,
                ),
                child: const Text('이 기기 데이터 동기화'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(
                  context,
                  FirstSignInDataChoice.keepDeviceOnly,
                ),
                child: const Text('이 기기에만 유지'),
              ),
            ],
          ),
        ),
      ),
    );
    if (choice == null) return;
    setState(() => _authBusy = true);
    try {
      final remote = await _session.applyFirstSignInChoice(choice);
      if (remote != null) {
        await _applyRemoteSnapshot(remote);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('동기화는 나중에 다시 시도할 수 있어요.')),
        );
      }
    } finally {
      if (mounted) setState(() => _authBusy = false);
    }
  }

  Future<void> _signOut() async {
    await _session.signOut();
    if (mounted) setState(() => _sessionState = AppSessionState.guest);
  }

  Future<void> _deleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('계정을 삭제할까요?'),
        content: const Text('서버와 이 기기의 꼬까픽 데이터를 삭제하며 복구할 수 없습니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red.shade700),
            child: const Text('삭제하기'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _authBusy = true);
    try {
      await _session.deleteAccount();
      _favoriteIds = <String>{};
      _priceAlerts = <String, int>{};
      _profile = null;
      _sessionState = AppSessionState.guest;
      if (mounted) {
        setState(() {});
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('계정과 앱 데이터를 삭제했어요.')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('계정 삭제를 완료하지 못했어요. 연결 상태를 확인해 주세요.')),
        );
      }
    } finally {
      if (mounted) setState(() => _authBusy = false);
    }
  }

  void _openProduct(CatalogProduct product) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ApprovedProductDetailPage(
          product: product,
          profile: _profile,
          favorite: _favoriteIds.contains(product.id),
          alertPrice: _priceAlerts[product.id],
          onFavorite: () => _toggleFavorite(product.id),
          onSetAlert: (price) => _setPriceAlert(product.id, price),
          onEditProfile: _editProfile,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: KkokkapickLaunchSurface(message: '상품을 준비하고 있어요'),
      );
    }
    if (_error != null) {
      return Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              const ApprovedHeader(),
              Expanded(
                child: ApprovedEmptyState(
                  icon: Icons.cloud_off_rounded,
                  title: '상품을 불러오지 못했어요',
                  message: '네트워크 연결을 확인하고 다시 시도해 주세요.',
                  actionLabel: '다시 불러오기',
                  onAction: _load,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final tabs = <Widget>[
      ApprovedHomeTab(
        products: _products,
        favoriteIds: _favoriteIds,
        alerts: _priceAlerts,
        profile: _profile,
        onFavorite: _toggleFavorite,
        onProductTap: _openProduct,
        onSearch: () => setState(() => _navIndex = 1),
        onExplore: () => setState(() => _navIndex = 1),
        onEditProfile: _editProfile,
      ),
      ApprovedSearchTab(
        products: _products,
        favoriteIds: _favoriteIds,
        alerts: _priceAlerts,
        onFavorite: _toggleFavorite,
        onProductTap: _openProduct,
      ),
      ApprovedFavoritesTab(
        products: _products,
        favoriteIds: _favoriteIds,
        alerts: _priceAlerts,
        onFavorite: _toggleFavorite,
        onProductTap: _openProduct,
        onExplore: () => setState(() => _navIndex = 1),
      ),
      ApprovedMyTab(
        profile: _profile,
        favoriteCount: _favoriteIds.length,
        alertCount: _priceAlerts.length,
        signedIn: _signedIn,
        offlineAuthenticated:
            _sessionState == AppSessionState.offlineAuthenticated,
        onEditProfile: _editProfile,
        onAuth: _showLogin,
        onSignOut: _signOut,
        onDeleteAccount: _deleteAccount,
      ),
    ];

    return Scaffold(
      body: Stack(
        children: [
          IndexedStack(index: _navIndex, children: tabs),
          if (_authBusy)
            Positioned.fill(
              child: IgnorePointer(
                child: ColoredBox(
                  color: Colors.black12,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const CircularProgressIndicator(),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _navIndex,
        onDestinationSelected: (index) => setState(() => _navIndex = index),
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
