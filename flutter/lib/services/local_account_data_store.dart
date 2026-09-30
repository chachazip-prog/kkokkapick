import '../repositories/child_profile_repository.dart';
import '../repositories/favorites_repository.dart';
import '../repositories/price_alert_repository.dart';
import 'account_sync.dart';

class LocalAccountDataStore {
  LocalAccountDataStore({
    FavoritesRepository? favorites,
    ChildProfileRepository? profiles,
    PriceAlertRepository? alerts,
  }):favorites=favorites??FavoritesRepository(),
     profiles=profiles??ChildProfileRepository(),
     alerts=alerts??PriceAlertRepository();

  final FavoritesRepository favorites;
  final ChildProfileRepository profiles;
  final PriceAlertRepository alerts;

  Future<AccountSyncSnapshot> snapshot() async {
    final values=await Future.wait<Object?>([
      favorites.load(),profiles.load(),alerts.loadAll(),
    ]);
    final profile=values[1] as ChildProfile?;
    return AccountSyncSnapshot(
      favoriteProductIds:values[0] as Set<String>,
      profile:profile==null?null:{
        'months':profile.months,
        'heightCm':profile.heightCm,
        'weightKg':profile.weightKg,
      },
      priceAlerts:values[2] as Map<String,int>,
    );
  }

  Future<void> replaceWith(AccountSyncSnapshot snapshot) async {
    final profile = snapshot.profile;
    await Future.wait([
      favorites.save(snapshot.favoriteProductIds),
      profile == null
          ? profiles.clear()
          : profiles.save(ChildProfile(
              months: profile['months'] as int,
              heightCm: (profile['heightCm'] as num).toDouble(),
              weightKg: (profile['weightKg'] as num).toDouble(),
            )),
      _replacePriceAlerts(snapshot.priceAlerts),
    ]);
  }

  Future<void> _replacePriceAlerts(Map<String, int> next) async {
    await alerts.clear();
    for (final entry in next.entries) {
      await alerts.set(entry.key, entry.value);
    }
  }

  Future<void> clearAppData() async {
    await Future.wait([favorites.clear(),profiles.clear(),alerts.clear()]);
  }
}
