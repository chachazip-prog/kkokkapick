import 'dart:convert';
import 'package:http/http.dart' as http;
import 'authentication.dart';

final class AuthTokens {
  const AuthTokens({required this.accessToken,required this.refreshToken});
  final String accessToken,refreshToken;
}

final class SupabaseAuthenticationGateway implements AuthenticationGateway {
  SupabaseAuthenticationGateway({required this.baseUrl,required this.anonKey,this.tokenStore,http.Client? client})
    :_client=client??http.Client();

  final String baseUrl,anonKey;
  final http.Client _client;
  final SessionTokenStore? tokenStore;
  AuthTokens? _tokens;
  AuthTokens? get tokens=>_tokens;

  Uri _auth(String path)=>Uri.parse('${baseUrl.replaceFirst(RegExp(r'/+$'),'')}/auth/v1/$path');
  Map<String,String> get _headers {
    if(baseUrl.trim().isEmpty||anonKey.trim().isEmpty)throw StateError('Supabase public configuration required');
    return {'apikey':anonKey,'Content-Type':'application/json'};
  }

  @override Future<void> signInWithEmail({required String email,required String password}) async {
    final r=await _client.post(_auth('token?grant_type=password'),headers:_headers,body:jsonEncode({'email':email,'password':password}));
    _requireSuccess(r);
    await _captureTokens(r);
  }

  @override Future<void> createEmailAccount({required String email,required String password}) async {
    final r=await _client.post(_auth('signup'),headers:_headers,body:jsonEncode({'email':email,'password':password}));
    _requireSuccess(r);
    _captureTokens(r);
  }

  @override Future<void> signInWithSocial(AuthMethod method) async {
    if(!method.isSocial)throw ArgumentError.value(method,'method');
    throw const AuthConfigurationRequired();
  }

  Future<void> _captureTokens(http.Response r) async {
    if(r.body.trim().isEmpty)return;
    final raw=jsonDecode(r.body);
    if(raw is! Map)return;
    final access=raw['access_token'],refresh=raw['refresh_token'];
    if(access is String&&access.isNotEmpty&&refresh is String&&refresh.isNotEmpty){
      _tokens=AuthTokens(accessToken:access,refreshToken:refresh);
      await tokenStore?.write(StoredSessionTokens(accessToken:access,refreshToken:refresh));
    }
  }

  Future<void> refreshSession() async {
    final refresh=_tokens?.refreshToken;
    if(refresh==null||refresh.isEmpty)throw const AuthSessionUnavailable();
    final r=await _client.post(_auth('token?grant_type=refresh_token'),headers:_headers,body:jsonEncode({'refresh_token':refresh}));
    _requireSuccess(r);await _captureTokens(r);
  }

  Future<bool> restoreSession() async {
    final stored=await tokenStore?.read();
    if(stored==null)return false;
    _tokens=AuthTokens(accessToken:stored.accessToken,refreshToken:stored.refreshToken);
    try{await refreshSession();return true;}catch(_){_tokens=null;await tokenStore?.clear();return false;}
  }

  Future<void> clearSession() async {_tokens=null;await tokenStore?.clear();}

  void _requireSuccess(http.Response r){
    if(r.statusCode<200||r.statusCode>=300)throw AuthenticationException(r.statusCode);
  }
}

final class AuthConfigurationRequired implements Exception {
  const AuthConfigurationRequired();
}

final class AuthenticationException implements Exception {
  const AuthenticationException(this.statusCode);
  final int statusCode;
  @override String toString()=>'AuthenticationException(statusCode: $statusCode)';
}

final class AuthSessionUnavailable implements Exception { const AuthSessionUnavailable(); }
