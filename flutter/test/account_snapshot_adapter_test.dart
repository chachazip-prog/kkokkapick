import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/services/account_snapshot_adapter.dart';
import 'package:kkokkapick/services/account_sync.dart';

void main() {
  const adapter = AccountSnapshotAdapter();

  test('server snake_case month-age profile restores and ages from updated_at', () {
    final profile = adapter.childProfileFromRemote(
      <String, Object?>{
        'age_months': 8,
        'height_cm': 70,
        'weight_kg': 8.2,
        'updated_at': '2026-08-15T00:00:00Z',
      },
      now: DateTime.utc(2026, 9, 30),
    );

    expect(profile, isNotNull);
    expect(profile!.months, 9);
    expect(profile.heightCm, 70);
    expect(profile.weightKg, 8.2);
  });

  test('birth date is a backward-compatible fallback when age_months is absent', () {
    final profile = adapter.childProfileFromRemote(
      <String, Object?>{
        'birth_date': '2026-02-10',
        'height_cm': 70,
        'weight_kg': 8,
      },
      now: DateTime.utc(2026, 9, 30),
    );

    expect(profile?.months, 7);
  });

  test('remote account state merges without deleting explicit device-only data', () {
    final presentation = adapter.merge(
      localFavoriteProductIds: const {'local'},
      localPriceAlerts: const {'local-product': 30000},
      localProfile: const ChildProfile(months: 7, heightCm: 69, weightKg: 7.8),
      remote: const AccountSyncSnapshot(
        favoriteProductIds: {'remote'},
        profile: <String, Object?>{
          'age_months': 8,
          'height_cm': 71,
          'weight_kg': 8.4,
        },
        priceAlerts: {'remote-product': 25000},
      ),
      now: DateTime.utc(2026, 9, 30),
    );

    expect(presentation.favoriteProductIds, {'local', 'remote'});
    expect(presentation.priceAlerts['local-product'], 30000);
    expect(presentation.priceAlerts['remote-product'], 25000);
    expect(presentation.profile?.months, 8);
    expect(presentation.profile?.heightCm, 71);
  });
}
