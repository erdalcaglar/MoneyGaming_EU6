import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';
import '../core/secure_storage.dart';
import '../services/army_service.dart';
import '../services/auth_service.dart';
import '../services/battle_service.dart';
import '../services/catalog_service.dart';
import '../services/leaderboard_service.dart';
import '../services/village_service.dart';
import '../services/world_service.dart';
import '../models/catalog.dart';

final secureStorageProvider = Provider<SecureStorage>((ref) => SecureStorage());

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient(ref.watch(secureStorageProvider)));

final authServiceProvider = Provider<AuthService>((ref) => AuthService(ref.watch(apiClientProvider)));
final villageServiceProvider = Provider<VillageService>((ref) => VillageService(ref.watch(apiClientProvider)));
final armyServiceProvider = Provider<ArmyService>((ref) => ArmyService(ref.watch(apiClientProvider)));
final worldServiceProvider = Provider<WorldService>((ref) => WorldService(ref.watch(apiClientProvider)));
final battleServiceProvider = Provider<BattleService>((ref) => BattleService(ref.watch(apiClientProvider)));
final leaderboardServiceProvider =
    Provider<LeaderboardService>((ref) => LeaderboardService(ref.watch(apiClientProvider)));
final catalogServiceProvider = Provider<CatalogService>((ref) => CatalogService(ref.watch(apiClientProvider)));

/// İçerik kataloğu — uygulama boyunca bir kez çekilir. Sunucu tarafında
/// yeni bina/birim eklendiğinde istemci kodu değişmeden yeni içeriği
/// otomatik alır.
final catalogProvider = FutureProvider<Catalog>((ref) => ref.watch(catalogServiceProvider).fetch());
