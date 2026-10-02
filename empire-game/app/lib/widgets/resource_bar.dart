import 'package:flutter/material.dart';
import '../models/resources.dart';
import '../models/village.dart';
import '../theme/app_colors.dart';

class ResourceBar extends StatelessWidget {
  const ResourceBar({super.key, required this.village});

  final Village village;

  @override
  Widget build(BuildContext context) {
    final cap = village.storageCap;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.surfaceBorder)),
      ),
      child: Row(
        children: [
          Expanded(child: _ResourceChip(icon: Icons.circle, color: AppColors.resourceGold, label: 'Altın', value: village.resources.gold, cap: cap)),
          const SizedBox(width: 8),
          Expanded(child: _ResourceChip(icon: Icons.restaurant, color: AppColors.resourceFood, label: 'Yiyecek', value: village.resources.food, cap: cap)),
          const SizedBox(width: 8),
          Expanded(child: _ResourceChip(icon: Icons.park, color: AppColors.resourceWood, label: 'Odun', value: village.resources.wood, cap: cap)),
          const SizedBox(width: 8),
          _PopulationChip(population: village.population),
        ],
      ),
    );
  }
}

class _ResourceChip extends StatelessWidget {
  const _ResourceChip({required this.icon, required this.color, required this.label, required this.value, required this.cap});

  final IconData icon;
  final Color color;
  final String label;
  final double value;
  final double cap;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: '$label: ${value.floor()} / ${cap.floor()}',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              _format(value),
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  String _format(double v) {
    if (v >= 1000000) return '${(v / 1000000).toStringAsFixed(1)}M';
    if (v >= 1000) return '${(v / 1000).toStringAsFixed(1)}K';
    return v.floor().toString();
  }
}

class _PopulationChip extends StatelessWidget {
  const _PopulationChip({required this.population});
  final Population population;

  @override
  Widget build(BuildContext context) {
    final full = population.used >= population.cap;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.people, size: 14, color: full ? AppColors.danger : AppColors.textSecondary),
        const SizedBox(width: 4),
        Text('${population.used}/${population.cap}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
      ],
    );
  }
}
