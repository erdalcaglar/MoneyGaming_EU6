import '../core/api_client.dart';
import '../models/village.dart';

class ArmyService {
  ArmyService(this._api);
  final ApiClient _api;

  Future<Village> train(String villageId, {required String unitType, required int count}) async {
    final data = await _api.post('/villages/$villageId/army/train', body: {
      'unitType': unitType,
      'count': count,
    });
    return Village.fromJson(data as Map<String, dynamic>);
  }
}
