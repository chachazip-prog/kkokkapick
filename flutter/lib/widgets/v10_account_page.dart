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

  Future<void> _showAppSettings(BuildContext context) => showModalBottomSheet<void>(
        context: context,
        showDragHandle: true,
        backgroundColor: Colors.white,
        isScrollControlled: true,
        builder: (context) => SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '앱 설정',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 14),
                _SettingsInfoRow(
                  icon: Icons.person_outline_rounded,
                  label: '계정 기능',
                  value: sessionConfigured
                      ? (_authenticated ? '계정 연결 사용 중' : '필요할 때 로그인 가능')
                      : '프로덕션 인증 설정 연결 전',
                ),
                const SizedBox(height: 12),
                const _SettingsInfoRow(
                  icon: Icons.phone_iphone_rounded,
                  label: '기기 데이터',
                  value: '비로그인 상태에서도 찜·아이 정보·가격 알림을 기기에 저장',
                ),
                const SizedBox(height: 12),
                _SettingsInfoRow(
                  icon: _offlineAuthenticated
                      ? Icons.cloud_off_outlined
                      : Icons.cloud_done_outlined,
                  label: '동기화 상태',
                  value: _offlineAuthenticated
                      ? '오프라인 · 오래된 토큰으로 서버 작업하지 않음'
                      : (_onlineAuthenticated ? '온라인 계정 연결됨' : '기기 우선'),
                ),
              ],
            ),
          ),
        ),
      );

  Future<void> _showPrivacyAndData(BuildContext context) => showModalBottomSheet<void>(
        context: context,
        showDragHandle: true,
        backgroundColor: Colors.white,
        isScrollControlled: true,
        builder: (context) => SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '개인정보 및 데이터',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 14),
                const _SettingsInfoRow(
                  icon: Icons.storage_outlined,
                  label: '기기에 저장되는 정보',
                  value: '찜한 상품, 아이 월령·키·몸무게, 가격 알림 설정',
                ),
                const SizedBox(height: 12),
                const _SettingsInfoRow(
                  icon: Icons.sync_lock_rounded,
                  label: '계정 동기화',
                  value: '처음 로그인할 때 명시적으로 동의한 경우에만 기존 기기 데이터를 계정에 동기화',
                ),
                const SizedBox(height: 12),
                const _SettingsInfoRow(
                  icon: Icons.delete_outline_rounded,
                  label: '삭제',
                  value: '이 화면을 닫은 뒤 마이의 삭제 메뉴에서 앱 데이터 또는 계정을 직접 삭제할 수 있음',
                ),
                const SizedBox(height: 12),
                const _SettingsInfoRow(
                  icon: Icons.policy_outlined,
                  label: '개인정보처리방침',
                  value: '운영 주체·공식 연락처·보관기간과 실제 프로덕션 처리 항목이 확정된 뒤 최종 방침을 연결할 예정',
                ),
              ],
            ),
          ),
        ),
      );

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
                      ? '오프라인 계정 모드 · 연결 후 다시 동기화할 수 있어요.'
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
                    helper: '상품 상세에서 관리',
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
                  leading: const Icon(Icons.shield_outlined),
                  title: const Text('개인정보 및 데이터 안내'),
                  subtitle: const Text('저장·동기화·삭제 원칙을 확인합니다.'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => _showPrivacyAndData(context),
                ),
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
              title: '앱 및 지원',
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.settings_outlined),
                  title: const Text('앱 설정'),
                  subtitle: const Text('현재 계정·저장·동기화 상태를 확인합니다.'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => _showAppSettings(context),
                ),
                const ListTile(
                  contentPadding: EdgeInsets.zero,
                  enabled: false,
                  leading: Icon(Icons.help_outline_rounded),
                  title: Text('고객지원'),
                  subtitle: Text('공식 운영 주체와 고객지원 채널 확정 후 제공됩니다.'),
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
  Widget build(BuildContext context) => Material(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFEDEAF2)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              ...children,
            ],
          ),
        ),
      );
}

class _AccountStatCard extends StatelessWidget {
  const _AccountStatCard({required this.label, required this.value, this.helper, this.onTap});
  final String label, value;
  final String? helper;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: KkokkapickTheme.surface,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: KkokkapickTheme.muted)),
                const SizedBox(height: 8),
                Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                if (helper != null) ...[
                  const SizedBox(height: 4),
                  Text(helper!, style: const TextStyle(fontSize: 11, color: KkokkapickTheme.muted)),
                ],
              ],
            ),
          ),
        ),
      );
}

class _SettingsInfoRow extends StatelessWidget {
  const _SettingsInfoRow({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label, value;

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: KkokkapickTheme.lavenderDeep),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: const TextStyle(color: KkokkapickTheme.muted, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      );
}
