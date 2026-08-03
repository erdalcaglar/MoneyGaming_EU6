import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../../models/village.dart';
import '../../models/world.dart';
import '../../state/providers.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';
import 'battle_result_dialog.dart';

Future<void> showAttackSheet(
  BuildContext context, {
  required WidgetRef ref,
  required Village attacker,
  required WorldMapEntry target,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
    builder: (_) => _AttackSheetContent(attacker: attacker, target: target),
  );
}

class _AttackSheetContent extends ConsumerStatefulWidget {
  const _AttackSheetContent({required this.attacker, required this.target});
  final Village attacker;
  final WorldMapEntry target;

  @override
  ConsumerState<_AttackSheetContent> createState() => _AttackSheetContentState();
}

class _AttackSheetContentState extends ConsumerState<_AttackSheetContent> {
  final Map<String, int> _selected = {};
  bool _busy = false;

  @override
  Widget build(BuildContext context) {
    final availableUnits = widget.attacker.units.where((u) => u.count > 0).toList();
    final totalSelected = _selected.values.fold<int>(0, (a, b) => a + b);

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(left: 16, right: 16, top: 16, bottom: MediaQuery.of(context).viewInsets.bottom + 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${widget.target.name} — Saldır', style: Theme.of(context).textTheme.titleLarge),
            Text('Tahmini savunma: ${widget.target.estimatedDefense}', style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 12),
            if (availableUnits.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('Gönderecek askerin yok. Önce Ordu sekmesinden asker eğit.', style: TextStyle(color: AppColors.textMuted)),
              )
            else
              ...availableUnits.map((u) {
                final selectedCount = _selected[u.type] ?? 0;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Expanded(child: Text('${u.type} (${u.count} mevcut)')),
                      IconButton(
                        onPressed: selectedCount > 0 ? () => setState(() => _selected[u.type] = selectedCount - 1) : null,
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      Text('$selectedCount', style: const TextStyle(fontWeight: FontWeight.w800)),
                      IconButton(
                        onPressed: selectedCount < u.count ? () => setState(() => _selected[u.type] = selectedCount + 1) : null,
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                );
              }),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _busy || totalSelected == 0 ? null : _attack,
                child: Text(_busy ? 'Saldırılıyor…' : 'Saldırıyı Başlat ($totalSelected birim)'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _attack() async {
    setState(() => _busy = true);
    try {
      final result = await ref.read(battleServiceProvider).attack(
            attackerVillageId: widget.attacker.id,
            targetVillageId: widget.target.id,
            units: Map.fromEntries(_selected.entries.where((e) => e.value > 0)),
          );
      ref.read(villageControllerProvider.notifier).applyVillage(result.attackerVillage);
      if (!mounted) return;
      Navigator.of(context).pop();
      await showBattleResultDialog(context, result);
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }
}
