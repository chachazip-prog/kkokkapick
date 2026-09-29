import '../repositories/child_profile_repository.dart';
import '../repositories/favorites_repository.dart';
import '../repositories/price_alert_repository.dart';
import 'account_sync.dart';

final class LocalAccountDataStore {
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

  Future<void> clearAppData() async {
    await Future.wait([favorites.clear(),profiles.clear(),alerts.clear()]);
  }
}
