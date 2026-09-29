import 'dart:convert';
import 'package:http/http.dart' as http;
import 'authentication.dart';

final class AuthTokens {
  const AuthTokens({required this.accessToken,required this.refreshToken,this.userId});
  final String accessToken,refreshToken;
  final String? userId;
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
    if(!await _captureTokens(r))throw const AuthenticationPayloadException();
  }

  @override Future<void> createEmailAccount({required String email,required String password}) async {
    final r=await _client.post(_auth('signup'),headers:_headers,body:jsonEncode({'email':email,'password':password}));
    _requireSuccess(r);
    await _captureTokens(r);
  }

  @override Future<void> signInWithSocial(AuthMethod method) async {
    if(!method.isSocial)throw ArgumentError.value(method,'method');
    throw const AuthConfigurationRequired();
  }

  Future<bool> _captureTokens(http.Response r) async {
    if(r.body.trim().isEmpty)return false;
    Object? raw;
    try{raw=jsonDecode(r.body);}on FormatException{throw const AuthenticationPayloadException();}
    if(raw is! Map)throw const AuthenticationPayloadException();
    final access=raw['access_token'],refresh=raw['refresh_token'];
    if(access==null&&refresh==null)return false;
    if(access is! String||access.isEmpty||refresh is! String||refresh.isEmpty){
      throw const AuthenticationPayloadException();
    }
    final user=raw['user'];
    final userId=user is Map&&user['id'] is String?(user['id'] as String):_tokens?.userId;
    _tokens=AuthTokens(accessToken:access,refreshToken:refresh,userId:userId);
    await tokenStore?.write(StoredSessionTokens(accessToken:access,refreshToken:refresh,userId:userId));
    return true;
  }

  Future<void> refreshSession() async {
    final refresh=_tokens?.refreshToken;
    if(refresh==null||refresh.isEmpty)throw const AuthSessionUnavailable();
    final r=await _client.post(_auth('token?grant_type=refresh_token'),headers:_headers,body:jsonEncode({'refresh_token':refresh}));
    _requireSuccess(r);
    if(!await _captureTokens(r))throw const AuthenticationPayloadException();
  }

  Future<bool> hasPersistedSession() async => await tokenStore?.read()!=null;

  Future<bool> restoreSession() async {
    final stored=await tokenStore?.read();
    if(stored==null)return false;
    _tokens=AuthTokens(accessToken:stored.accessToken,refreshToken:stored.refreshToken,userId:stored.userId);
    try{
      await refreshSession();
      return true;
    } on AuthenticationException catch(e) {
      if(e.statusCode==400||e.statusCode==401||e.statusCode==403){
        _tokens=null;
        await tokenStore?.clear();
        return false;
      }
      // A transient service failure is not proof that persisted credentials are
      // invalid, but the stale access token must not remain active in memory.
      _tokens=null;
      rethrow;
    } catch (_) {
      // Keep persisted credentials for a later retry while preventing stale
      // tokens from being used for remote account operations in this session.
      _tokens=null;
      rethrow;
    }
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

final class AuthenticationPayloadException implements Exception {
  const AuthenticationPayloadException();
}
