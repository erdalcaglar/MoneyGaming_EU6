import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../game/village_game.dart';
import '../../models/catalog.dart';
import '../../models/village.dart';
import '../../state/providers.dart';
import '../../state/village_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/resource_bar.dart';
import '../build/build_menu_sheet.dart';
import 'building_detail_sheet.dart';

class VillageScreen extends ConsumerStatefulWidget {
  const VillageScreen({super.key});

  @override
  ConsumerState<VillageScreen> createState() => _VillageScreenState();
}

class _VillageScreenState extends ConsumerState<VillageScreen> {
  VillageGame? _game;

  @override
  Widget build(BuildContext context) {
    final villageState = ref.watch(villageControllerProvider);
    final catalogAsync = ref.watch(catalogProvider);
    final village = villageState.selected;

    if (villageState.status == VillageLoadStatus.loading || village == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return catalogAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('İçerik yüklenemedi: $e'))),
      data: (catalog) {
        _game ??= VillageGame(
          village: village,
          catalog: catalog,
          onSlotTap: (x, y) => _onSlotTap(context, village, catalog, x, y),
        );
        _game!.updateVillage(village, catalog);

        return Scaffold(
          appBar: AppBar(
            title: Text(village.name),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                tooltip: 'Kaynakları güncelle',
                onPressed: () => ref.read(villageControllerProvider.notifier).collect(village.id),
              ),
            ],
          ),
          body: Column(
            children: [
              ResourceBar(village: village),
              Expanded(
                child: Container(
                  color: const Color(0xFF10160C),
                  padding: const EdgeInsets.all(12),
                  child: Center(
                    child: AspectRatio(
                      aspectRatio: 1,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: GameWidget(game: _game!),
                      ),
                    ),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: const BoxDecoration(
                  color: AppColors.surface,
                  border: Border(top: BorderSide(color: AppColors.surfaceBorder)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, size: 16, color: AppColors.textMuted),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Boş kareye dokun: inşa et  •  Binaya dokun: yükselt / işçi ata',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _onSlotTap(BuildContext context, Village village, Catalog catalog, int x, int y) {
    BuildingInstance? building;
    for (final b in village.buildings) {
      if (b.slotX == x && b.slotY == y) building = b;
    }
    if (building == null) {
      showBuildMenuSheet(context, ref: ref, village: village, catalog: catalog, slotX: x, slotY: y);
    } else {
      showBuildingDetailSheet(context, ref: ref, village: village, building: building, def: catalog.building(building.type));
    }
  }
}
