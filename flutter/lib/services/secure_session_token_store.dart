import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'authentication.dart';

final class SecureSessionTokenStore implements SessionTokenStore {
  SecureSessionTokenStore({FlutterSecureStorage? storage})
    :_storage=storage??const FlutterSecureStorage(
      aOptions:AndroidOptions(encryptedSharedPreferences:true),
      iOptions:IOSOptions(accessibility:KeychainAccessibility.first_unlock_this_device),
    );

  static const _accessKey='auth_access_token';
  static const _refreshKey='auth_refresh_token';
  final FlutterSecureStorage _storage;

  @override Future<StoredSessionTokens?> read() async {
    final values=await Future.wait([_storage.read(key:_accessKey),_storage.read(key:_refreshKey)]);
    final access=values[0],refresh=values[1];
    if(access==null||access.isEmpty||refresh==null||refresh.isEmpty)return null;
    return StoredSessionTokens(accessToken:access,refreshToken:refresh);
  }

  @override Future<void> write(StoredSessionTokens tokens) async {
    await _storage.write(key:_accessKey,value:tokens.accessToken);
    await _storage.write(key:_refreshKey,value:tokens.refreshToken);
  }

  @override Future<void> clear() async {
    await Future.wait([_storage.delete(key:_accessKey),_storage.delete(key:_refreshKey)]);
  }
}
