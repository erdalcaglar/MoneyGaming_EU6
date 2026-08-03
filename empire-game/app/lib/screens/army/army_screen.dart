import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/catalog.dart';
import '../../models/village.dart';
import '../../state/providers.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/countdown_text.dart';
import '../../widgets/type_icon.dart';

class ArmyScreen extends ConsumerWidget {
  const ArmyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final village = ref.watch(villageControllerProvider).selected;
    final catalogAsync = ref.watch(catalogProvider);

    if (village == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(title: const Text('Ordu')),
      body: catalogAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Hata: $e')),
        data: (catalog) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Mevcut Ordu', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 10),
            if (village.units.every((u) => u.count == 0 && u.trainingCount == 0))
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Text('Henüz asker yok. Aşağıdan eğitim başlat.', style: TextStyle(color: AppColors.textMuted)),
              ),
            ...village.units.where((u) => u.count > 0 || u.trainingCount > 0).map(
                  (u) => _UnitRow(unit: u, def: catalog.unit(u.type)),
                ),
            const SizedBox(height: 24),
            Text('Eğitim', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 10),
            ...catalog.units.map((def) => _TrainCard(village: village, def: def)),
          ],
        ),
      ),
    );
  }
}

class _UnitRow extends StatelessWidget {
  const _UnitRow({required this.unit, required this.def});
  final UnitStack unit;
  final UnitCatalog? def;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: TypeIcon(colorKey: def?.colorKey ?? 'default', icon: unitIcon(unit.type)),
        title: Text(def?.name ?? unit.type),
        subtitle: unit.isTraining
            ? Row(
                children: [
                  const Text('Eğitiliyor: '),
                  CountdownText(endsAt: unit.trainingEndsAt!),
                  Text(' (+${unit.trainingCount})'),
                ],
              )
            : Text('Saldırı ${def?.attack ?? '?'} • Savunma ${def?.defense ?? '?'}'),
        trailing: Text('${unit.count}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
      ),
    );
  }
}

class _TrainCard extends ConsumerStatefulWidget {
  const _TrainCard({required this.village, required this.def});
  final Village village;
  final UnitCatalog def;

  @override
  ConsumerState<_TrainCard> createState() => _TrainCardState();
}

class _TrainCardState extends ConsumerState<_TrainCard> {
  int _count = 1;
  bool _busy = false;

  @override
  Widget build(BuildContext context) {
    final village = widget.village;
    final def = widget.def;
    final trainingBuilding = village.buildings.where((b) => b.type == def.trainedAt).toList();
    final hasBuilding = trainingBuilding.isNotEmpty && trainingBuilding.first.level >= def.requiresBuildingLevel;
    final existing = village.units.where((u) => u.type == def.type).toList();
    final alreadyTraining = existing.isNotEmpty && existing.first.isTraining;

    final totalCost = ResourceCost(
      gold: def.cost.gold * _count,
      food: def.cost.food * _count,
      wood: def.cost.wood * _count,
    );
    final affordable = totalCost.affordableWith(
      gold: village.resources.gold,
      food: village.resources.food,
      wood: village.resources.wood,
    );
    final freePopulation = village.population.cap - village.population.used;
    final populationOk = _count * def.populationCost <= freePopulation;

    final disabledReason = !hasBuilding
        ? '${def.trainedAt} seviye ${def.requiresBuildingLevel} gerekli'
        : alreadyTraining
            ? 'Zaten eğitiliyor'
            : !populationOk
                ? 'Nüfus yetersiz'
                : !affordable
                    ? 'Kaynak yetersiz'
                    : null;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                TypeIcon(colorKey: def.colorKey, icon: unitIcon(def.type)),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(def.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text(def.description, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                IconButton(
                  onPressed: _count > 1 ? () => setState(() => _count--) : null,
                  icon: const Icon(Icons.remove_circle_outline),
                ),
                Text('$_count', style: const TextStyle(fontWeight: FontWeight.w800)),
                IconButton(
                  onPressed: () => setState(() => _count++),
                  icon: const Icon(Icons.add_circle_outline),
                ),
                const Spacer(),
                Text('${(def.trainSeconds * _count)}sn', style: const TextStyle(color: AppColors.textMuted)),
              ],
            ),
            const SizedBox(height: 4),
            Text(_costLabel(totalCost), style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _busy || disabledReason != null ? null : _train,
                child: Text(disabledReason ?? 'Eğit'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _train() async {
    setState(() => _busy = true);
    final error = await ref
        .read(villageControllerProvider.notifier)
        .train(widget.village.id, unitType: widget.def.type, count: _count);
    if (!mounted) return;
    setState(() => _busy = false);
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    } else {
      setState(() => _count = 1);
    }
  }

  String _costLabel(ResourceCost cost) {
    final parts = <String>[];
    if (cost.gold > 0) parts.add('${cost.gold.toInt()} Altın');
    if (cost.food > 0) parts.add('${cost.food.toInt()} Yiyecek');
    if (cost.wood > 0) parts.add('${cost.wood.toInt()} Odun');
    return parts.join(' + ');
  }
}
