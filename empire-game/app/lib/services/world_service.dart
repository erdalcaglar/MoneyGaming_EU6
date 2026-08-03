import '../core/api_client.dart';
import '../models/world.dart';

class WorldService {
  WorldService(this._api);
  final ApiClient _api;

  Future<List<WorldMapEntry>> map({required int x, required int y, int radius = 8}) async {
    final data = await _api.get('/world/map', query: {'x': x, 'y': y, 'radius': radius});
    return (data as List).map((e) => WorldMapEntry.fromJson(e as Map<String, dynamic>)).toList();
  }
}
