import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/catalog.dart';
import '../../models/village.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/type_icon.dart';

void showBuildMenuSheet(
  BuildContext context, {
  required WidgetRef ref,
  required Village village,
  required Catalog catalog,
  required int slotX,
  required int slotY,
}) {
  showModalBottomSheet(
    context: context,
    backgroundColor: AppColors.surface,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
    builder: (_) => _BuildMenuContent(village: village, catalog: catalog, slotX: slotX, slotY: slotY),
  );
}

class _BuildMenuContent extends ConsumerStatefulWidget {
  const _BuildMenuContent({required this.village, required this.catalog, required this.slotX, required this.slotY});

  final Village village;
  final Catalog catalog;
  final int slotX;
  final int slotY;

  @override
  ConsumerState<_BuildMenuContent> createState() => _BuildMenuContentState();
}

class _BuildMenuContentState extends ConsumerState<_BuildMenuContent> {
  bool _busy = false;

  Future<void> _place(String type) async {
    setState(() => _busy = true);
    final error = await ref
        .read(villageControllerProvider.notifier)
        .placeBuilding(widget.village.id, type: type, slotX: widget.slotX, slotY: widget.slotY);
    if (!mounted) return;
    setState(() => _busy = false);
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    } else {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final placeable = widget.catalog.buildings.where((b) => b.category != 'HEADQUARTERS').toList();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Yeni Bina İnşa Et', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            ConstrainedBox(
              constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.55),
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: placeable.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final def = placeable[i];
                  final levelOne = def.levelDef(1);
                  final locked = levelOne == null || levelOne.requiresTownHallLevel > widget.village.townHallLevel;
                  final affordable = levelOne != null &&
                      levelOne.cost.affordableWith(
                        gold: widget.village.resources.gold,
                        food: widget.village.resources.food,
                        wood: widget.village.resources.wood,
                      );
                  return Card(
                    child: ListTile(
                      leading: TypeIcon(colorKey: def.colorKey, icon: _iconFor(def.type)),
                      title: Text(def.name),
                      subtitle: Text(
                        locked
                            ? 'Kale seviye ${levelOne?.requiresTownHallLevel ?? '?'} gerekli'
                            : '${_costLabel(levelOne.cost)} • ${levelOne.buildSeconds}sn',
                        style: TextStyle(color: locked ? AppColors.danger : AppColors.textSecondary),
                      ),
                      trailing: _busy
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : ElevatedButton(
                              onPressed: locked || !affordable ? null : () => _place(def.type),
                              child: const Text('İnşa Et'),
                            ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _iconFor(String type) {
    const map = {
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
    return map[type] ?? Icons.location_city;
  }

  String _costLabel(ResourceCost cost) {
    final parts = <String>[];
    if (cost.gold > 0) parts.add('${cost.gold.toInt()} Altın');
    if (cost.food > 0) parts.add('${cost.food.toInt()} Yiyecek');
    if (cost.wood > 0) parts.add('${cost.wood.toInt()} Odun');
    return parts.join(' + ');
  }
}
