import '../core/api_client.dart';
import '../models/catalog.dart';

class CatalogService {
  CatalogService(this._api);
  final ApiClient _api;

  Future<Catalog> fetch() async {
    final data = await _api.get('/catalog');
    return Catalog.fromJson(data as Map<String, dynamic>);
  }
}
