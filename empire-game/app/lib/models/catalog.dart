class ResourceCost {
  const ResourceCost({this.gold = 0, this.food = 0, this.wood = 0});

  factory ResourceCost.fromJson(Map<String, dynamic> json) => ResourceCost(
        gold: ((json['gold'] as num?) ?? 0).toDouble(),
        food: ((json['food'] as num?) ?? 0).toDouble(),
        wood: ((json['wood'] as num?) ?? 0).toDouble(),
      );

  final double gold;
  final double food;
  final double wood;

  bool affordableWith({required double gold, required double food, required double wood}) {
    return this.gold <= gold && this.food <= food && this.wood <= wood;
  }
}

class BuildingLevelCatalog {
  BuildingLevelCatalog({
    required this.level,
    required this.cost,
    required this.buildSeconds,
    required this.effectValue,
    required this.requiresTownHallLevel,
  });

  factory BuildingLevelCatalog.fromJson(Map<String, dynamic> json) => BuildingLevelCatalog(
        level: json['level'] as int,
        cost: ResourceCost.fromJson(json['cost'] as Map<String, dynamic>),
        buildSeconds: json['buildSeconds'] as int,
        effectValue: (json['effectValue'] as num).toDouble(),
        requiresTownHallLevel: json['requiresTownHallLevel'] as int,
      );

  final int level;
  final ResourceCost cost;
  final int buildSeconds;
  final double effectValue;
  final int requiresTownHallLevel;
}

class BuildingCatalog {
  BuildingCatalog({
    required this.type,
    required this.name,
    required this.description,
    required this.category,
    required this.producesResource,
    required this.workable,
    required this.maxWorkers,
    required this.levels,
    required this.colorKey,
  });

  factory BuildingCatalog.fromJson(Map<String, dynamic> json) => BuildingCatalog(
        type: json['type'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        category: json['category'] as String,
        producesResource: json['producesResource'] as String?,
        workable: json['workable'] as bool,
        maxWorkers: json['maxWorkers'] as int,
        levels: (json['levels'] as List)
            .map((l) => BuildingLevelCatalog.fromJson(l as Map<String, dynamic>))
            .toList(),
        colorKey: json['colorKey'] as String,
      );

  final String type;
  final String name;
  final String description;
  final String category;
  final String? producesResource;
  final bool workable;
  final int maxWorkers;
  final List<BuildingLevelCatalog> levels;
  final String colorKey;

  BuildingLevelCatalog? levelDef(int level) {
    for (final l in levels) {
      if (l.level == level) return l;
    }
    return null;
  }

  int get maxLevel => levels.isEmpty ? 0 : levels.map((l) => l.level).reduce((a, b) => a > b ? a : b);
}

class UnitCatalog {
  UnitCatalog({
    required this.type,
    required this.name,
    required this.description,
    required this.trainedAt,
    required this.requiresBuildingLevel,
    required this.cost,
    required this.trainSeconds,
    required this.attack,
    required this.defense,
    required this.populationCost,
    required this.colorKey,
  });

  factory UnitCatalog.fromJson(Map<String, dynamic> json) => UnitCatalog(
        type: json['type'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        trainedAt: json['trainedAt'] as String,
        requiresBuildingLevel: json['requiresBuildingLevel'] as int,
        cost: ResourceCost.fromJson(json['cost'] as Map<String, dynamic>),
        trainSeconds: json['trainSeconds'] as int,
        attack: json['attack'] as int,
        defense: json['defense'] as int,
        populationCost: json['populationCost'] as int,
        colorKey: json['colorKey'] as String,
      );

  final String type;
  final String name;
  final String description;
  final String trainedAt;
  final int requiresBuildingLevel;
  final ResourceCost cost;
  final int trainSeconds;
  final int attack;
  final int defense;
  final int populationCost;
  final String colorKey;
}

class LevelCatalog {
  LevelCatalog({required this.level, required this.xpRequired});

  factory LevelCatalog.fromJson(Map<String, dynamic> json) => LevelCatalog(
        level: json['level'] as int,
        xpRequired: json['xpRequired'] as int,
      );

  final int level;
  final int xpRequired;
}

class Catalog {
  Catalog({required this.buildings, required this.units, required this.levels});

  factory Catalog.fromJson(Map<String, dynamic> json) => Catalog(
        buildings:
            (json['buildings'] as List).map((b) => BuildingCatalog.fromJson(b as Map<String, dynamic>)).toList(),
        units: (json['units'] as List).map((u) => UnitCatalog.fromJson(u as Map<String, dynamic>)).toList(),
        levels: (json['leveling'] as List).map((l) => LevelCatalog.fromJson(l as Map<String, dynamic>)).toList(),
      );

  final List<BuildingCatalog> buildings;
  final List<UnitCatalog> units;
  final List<LevelCatalog> levels;

  BuildingCatalog? building(String type) {
    for (final b in buildings) {
      if (b.type == type) return b;
    }
    return null;
  }

  UnitCatalog? unit(String type) {
    for (final u in units) {
      if (u.type == type) return u;
    }
    return null;
  }
}
