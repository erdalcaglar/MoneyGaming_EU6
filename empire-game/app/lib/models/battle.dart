import 'resources.dart';
import 'village.dart';

class BattleResult {
  BattleResult({
    required this.result,
    required this.ratio,
    required this.loot,
    required this.xpGained,
    required this.conquered,
    required this.newLevel,
    required this.attackerVillage,
  });

  factory BattleResult.fromJson(Map<String, dynamic> json) => BattleResult(
        result: json['result'] as String,
        ratio: (json['ratio'] as num).toDouble(),
        loot: ResourceAmounts.fromJson(json['loot'] as Map<String, dynamic>),
        xpGained: json['xpGained'] as int,
        conquered: json['conquered'] as bool,
        newLevel: json['newLevel'] as int,
        attackerVillage: Village.fromJson(json['attackerVillage'] as Map<String, dynamic>),
      );

  final String result;
  final double ratio;
  final ResourceAmounts loot;
  final int xpGained;
  final bool conquered;
  final int newLevel;
  final Village attackerVillage;

  bool get isWin => result == 'WIN';
}

class LeaderboardEntry {
  LeaderboardEntry({
    required this.rank,
    required this.username,
    required this.level,
    required this.score,
    required this.villageCount,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) => LeaderboardEntry(
        rank: json['rank'] as int,
        username: json['username'] as String,
        level: json['level'] as int,
        score: json['score'] as int,
        villageCount: json['villageCount'] as int,
      );

  final int rank;
  final String username;
  final int level;
  final int score;
  final int villageCount;
}
