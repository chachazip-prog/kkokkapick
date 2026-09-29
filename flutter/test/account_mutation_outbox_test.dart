import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/services/account_mutation_outbox.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main(){
  setUp(()=>SharedPreferences.setMockInitialValues({}));
  test('latest mutation for the same key wins and survives reload',() async{
    final o=AccountMutationOutbox();
    await o.put(const PendingAccountMutation(AccountMutationKind.favorite,'p1',{'favorite':true}));
    await o.put(const PendingAccountMutation(AccountMutationKind.favorite,'p1',{'favorite':false}));
    final loaded=await AccountMutationOutbox().load();
    expect(loaded,length(1));
    expect(loaded.single.payload['favorite'],false);
  });
  test('different logical keys are retained',() async{
    final o=AccountMutationOutbox();
    await o.put(const PendingAccountMutation(AccountMutationKind.favorite,'p1',{'favorite':true}));
    await o.put(const PendingAccountMutation(AccountMutationKind.priceAlert,'p1',{'targetPrice':12000}));
    expect(await o.load(),length(2));
  });
}
