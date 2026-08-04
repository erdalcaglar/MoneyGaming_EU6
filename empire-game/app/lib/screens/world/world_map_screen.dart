import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../../models/world.dart';
import '../../state/providers.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';
import '../battle/attack_sheet.dart';

class WorldMapScreen extends ConsumerStatefulWidget {
  const WorldMapScreen({super.key});

  @override
  ConsumerState<WorldMapScreen> createState() => _WorldMapScreenState();
}

class _WorldMapScreenState extends ConsumerState<WorldMapScreen> {
  List<WorldMapEntry>? _entries;
  String? _error;
  bool _loading = false;
  String? _loadedForVillageId;

  Future<void> _load() async {
    final village = ref.read(villageControllerProvider).selected;
    if (village == null) return;
    _loadedForVillageId = village.id;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final entries = await ref.read(worldServiceProvider).map(x: village.x, y: village.y, radius: 10);
      if (!mounted) return;
      setState(() => _entries = entries);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final village = ref.watch(villageControllerProvider).selected;
    if (village != null && !_loading && _loadedForVillageId != village.id) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _load());
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dünya Haritası'),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _loading ? null : _load)],
      ),
      body: village == null
          ? const Center(child: CircularProgressIndicator())
          : _loading && _entries == null
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: _entries?.length ?? 0,
                        separatorBuilder: (_, _) => const SizedBox(height: 8),
                        itemBuilder: (context, i) {
                          final entry = _entries![i];
                          final isOwnVillage = entry.id == village.id;
                          return Card(
                            child: ListTile(
                              enabled: !isOwnVillage,
                              leading: CircleAvatar(
                                backgroundColor: entry.isNpc ? AppColors.crimson.withValues(alpha: 0.3) : AppColors.steel.withValues(alpha: 0.3),
                                child: Icon(entry.isNpc ? Icons.fort : Icons.flag, color: entry.isNpc ? AppColors.crimson : AppColors.steel),
                              ),
                              title: Text(entry.name + (isOwnVillage ? ' (senin köyün)' : '')),
                              subtitle: Text(
                                'Mesafe ${entry.distance} • Savunma ~${entry.estimatedDefense}'
                                '${entry.conquerable ? ' • Fethedilebilir' : ''}',
                              ),
                              trailing: isOwnVillage
                                  ? null
                                  : ElevatedButton(
                                      onPressed: () => showAttackSheet(context, ref: ref, attacker: village, target: entry),
                                      child: const Text('Saldır'),
                                    ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
