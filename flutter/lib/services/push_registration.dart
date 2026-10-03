import 'dart:async';

import 'app_session_orchestrator.dart';

abstract interface class PushTokenSource {
  String get platform;
  Future<String?> currentToken();
  Stream<String> get tokenChanges;
}

abstract interface class PushRegistrationGateway {
  Future<void> setPushDevice({
    required String platform,
    required String token,
    bool enabled,
  });
  Future<void> removePushDevice(String token);
}

final class AppSessionPushRegistrationGateway implements PushRegistrationGateway {
  const AppSessionPushRegistrationGateway(this.session);
  final AppSessionOrchestrator session;

  @override
  Future<void> setPushDevice({
    required String platform,
    required String token,
    bool enabled=true,
  })=>session.setPushDevice(platform:platform,token:token,enabled:enabled);

  @override
  Future<void> removePushDevice(String token)=>session.removePushDevice(token);
}

final class PushRegistrationCoordinator {
  PushRegistrationCoordinator({
    required this.source,
    required this.gateway,
  });

  final PushTokenSource source;
  final PushRegistrationGateway gateway;
  StreamSubscription<String>? _subscription;
  String? _registeredToken;

  String? get registeredToken=>_registeredToken;

  Future<void> start() async {
    if(source.platform!='ios'&&source.platform!='android'){
      throw StateError('Unsupported push platform');
    }
    final token=(await source.currentToken())?.trim();
    if(token!=null&&token.length>=16)await _register(token);
    _subscription??=source.tokenChanges.listen((token){
      final normalized=token.trim();
      if(normalized.length<16||normalized==_registeredToken)return;
      _rotate(normalized);
    });
  }

  Future<void> _register(String token) async {
    await gateway.setPushDevice(
      platform:source.platform,
      token:token,
      enabled:true,
    );
    _registeredToken=token;
  }

  Future<void> _rotate(String next) async {
    final previous=_registeredToken;
    try {
      // Register the new token first so a rotation never creates an avoidable
      // notification gap. The server invariant reassigns a token to only one
      // account owner.
      await _register(next);
      if(previous!=null&&previous!=next){
        await gateway.removePushDevice(previous);
      }
    } catch (_) {
      // Token refresh callbacks are best-effort. The source will expose the
      // current token again on the next authenticated registration attempt.
    }
  }

  Future<void> detach({bool removeRemote=true}) async {
    await _subscription?.cancel();
    _subscription=null;
    final token=_registeredToken;
    _registeredToken=null;
    if(removeRemote&&token!=null){
      await gateway.removePushDevice(token);
    }
  }
}
