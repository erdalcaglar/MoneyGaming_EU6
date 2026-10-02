import '../core/api_client.dart';
import '../models/village.dart';

class VillageService {
  VillageService(this._api);
  final ApiClient _api;

  Future<List<Village>> myVillages() async {
    final data = await _api.get('/villages/me');
    return (data as List).map((v) => Village.fromJson(v as Map<String, dynamic>)).toList();
  }

  Future<Village> get(String villageId) async {
    final data = await _api.get('/villages/$villageId');
    return Village.fromJson(data as Map<String, dynamic>);
  }

  Future<Village> collect(String villageId) async {
    final data = await _api.post('/villages/$villageId/collect');
    return Village.fromJson(data as Map<String, dynamic>);
  }

  Future<Village> placeBuilding(String villageId, {required String type, required int slotX, required int slotY}) async {
    final data = await _api.post('/villages/$villageId/buildings', body: {
      'type': type,
      'slotX': slotX,
      'slotY': slotY,
    });
    return Village.fromJson(data as Map<String, dynamic>);
  }

  Future<Village> upgradeBuilding(String villageId, String buildingId) async {
    final data = await _api.post('/villages/$villageId/buildings/$buildingId/upgrade');
    return Village.fromJson(data as Map<String, dynamic>);
  }

  Future<Village> setWorkers(String villageId, String buildingId, int count) async {
    final data = await _api.post('/villages/$villageId/buildings/$buildingId/workers', body: {'count': count});
    return Village.fromJson(data as Map<String, dynamic>);
  }
}
