abstract interface class AuthSession {
  bool get isAuthenticated;
  String? get accessToken;
}

final class GuestAuthSession implements AuthSession {
  const GuestAuthSession();
  @override bool get isAuthenticated=>false;
  @override String? get accessToken=>null;
}

enum FirstSignInDataChoice { keepDeviceOnly, syncDeviceData }

final class AccountSyncSnapshot {
  const AccountSyncSnapshot({
    required this.favoriteProductIds,
    this.profile,
    required this.priceAlerts,
  });
  final Set<String> favoriteProductIds;
  final Map<String,Object?>? profile;
  final Map<String,int> priceAlerts;
}

abstract interface class AccountSyncGateway {
  Future<AccountSyncSnapshot> fetch();
  Future<AccountSyncSnapshot> syncLocal(AccountSyncSnapshot local);
  Future<void> deleteAppData();
}

final class AccountSyncCoordinator {
  const AccountSyncCoordinator(this.gateway);
  final AccountSyncGateway gateway;

  Future<AccountSyncSnapshot?> handleFirstAuthenticatedSession({
    required FirstSignInDataChoice choice,
    required AccountSyncSnapshot local,
  }) async {
    if(choice==FirstSignInDataChoice.keepDeviceOnly)return null;
    return gateway.syncLocal(local);
  }

  Future<AccountSyncSnapshot> refresh()=>gateway.fetch();
  Future<void> deleteAppData()=>gateway.deleteAppData();
}
