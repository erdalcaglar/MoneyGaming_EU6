class Player {
  Player({
    required this.id,
    required this.username,
    required this.email,
    required this.level,
    required this.xp,
  });

  factory Player.fromJson(Map<String, dynamic> json) => Player(
        id: json['id'] as String,
        username: json['username'] as String,
        email: json['email'] as String,
        level: json['level'] as int,
        xp: json['xp'] as int,
      );

  final String id;
  final String username;
  final String email;
  final int level;
  final int xp;
}
