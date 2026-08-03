import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/catalog.dart';
import '../../models/village.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/countdown_text.dart';
import '../../widgets/type_icon.dart';

void showBuildingDetailSheet(
  BuildContext context, {
  required WidgetRef ref,
  required Village village,
  required BuildingInstance building,
  required BuildingCatalog? def,
}) {
  showModalBottomSheet(
    context: context,
    backgroundColor: AppColors.surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
    builder: (_) => _BuildingDetailContent(village: village, building: building, def: def),
  );
}

class _BuildingDetailContent extends ConsumerStatefulWidget {
  const _BuildingDetailContent({required this.village, required this.building, required this.def});

  final Village village;
  final BuildingInstance building;
  final BuildingCatalog? def;

  @override
  ConsumerState<_BuildingDetailContent> createState() => _BuildingDetailContentState();
}

class _BuildingDetailContentState extends ConsumerState<_BuildingDetailContent> {
  bool _busy = false;

  Future<void> _run(Future<String?> Function() action) async {
    setState(() => _busy = true);
    final error = await action();
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
    final def = widget.def;
    final building = widget.building;
    final nextLevel = def?.levelDef(building.level + 1);
    final village = widget.village;

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              TypeIcon(colorKey: def?.colorKey ?? 'default', icon: buildingIcon(building.type), size: 48),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(def?.name ?? building.type, style: Theme.of(context).textTheme.titleLarge),
                    Text(
                      building.isFoundation ? 'İnşa ediliyor…' : 'Seviye ${building.level}',
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (def != null) Text(def.description, style: const TextStyle(color: AppColors.textSecondary)),
          const SizedBox(height: 16),
          if (building.isUnderConstruction) ...[
            Row(
              children: [
                const Icon(Icons.hourglass_top, size: 16, color: AppColors.warning),
                const SizedBox(width: 6),
                const Text('Tamamlanıyor: '),
                CountdownText(endsAt: building.upgradeEndsAt!, onDone: () => setState(() {})),
              ],
            ),
          ] else ...[
            if (def?.workable ?? false) _WorkerAssignment(village: village, building: building, def: def!, busy: _busy, onSet: (count) => _run(() => ref.read(villageControllerProvider.notifier).setWorkers(village.id, building.id, count))),
            const SizedBox(height: 12),
            if (nextLevel != null)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _busy
                      ? null
                      : () => _run(() => ref.read(villageControllerProvider.notifier).upgradeBuilding(village.id, building.id)),
                  child: Text('Seviye ${building.level + 1}\'e Yükselt  •  ${_costLabel(nextLevel.cost)}  •  ${nextLevel.buildSeconds}sn'),
                ),
              )
            else
              const Text('Maksimum seviyede', style: TextStyle(color: AppColors.textMuted)),
          ],
        ],
      ),
    );
  }

  String _costLabel(ResourceCost cost) {
    final parts = <String>[];
    if (cost.gold > 0) parts.add('${cost.gold.toInt()} Altın');
    if (cost.food > 0) parts.add('${cost.food.toInt()} Yiyecek');
    if (cost.wood > 0) parts.add('${cost.wood.toInt()} Odun');
    return parts.join(' + ');
  }
}

class _WorkerAssignment extends StatelessWidget {
  const _WorkerAssignment({
    required this.village,
    required this.building,
    required this.def,
    required this.busy,
    required this.onSet,
  });

  final Village village;
  final BuildingInstance building;
  final BuildingCatalog def;
  final bool busy;
  final ValueChanged<int> onSet;

  @override
  Widget build(BuildContext context) {
    final freePopulation = village.population.cap - village.population.used;
    final canIncrease = building.workersAssigned < def.maxWorkers && freePopulation > 0;
    return Row(
      children: [
        const Text('İşçi: '),
        IconButton(
          onPressed: busy || building.workersAssigned <= 0 ? null : () => onSet(building.workersAssigned - 1),
          icon: const Icon(Icons.remove_circle_outline),
        ),
        Text('${building.workersAssigned} / ${def.maxWorkers}', style: const TextStyle(fontWeight: FontWeight.w700)),
        IconButton(
          onPressed: busy || !canIncrease ? null : () => onSet(building.workersAssigned + 1),
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }
}
