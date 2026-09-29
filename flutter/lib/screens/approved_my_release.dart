import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../repositories/child_profile_repository.dart';
import '../theme/kkokkapick_theme.dart';
import '../widgets/approved_commerce.dart';

class ApprovedMyReleaseTab extends StatelessWidget {
  const ApprovedMyReleaseTab({
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

  static final _supportUri =
      Uri.parse('https://chachazip-prog.github.io/kkokkapick/support.html');
  static final _privacyUri =
      Uri.parse('https://chachazip-prog.github.io/kkokkapick/privacy.html');
  static final _deletionUri =
      Uri.parse('https://chachazip-prog.github.io/kkokkapick/account-deletion.html');

  final ChildProfile? profile;
  final int favoriteCount;
  final int alertCount;
  final bool signedIn;
  final bool offlineAuthenticated;
  final VoidCallback onEditProfile;
  final VoidCallback onAuth;
  final VoidCallback onSignOut;
  final VoidCallback onDeleteAccount;

  Future<void> _open(BuildContext context, Uri uri) async {
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('페이지를 열 수 없어요. 잠시 후 다시 시도해 주세요.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) => SafeArea(
        bottom: false,
        child: ListView(
          key: const PageStorageKey('approved-my-release'),
          padding: EdgeInsets.zero,
          children: [
            const ApprovedHeader(title: '마이'),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: KkokkapickTheme.surface,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Row(children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: KkokkapickTheme.lavenderSoft,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.person_rounded,
                      color: KkokkapickTheme.lavenderDeep,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          signedIn ? '꼬까픽 계정' : '게스트로 이용 중',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          offlineAuthenticated
                              ? '오프라인 상태예요. 연결되면 계정 동기화를 다시 시도해요.'
                              : signedIn
                                  ? '찜과 아이 정보를 안전하게 동기화해요.'
                                  : '로그인하면 기기 변경 후에도 데이터를 이어볼 수 있어요.',
                          style: const TextStyle(
                            fontSize: 12,
                            color: KkokkapickTheme.muted,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!signedIn)
                    TextButton(onPressed: onAuth, child: const Text('로그인')),
                ]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
              child: Row(children: [
                Expanded(
                  child: _CountCard(label: '찜한 상품', count: favoriteCount),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _CountCard(label: '가격 알림', count: alertCount),
                ),
              ]),
            ),
            const CommerceSectionHeader(title: '아이 정보'),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Material(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFECE9F2)),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: onEditProfile,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: profile == null
                        ? const _EmptyProfileRow()
                        : _ProfileRow(profile: profile!),
                  ),
                ),
              ),
            ),
            const CommerceSectionHeader(title: '안내'),
            _LinkTile(
              icon: Icons.help_outline_rounded,
              title: '고객지원',
              subtitle: '상품·계정·개인정보 문의 안내',
              onTap: () => _open(context, _supportUri),
            ),
            _LinkTile(
              icon: Icons.shield_outlined,
              title: '개인정보 안내',
              subtitle: '데이터 처리와 사용자 권리',
              onTap: () => _open(context, _privacyUri),
            ),
            _LinkTile(
              icon: Icons.person_remove_outlined,
              title: '계정 삭제 안내',
              subtitle: '삭제 범위와 앱 내 삭제 경로',
              onTap: () => _open(context, _deletionUri),
            ),
            if (signedIn) ...[
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: OutlinedButton(
                  onPressed: onSignOut,
                  child: const Text('로그아웃'),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextButton(
                  onPressed: onDeleteAccount,
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red.shade700,
                  ),
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
          border: Border.all(color: const Color(0xFFECE9F2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$count',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: KkokkapickTheme.muted,
              ),
            ),
          ],
        ),
      );
}

class _EmptyProfileRow extends StatelessWidget {
  const _EmptyProfileRow();
  @override
  Widget build(BuildContext context) => const Row(children: [
        Icon(
          Icons.add_circle_outline_rounded,
          color: KkokkapickTheme.lavenderDeep,
        ),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '아이 정보 등록',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
              SizedBox(height: 3),
              Text(
                '추천과 꼬까핏 정확도를 높여요',
                style: TextStyle(
                  fontSize: 12,
                  color: KkokkapickTheme.muted,
                ),
              ),
            ],
          ),
        ),
        Icon(Icons.chevron_right_rounded),
      ]);
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.profile});
  final ChildProfile profile;

  @override
  Widget build(BuildContext context) => Row(children: [
        Container(
          width: 46,
          height: 46,
          decoration: const BoxDecoration(
            color: KkokkapickTheme.lavenderSoft,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.child_care_rounded,
            color: KkokkapickTheme.lavenderDeep,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '우리 아이',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 4),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  MetricPill(
                    icon: Icons.calendar_today_outlined,
                    label: '${profile.months}개월',
                  ),
                  MetricPill(
                    icon: Icons.height_rounded,
                    label: '${profile.heightCm.toStringAsFixed(0)}cm',
                  ),
                  MetricPill(
                    icon: Icons.monitor_weight_outlined,
                    label: '${profile.weightKg.toStringAsFixed(1)}kg',
                  ),
                ],
              ),
            ],
          ),
        ),
        const Icon(Icons.chevron_right_rounded),
      ]);
}

class _LinkTile extends StatelessWidget {
  const _LinkTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20),
        leading: Icon(icon),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.open_in_new_rounded, size: 18),
        onTap: onTap,
      );
}
