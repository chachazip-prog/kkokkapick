import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/services/authentication.dart';

final class _Gateway implements AuthenticationGateway {
  AuthMethod? socialMethod;
  String? email;
  bool created=false;
  @override Future<void> signInWithSocial(AuthMethod method)async{socialMethod=method;}
  @override Future<void> signInWithEmail({required String email,required String password})async{this.email=email;}
  @override Future<void> createEmailAccount({required String email,required String password})async{this.email=email;created=true;}
}

void main(){
  test('supports requested social providers including Apple',(){
    expect(AuthenticationCoordinator.supportedMethods,containsAll({AuthMethod.google,AuthMethod.kakao,AuthMethod.naver,AuthMethod.apple,AuthMethod.emailPassword}));
  });
  test('routes Apple through social authentication',()async{
    final g=_Gateway();await AuthenticationCoordinator(g).social(AuthMethod.apple);expect(g.socialMethod,AuthMethod.apple);
  });
  test('normalizes email account creation',()async{
    final g=_Gateway();await AuthenticationCoordinator(g).email(email:' USER@Example.COM ',password:'secret',create:true);
    expect(g.email,'user@example.com');expect(g.created,isTrue);
  });
}
