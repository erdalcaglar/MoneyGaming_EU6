import 'resources.dart';

class BuildingInstance {
  BuildingInstance({
    required this.id,
    required this.type,
    required this.level,
    required this.workersAssigned,
    required this.slotX,
    required this.slotY,
    required this.upgradeEndsAt,
  });

  factory BuildingInstance.fromJson(Map<String, dynamic> json) => BuildingInstance(
        id: json['id'] as String,
        type: json['type'] as String,
        level: json['level'] as int,
        workersAssigned: json['workersAssigned'] as int,
        slotX: json['slotX'] as int,
        slotY: json['slotY'] as int,
        upgradeEndsAt: json['upgradeEndsAt'] != null ? DateTime.parse(json['upgradeEndsAt'] as String) : null,
      );

  final String id;
  final String type;
  final int level;
  final int workersAssigned;
  final int slotX;
  final int slotY;
  final DateTime? upgradeEndsAt;

  bool get isUnderConstruction => upgradeEndsAt != null;
  bool get isFoundation => level == 0;
}

class UnitStack {
  UnitStack({
    required this.id,
    required this.type,
    required this.count,
    required this.trainingCount,
    required this.trainingEndsAt,
  });

  factory UnitStack.fromJson(Map<String, dynamic> json) => UnitStack(
        id: json['id'] as String,
        type: json['type'] as String,
        count: json['count'] as int,
        trainingCount: json['trainingCount'] as int,
        trainingEndsAt: json['trainingEndsAt'] != null ? DateTime.parse(json['trainingEndsAt'] as String) : null,
      );

  final String id;
  final String type;
  final int count;
  final int trainingCount;
  final DateTime? trainingEndsAt;

  bool get isTraining => trainingEndsAt != null;
}

class Village {
  Village({
    required this.id,
    required this.name,
    required this.ownerId,
    required this.isCapital,
    required this.x,
    required this.y,
    required this.resources,
    required this.storageCap,
    required this.population,
    required this.defensePower,
    required this.townHallLevel,
    required this.buildings,
    required this.units,
  });

  factory Village.fromJson(Map<String, dynamic> json) => Village(
        id: json['id'] as String,
        name: json['name'] as String,
        ownerId: json['ownerId'] as String?,
        isCapital: json['isCapital'] as bool,
        x: json['x'] as int,
        y: json['y'] as int,
        resources: ResourceAmounts.fromJson(json['resources'] as Map<String, dynamic>),
        storageCap: (json['storageCap'] as num).toDouble(),
        population: Population.fromJson(json['population'] as Map<String, dynamic>),
        defensePower: json['defensePower'] as int,
        townHallLevel: json['townHallLevel'] as int,
        buildings: (json['buildings'] as List)
            .map((b) => BuildingInstance.fromJson(b as Map<String, dynamic>))
            .toList(),
        units: (json['units'] as List).map((u) => UnitStack.fromJson(u as Map<String, dynamic>)).toList(),
      );

  final String id;
  final String name;
  final String? ownerId;
  final bool isCapital;
  final int x;
  final int y;
  final ResourceAmounts resources;
  final double storageCap;
  final Population population;
  final int defensePower;
  final int townHallLevel;
  final List<BuildingInstance> buildings;
  final List<UnitStack> units;
}
