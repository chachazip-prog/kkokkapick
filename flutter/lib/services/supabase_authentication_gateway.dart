import 'dart:convert';
import 'package:http/http.dart' as http;
import 'authentication.dart';

final class SupabaseAuthenticationGateway implements AuthenticationGateway {
  SupabaseAuthenticationGateway({required this.baseUrl,required this.anonKey,http.Client? client})
    :_client=client??http.Client();

  final String baseUrl,anonKey;
  final http.Client _client;

  Uri _auth(String path)=>Uri.parse('${baseUrl.replaceFirst(RegExp(r'/+$'),'')}/auth/v1/$path');
  Map<String,String> get _headers {
    if(baseUrl.trim().isEmpty||anonKey.trim().isEmpty)throw StateError('Supabase public configuration required');
    return {'apikey':anonKey,'Content-Type':'application/json'};
  }

  @override Future<void> signInWithEmail({required String email,required String password}) async {
    final r=await _client.post(_auth('token?grant_type=password'),headers:_headers,body:jsonEncode({'email':email,'password':password}));
    _requireSuccess(r);
  }

  @override Future<void> createEmailAccount({required String email,required String password}) async {
    final r=await _client.post(_auth('signup'),headers:_headers,body:jsonEncode({'email':email,'password':password}));
    _requireSuccess(r);
  }

  @override Future<void> signInWithSocial(AuthMethod method) async {
    if(!method.isSocial)throw ArgumentError.value(method,'method');
    throw const AuthConfigurationRequired();
  }

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
