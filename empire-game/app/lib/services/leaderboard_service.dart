import '../core/api_client.dart';
import '../models/battle.dart';

class LeaderboardService {
  LeaderboardService(this._api);
  final ApiClient _api;

  Future<List<LeaderboardEntry>> top({int limit = 50}) async {
    final data = await _api.get('/leaderboard', query: {'limit': limit});
    return (data as List).map((e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>)).toList();
  }
}
