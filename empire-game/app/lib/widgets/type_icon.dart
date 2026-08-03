import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Gerçek sprite/ikon setleri eklenene kadar (bkz. ROADMAP.md) her
/// bina/birim tipini `colorKey`'e göre tutarlı bir renkli rozet
/// olarak gösterir. Yeni bir tip eklendiğinde otomatik çalışır.
class TypeIcon extends StatelessWidget {
  const TypeIcon({super.key, required this.colorKey, required this.icon, this.size = 40});

  final String colorKey;
  final IconData icon;
  final double size;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forKey(colorKey);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(size * 0.28),
        border: Border.all(color: color.withValues(alpha: 0.6)),
      ),
      child: Icon(icon, color: color, size: size * 0.55),
    );
  }
}

const Map<String, IconData> kBuildingIcons = {
  'TOWN_HALL': Icons.castle,
  'HOUSE': Icons.home,
  'GOLD_MINE': Icons.diamond,
  'FARM': Icons.grass,
  'LUMBER_CAMP': Icons.forest,
  'WAREHOUSE': Icons.warehouse,
  'WALL': Icons.security,
  'WATCH_TOWER': Icons.visibility,
  'BARRACKS': Icons.shield,
  'ARCHERY_RANGE': Icons.gps_fixed,
  'STABLE': Icons.pets,
};

const Map<String, IconData> kUnitIcons = {
  'MILITIA': Icons.person,
  'SWORDSMAN': Icons.sports_martial_arts,
  'ARCHER': Icons.gps_fixed,
  'KNIGHT': Icons.emoji_events,
};

IconData buildingIcon(String type) => kBuildingIcons[type] ?? Icons.location_city;
IconData unitIcon(String type) => kUnitIcons[type] ?? Icons.person;
