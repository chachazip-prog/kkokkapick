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
  test('distinguishes target auth scope from currently enabled methods',(){
    expect(AuthenticationCoordinator.targetMethods,containsAll({AuthMethod.google,AuthMethod.kakao,AuthMethod.naver,AuthMethod.apple,AuthMethod.emailPassword}));
    expect(AuthenticationCoordinator.supportedMethods,{AuthMethod.emailPassword});
  });
  test('social authentication remains disabled until provider callback wiring exists',()async{
    final g=_Gateway();
    expect(()=>AuthenticationCoordinator(g).social(AuthMethod.apple),throwsA(isA<UnsupportedError>()));
    expect(g.socialMethod,isNull);
  });
  test('normalizes email account creation',()async{
    final g=_Gateway();await AuthenticationCoordinator(g).email(email:' USER@Example.COM ',password:'secret',create:true);
    expect(g.email,'user@example.com');expect(g.created,isTrue);
  });
  test('rejects social routing for email method',()async{
    final g=_Gateway();
    expect(()=>AuthenticationCoordinator(g).social(AuthMethod.emailPassword),throwsArgumentError);
  });
  test('rejects empty email credentials',()async{
    final g=_Gateway();
    expect(()=>AuthenticationCoordinator(g).email(email:' ',password:'x',create:false),throwsArgumentError);
    expect(()=>AuthenticationCoordinator(g).email(email:'user@example.com',password:'',create:false),throwsArgumentError);
  });
}
