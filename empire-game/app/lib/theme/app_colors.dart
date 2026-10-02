import 'package:flutter/material.dart';

/// Empire Age'in ortaçağ/imparatorluk temalı merkezi renk paleti.
/// Tüm ekranlar buradan renk alır — tema değişikliği tek noktadan
/// yönetilir (bkz. ROADMAP.md "alternatif imparatorluk temaları").
class AppColors {
  AppColors._();

  // Zemin
  static const Color background = Color(0xFF14100B);
  static const Color surface = Color(0xFF1F1810);
  static const Color surfaceRaised = Color(0xFF2A2015);
  static const Color surfaceBorder = Color(0xFF4A3B25);

  // Vurgu
  static const Color gold = Color(0xFFD4A73A);
  static const Color goldBright = Color(0xFFF2C94C);
  static const Color bronze = Color(0xFF8C5A2B);
  static const Color crimson = Color(0xFFB1382D);
  static const Color forest = Color(0xFF3E6B4A);
  static const Color steel = Color(0xFF6E7C8C);

  // Metin
  static const Color textPrimary = Color(0xFFF3E9D2);
  static const Color textSecondary = Color(0xFFB9A98A);
  static const Color textMuted = Color(0xFF7C7263);

  // Kaynaklar
  static const Color resourceGold = gold;
  static const Color resourceFood = Color(0xFF6FA86C);
  static const Color resourceWood = Color(0xFF9C6B3E);

  // Durum
  static const Color success = Color(0xFF5FAE63);
  static const Color danger = crimson;
  static const Color warning = Color(0xFFCC8B2C);

  /// Bina/birim `colorKey` alanına göre placeholder renk. Gerçek
  /// sprite eklenene kadar (bkz. ROADMAP.md) bina/birim kartları ve
  /// Flame bileşenleri bu renklerle çizilir; tanınmayan bir anahtar
  /// için isim hash'inden deterministik bir renk üretilir, böylece
  /// yeni içerik eklense bile uygulama kod değişmeden çalışır.
  static Color forKey(String key) {
    const known = <String, Color>{
      'townHall': gold,
      'house': Color(0xFFB98A52),
      'goldMine': Color(0xFFE0B84B),
      'farm': resourceFood,
      'lumberCamp': resourceWood,
      'warehouse': Color(0xFF8A7A5C),
      'wall': steel,
      'watchTower': Color(0xFF56728A),
      'barracks': crimson,
      'archeryRange': forest,
      'stable': Color(0xFF7A4E9E),
      'militia': Color(0xFFA65C4A),
      'swordsman': Color(0xFFC44536),
      'archer': Color(0xFF3E8E5A),
      'knight': Color(0xFF4A5FA6),
      'gold': resourceGold,
      'food': resourceFood,
      'wood': resourceWood,
    };
    if (known.containsKey(key)) return known[key]!;
    final hash = key.codeUnits.fold<int>(0, (acc, c) => acc + c);
    final hue = (hash * 37) % 360;
    return HSLColor.fromAHSL(1, hue.toDouble(), 0.45, 0.45).toColor();
  }
}
