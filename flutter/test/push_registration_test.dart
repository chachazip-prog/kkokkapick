import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/services/push_registration.dart';

final class _Source implements PushTokenSource {
  _Source(this.platform,this.initial);
  @override final String platform;
  String? initial;
  final controller=StreamController<String>();
  @override Future<String?> currentToken()async=>initial;
  @override Stream<String> get tokenChanges=>controller.stream;
}

final class _Gateway implements PushRegistrationGateway {
  final calls=<String>[];
  @override Future<void> setPushDevice({required String platform,required String token,bool enabled=true})async{
    calls.add('set:$platform:$token:$enabled');
  }
  @override Future<void> removePushDevice(String token)async{calls.add('remove:$token');}
}

String _token(String suffix)=>'push-token-1234567890-$suffix';

void main(){
  test('registers current token only for supported platform',()async{
    final source=_Source('android',_token('a'));
    final gateway=_Gateway();
    final coordinator=PushRegistrationCoordinator(source:source,gateway:gateway);
    await coordinator.start();
    expect(gateway.calls,['set:android:'+_token('a')+':true']);
    expect(coordinator.registeredToken,_token('a'));
    await coordinator.detach(removeRemote:false);
    await source.controller.close();
  });

  test('rotation registers new token before removing old token',()async{
    final source=_Source('ios',_token('old'));
    final gateway=_Gateway();
    final coordinator=PushRegistrationCoordinator(source:source,gateway:gateway);
    await coordinator.start();
    source.controller.add(_token('new'));
    await Future<void>.delayed(const Duration(milliseconds:20));
    expect(gateway.calls,[
      'set:ios:'+_token('old')+':true',
      'set:ios:'+_token('new')+':true',
      'remove:'+_token('old'),
    ]);
    expect(coordinator.registeredToken,_token('new'));
    await coordinator.detach(removeRemote:false);
    await source.controller.close();
  });

  test('detach removes current token before account sign-out can occur',()async{
    final source=_Source('android',_token('a'));
    final gateway=_Gateway();
    final coordinator=PushRegistrationCoordinator(source:source,gateway:gateway);
    await coordinator.start();
    await coordinator.detach();
    expect(gateway.calls.last,'remove:'+_token('a'));
    expect(coordinator.registeredToken,isNull);
    await source.controller.close();
  });

  test('invalid short token is never uploaded',()async{
    final source=_Source('android','short');
    final gateway=_Gateway();
    final coordinator=PushRegistrationCoordinator(source:source,gateway:gateway);
    await coordinator.start();
    expect(gateway.calls,isEmpty);
    await coordinator.detach(removeRemote:false);
    await source.controller.close();
  });

  test('rejects unsupported platform before registration',()async{
    final source=_Source('web',_token('a'));
    final coordinator=PushRegistrationCoordinator(source:source,gateway:_Gateway());
    await expectLater(coordinator.start(),throwsStateError);
    await source.controller.close();
  });
}
