import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/services/account_sync.dart';

class _Gateway implements AccountSyncGateway{
  int syncCalls=0,deleteCalls=0;
  final remote=const AccountSyncSnapshot(favoriteProductIds:{'remote'},priceAlerts:{});
  @override Future<AccountSyncSnapshot> fetch() async=>remote;
  @override Future<AccountSyncSnapshot> syncLocal(AccountSyncSnapshot local) async{syncCalls++;return AccountSyncSnapshot(favoriteProductIds:{...remote.favoriteProductIds,...local.favoriteProductIds},profile:local.profile,priceAlerts:{...remote.priceAlerts,...local.priceAlerts});}
  @override Future<void> deleteAppData() async{deleteCalls++;}
}
void main(){
  test('device-only choice never uploads local data',()async{
    final g=_Gateway(),c=AccountSyncCoordinator(g);
    final result=await c.handleFirstAuthenticatedSession(choice:FirstSignInDataChoice.keepDeviceOnly,local:const AccountSyncSnapshot(favoriteProductIds:{'local'},priceAlerts:{}));
    expect(result,isNull);expect(g.syncCalls,0);
  });
  test('explicit sync choice uses additive gateway merge',()async{
    final g=_Gateway(),c=AccountSyncCoordinator(g);
    final result=await c.handleFirstAuthenticatedSession(choice:FirstSignInDataChoice.syncDeviceData,local:const AccountSyncSnapshot(favoriteProductIds:{'local'},priceAlerts:{'p':1000}));
    expect(g.syncCalls,1);expect(result!.favoriteProductIds,containsAll({'remote','local'}));expect(result.priceAlerts['p'],1000);
  });
}
