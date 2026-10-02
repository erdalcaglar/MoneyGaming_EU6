class ResourceAmounts {
  const ResourceAmounts({required this.gold, required this.food, required this.wood});

  factory ResourceAmounts.fromJson(Map<String, dynamic> json) => ResourceAmounts(
        gold: (json['gold'] as num).toDouble(),
        food: (json['food'] as num).toDouble(),
        wood: (json['wood'] as num).toDouble(),
      );

  final double gold;
  final double food;
  final double wood;
}

class Population {
  const Population({required this.used, required this.cap});

  factory Population.fromJson(Map<String, dynamic> json) => Population(
        used: json['used'] as int,
        cap: json['cap'] as int,
      );

  final int used;
  final int cap;
}
