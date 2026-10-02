import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';

class EmpireOverviewScreen extends ConsumerWidget {
  const EmpireOverviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(villageControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('İmparatorluğum'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(villageControllerProvider.notifier).load(),
          ),
        ],
      ),
      body: state.status == VillageLoadStatus.loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: state.villages.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final v = state.villages[i];
                final selected = v.id == state.selected?.id;
                return Card(
                  color: selected ? AppColors.surfaceRaised : AppColors.surface,
                  child: ListTile(
                    leading: Icon(v.isCapital ? Icons.castle : Icons.holiday_village, color: AppColors.gold),
                    title: Text(v.name),
                    subtitle: Text('Konum (${v.x}, ${v.y}) • Kale Sv${v.townHallLevel} • Savunma ${v.defensePower}'),
                    trailing: selected ? const Icon(Icons.check_circle, color: AppColors.success) : null,
                    onTap: () => ref.read(villageControllerProvider.notifier).selectVillage(v.id),
                  ),
                );
              },
            ),
    );
  }
}
