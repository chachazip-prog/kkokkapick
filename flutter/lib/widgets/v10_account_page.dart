import 'package:flutter/material.dart';

import '../repositories/child_profile_repository.dart';
import '../services/app_session_orchestrator.dart';
import '../theme/kkokkapick_theme.dart';
import 'brand_identity.dart';

class V10AccountPage extends StatelessWidget {
  const V10AccountPage({
    super.key,
    required this.profile,
    required this.favoriteCount,
    required this.alertCount,
    required this.sessionState,
    required this.sessionConfigured,
    required this.sessionBusy,
    required this.onEditProfile,
    required this.onFavorites,
    required this.onSearch,
    required this.onSignIn,
    required this.onSignOut,
    required this.onDeleteAppData,
    required this.onDeleteAccount,
  });

  final ChildProfile? profile;
  final int favoriteCount, alertCount;
  final AppSessionState sessionState;
  final bool sessionConfigured, sessionBusy;
  final VoidCallback onEditProfile, onFavorites, onSearch;
  final Future<void> Function() onSignIn, onSignOut, onDeleteAppData, onDeleteAccount;

  bool get _authenticated =>
      sessionState == AppSessionState.authenticated ||
      sessionState == AppSessionState.offlineAuthenticated;
  bool get _onlineAuthenticated => sessionState == AppSessionState.authenticated;
  bool get _offlineAuthenticated => sessionState == AppSessionState.offlineAuthenticated;

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
          children: [
            const KkokkapickBrandMark(compact: true),
            const SizedBox(height: 26),
            Text(
              profile == null
                  ? '우리 아이 정보를 등록해보세요'
                  : '${profile!.months}개월 아이와 함께 쇼핑 중',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              _authenticated
                  ? (_offlineAuthenticated
                      ? '오프라인 계정 모드 · 연결되면 다시 동기화해요.'
                      : '계정에 연결되어 있어요.')
                  : '로그인 없이도 찜과 아이 정보는 이 기기에 저장돼요.',
              style: const TextStyle(color: KkokkapickTheme.muted),
            ),
            const SizedBox(height: 14),
            FilledButton.tonal(
              onPressed: onEditProfile,
              child: Text(profile == null ? '아이 정보 입력' : '아이 정보 수정'),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _AccountStatCard(
                    label: '찜한 상품',
                    value: '$favoriteCount',
                    onTap: onFavorites,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _AccountStatCard(
                    label: '가격 다운 알림',
                    value: '$alertCount',
                    onTap: onFavorites,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _AccountSection(
              title: '계정',
              children: [
                if (!sessionConfigured)
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.info_outline_rounded),
                    title: Text('로그인은 아직 사용할 수 없어요'),
                    subtitle: Text('프로덕션 인증 설정이 연결되면 활성화됩니다.'),
                  )
                else if (!_authenticated)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.login_rounded),
                    title: const Text('로그인 / 계정 만들기'),
                    subtitle: const Text('기기 데이터를 계정에 동기화할지는 로그인 후 직접 선택해요.'),
                    trailing: sessionBusy
                        ? const SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.chevron_right_rounded),
                    onTap: sessionBusy ? null : () => onSignIn(),
                  )
                else ...[
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(_offlineAuthenticated
                        ? Icons.cloud_off_outlined
                        : Icons.cloud_done_outlined),
                    title: Text(_offlineAuthenticated ? '계정 연결 대기 중' : '계정 연결됨'),
                    subtitle: Text(_offlineAuthenticated
                        ? '저장된 로그인 정보는 유지하지만 오래된 토큰은 사용하지 않아요.'
                        : '찜·아이 정보·가격 알림을 계정과 동기화할 수 있어요.'),
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.logout_rounded),
                    title: const Text('로그아웃'),
                    onTap: sessionBusy ? null : () => onSignOut(),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 18),
            _AccountSection(
              title: '데이터 및 개인정보',
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.delete_sweep_outlined),
                  title: Text(_offlineAuthenticated ? '이 기기의 꼬까픽 데이터 삭제' : '꼬까픽 데이터 삭제'),
                  subtitle: Text(_offlineAuthenticated
                      ? '현재 오프라인이라 서버 데이터는 건드리지 않고 이 기기의 찜, 아이 정보, 가격 알림만 삭제합니다.'
                      : '찜, 아이 정보, 가격 알림 데이터를 삭제합니다.'),
                  onTap: sessionBusy ? null : () => onDeleteAppData(),
                ),
                if (_onlineAuthenticated)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.person_remove_outlined),
                    title: const Text('계정 삭제'),
                    subtitle: const Text('서버 계정과 이 기기의 꼬까픽 데이터를 함께 삭제합니다.'),
                    textColor: Theme.of(context).colorScheme.error,
                    iconColor: Theme.of(context).colorScheme.error,
                    onTap: sessionBusy ? null : () => onDeleteAccount(),
                  )
                else if (_offlineAuthenticated)
                  const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.wifi_off_rounded),
                    title: Text('계정 삭제는 연결 후 가능해요'),
                    subtitle: Text('서버 계정 삭제는 유효한 로그인 세션을 다시 확인한 뒤에만 실행합니다.'),
                  ),
              ],
            ),
            const SizedBox(height: 18),
            _AccountSection(
              title: '쇼핑',
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.search_rounded),
                  title: const Text('상품 다시 찾아보기'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: onSearch,
                ),
              ],
            ),
          ],
        ),
      );
}

class _AccountSection extends StatelessWidget {
  const _AccountSection({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFEDEAF2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            ...children,
          ],
        ),
      );
}

class _AccountStatCard extends StatelessWidget {
  const _AccountStatCard({required this.label, required this.value, required this.onTap});
  final String label, value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: KkokkapickTheme.surface,
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: KkokkapickTheme.muted)),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            ],
          ),
        ),
      );
}
