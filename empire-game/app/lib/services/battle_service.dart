import '../core/api_client.dart';
import '../models/battle.dart';

class BattleService {
  BattleService(this._api);
  final ApiClient _api;

  Future<BattleResult> attack({
    required String attackerVillageId,
    required String targetVillageId,
    required Map<String, int> units,
  }) async {
    final data = await _api.post('/battle/attack', body: {
      'attackerVillageId': attackerVillageId,
      'targetVillageId': targetVillageId,
      'units': units,
    });
    return BattleResult.fromJson(data as Map<String, dynamic>);
  }
}
