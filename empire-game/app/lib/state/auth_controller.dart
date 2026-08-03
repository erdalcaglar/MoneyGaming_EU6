import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';
import '../models/player.dart';
import '../services/auth_service.dart';
import 'providers.dart';

enum AuthStatus { unknown, unauthenticated, authenticated }

class AuthState {
  const AuthState({required this.status, this.player, this.error});

  final AuthStatus status;
  final Player? player;
  final String? error;

  AuthState copyWith({AuthStatus? status, Player? player, String? error}) => AuthState(
        status: status ?? this.status,
        player: player ?? this.player,
        error: error,
      );

  static const initial = AuthState(status: AuthStatus.unknown);
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._ref) : super(AuthState.initial) {
    _bootstrap();
  }

  final Ref _ref;

  Future<void> _bootstrap() async {
    final token = await _ref.read(secureStorageProvider).readToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }
    try {
      final player = await _ref.read(authServiceProvider).me();
      state = AuthState(status: AuthStatus.authenticated, player: player);
    } catch (_) {
      await _ref.read(secureStorageProvider).clearToken();
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> register({required String username, required String email, required String password}) =>
      _run(() => _ref.read(authServiceProvider).register(username: username, email: email, password: password));

  Future<bool> login({required String identifier, required String password}) =>
      _run(() => _ref.read(authServiceProvider).login(identifier: identifier, password: password));

  Future<bool> _run(Future<AuthResult> Function() action) async {
    state = state.copyWith(error: null);
    try {
      final result = await action();
      await _ref.read(secureStorageProvider).saveToken(result.token);
      state = AuthState(status: AuthStatus.authenticated, player: result.player);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, error: e.message);
      return false;
    }
  }

  Future<void> logout() async {
    await _ref.read(secureStorageProvider).clearToken();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) => AuthController(ref));
