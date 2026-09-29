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
  static const _userIdKey='auth_user_id';
  final FlutterSecureStorage _storage;

  @override Future<StoredSessionTokens?> read() async {
    final values=await Future.wait([_storage.read(key:_accessKey),_storage.read(key:_refreshKey),_storage.read(key:_userIdKey)]);
    final access=values[0],refresh=values[1];
    if(access==null||access.isEmpty||refresh==null||refresh.isEmpty)return null;
    return StoredSessionTokens(accessToken:access,refreshToken:refresh,userId:values[2]);
  }

  @override Future<void> write(StoredSessionTokens tokens) async {
    await _storage.write(key:_accessKey,value:tokens.accessToken);
    await _storage.write(key:_refreshKey,value:tokens.refreshToken);
    if(tokens.userId!=null)await _storage.write(key:_userIdKey,value:tokens.userId);
  }

  @override Future<void> clear() async {
    await Future.wait([_storage.delete(key:_accessKey),_storage.delete(key:_refreshKey),_storage.delete(key:_userIdKey)]);
  }
}
