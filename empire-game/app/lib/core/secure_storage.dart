import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// JWT'yi cihazın güvenli deposunda (Android Keystore / iOS Keychain)
/// tutar — düz metin olarak SharedPreferences'a yazılmaz.
class SecureStorage {
  SecureStorage() : _storage = const FlutterSecureStorage();

  final FlutterSecureStorage _storage;
  static const _tokenKey = 'auth_token';

  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<void> clearToken() => _storage.delete(key: _tokenKey);
}
