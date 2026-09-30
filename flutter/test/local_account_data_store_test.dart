import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/repositories/child_profile_repository.dart';
import 'package:kkokkapick/repositories/favorites_repository.dart';
import 'package:kkokkapick/repositories/price_alert_repository.dart';
import 'package:kkokkapick/services/account_sync.dart';
import 'package:kkokkapick/services/local_account_data_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('merged account snapshot replaces device state atomically by domain', () async {
    SharedPreferences.setMockInitialValues({
      'favorite_product_ids': ['old'],
      'child_months': 7,
      'child_height': 68.0,
      'child_weight': 7.5,
      'price_alert_product_ids': ['old'],
      'price_alert_old': 12000,
    });
    final favorites=FavoritesRepository();
    final profiles=ChildProfileRepository();
    final alerts=PriceAlertRepository();
    final store=LocalAccountDataStore(favorites:favorites,profiles:profiles,alerts:alerts);

    await store.replaceWith(const AccountSyncSnapshot(
      favoriteProductIds: {'new-a','new-b'},
      profile: {'months':9,'heightCm':72.5,'weightKg':8.4},
      priceAlerts: {'new-a':9900},
    ));

    expect(await favorites.load(), {'new-a','new-b'});
    final profile=await profiles.load();
    expect(profile?.months, 9);
    expect(profile?.heightCm, 72.5);
    expect(profile?.weightKg, 8.4);
    expect(await alerts.loadAll(), {'new-a':9900});
    expect(await alerts.get('old'), isNull);
  });

  test('null merged profile clears stale device profile', () async {
    SharedPreferences.setMockInitialValues({
      'child_months': 7,
      'child_height': 68.0,
      'child_weight': 7.5,
    });
    final profiles=ChildProfileRepository();
    final store=LocalAccountDataStore(profiles:profiles);
    await store.replaceWith(const AccountSyncSnapshot(
      favoriteProductIds: {},
      priceAlerts: {},
    ));
    expect(await profiles.load(), isNull);
  });
}
