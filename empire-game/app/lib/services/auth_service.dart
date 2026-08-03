import '../core/api_client.dart';
import '../models/player.dart';

class AuthResult {
  AuthResult({required this.token, required this.player});
  final String token;
  final Player player;
}

class AuthService {
  AuthService(this._api);
  final ApiClient _api;

  Future<AuthResult> register({required String username, required String email, required String password}) async {
    final data = await _api.post('/auth/register', body: {
      'username': username,
      'email': email,
      'password': password,
    });
    return AuthResult(token: data['token'] as String, player: Player.fromJson(data['player'] as Map<String, dynamic>));
  }

  Future<AuthResult> login({required String identifier, required String password}) async {
    final data = await _api.post('/auth/login', body: {
      'identifier': identifier,
      'password': password,
    });
    return AuthResult(token: data['token'] as String, player: Player.fromJson(data['player'] as Map<String, dynamic>));
  }

  Future<Player> me() async {
    final data = await _api.get('/auth/me');
    return Player.fromJson(data as Map<String, dynamic>);
  }
}
