class WorldMapEntry {
  WorldMapEntry({
    required this.id,
    required this.name,
    required this.x,
    required this.y,
    required this.distance,
    required this.isNpc,
    required this.ownerId,
    required this.npcTier,
    required this.conquerable,
    required this.estimatedDefense,
  });

  factory WorldMapEntry.fromJson(Map<String, dynamic> json) => WorldMapEntry(
        id: json['id'] as String,
        name: json['name'] as String,
        x: json['x'] as int,
        y: json['y'] as int,
        distance: json['distance'] as int,
        isNpc: json['isNpc'] as bool,
        ownerId: json['ownerId'] as String?,
        npcTier: json['npcTier'] as int?,
        conquerable: json['conquerable'] as bool,
        estimatedDefense: json['estimatedDefense'] as int,
      );

  final String id;
  final String name;
  final int x;
  final int y;
  final int distance;
  final bool isNpc;
  final String? ownerId;
  final int? npcTier;
  final bool conquerable;
  final int estimatedDefense;
}
