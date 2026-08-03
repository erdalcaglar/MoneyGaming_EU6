import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';
import '../models/village.dart';
import 'providers.dart';

enum VillageLoadStatus { initial, loading, ready, error }

class VillageState {
  const VillageState({
    required this.status,
    this.villages = const [],
    this.selectedVillageId,
    this.error,
  });

  final VillageLoadStatus status;
  final List<Village> villages;
  final String? selectedVillageId;
  final String? error;

  Village? get selected {
    if (selectedVillageId == null) return villages.isEmpty ? null : villages.first;
    for (final v in villages) {
      if (v.id == selectedVillageId) return v;
    }
    return villages.isEmpty ? null : villages.first;
  }

  VillageState copyWith({
    VillageLoadStatus? status,
    List<Village>? villages,
    String? selectedVillageId,
    String? error,
  }) =>
      VillageState(
        status: status ?? this.status,
        villages: villages ?? this.villages,
        selectedVillageId: selectedVillageId ?? this.selectedVillageId,
        error: error,
      );
}

class VillageController extends StateNotifier<VillageState> {
  VillageController(this._ref) : super(const VillageState(status: VillageLoadStatus.initial));

  final Ref _ref;

  Future<void> load() async {
    state = state.copyWith(status: VillageLoadStatus.loading);
    try {
      final villages = await _ref.read(villageServiceProvider).myVillages();
      state = state.copyWith(status: VillageLoadStatus.ready, villages: villages);
    } on ApiException catch (e) {
      state = state.copyWith(status: VillageLoadStatus.error, error: e.message);
    }
  }

  void selectVillage(String id) => state = state.copyWith(selectedVillageId: id);

  void _replaceVillage(Village updated) {
    final list = state.villages.map((v) => v.id == updated.id ? updated : v).toList();
    state = state.copyWith(villages: list);
  }

  Future<String?> collect(String villageId) => _mutate(() => _ref.read(villageServiceProvider).collect(villageId));

  Future<String?> placeBuilding(String villageId, {required String type, required int slotX, required int slotY}) =>
      _mutate(() => _ref
          .read(villageServiceProvider)
          .placeBuilding(villageId, type: type, slotX: slotX, slotY: slotY));

  Future<String?> upgradeBuilding(String villageId, String buildingId) =>
      _mutate(() => _ref.read(villageServiceProvider).upgradeBuilding(villageId, buildingId));

  Future<String?> setWorkers(String villageId, String buildingId, int count) =>
      _mutate(() => _ref.read(villageServiceProvider).setWorkers(villageId, buildingId, count));

  Future<String?> train(String villageId, {required String unitType, required int count}) =>
      _mutate(() => _ref.read(armyServiceProvider).train(villageId, unitType: unitType, count: count));

  /// Bir aksiyonu çalıştırır, köyü günceller; hata varsa mesajı döner
  /// (başarılıysa null), böylece UI snackbar/dialog gösterebilir.
  Future<String?> _mutate(Future<Village> Function() action) async {
    try {
      final updated = await action();
      _replaceVillage(updated);
      return null;
    } on ApiException catch (e) {
      return e.message;
    }
  }

  void applyVillage(Village village) => _replaceVillage(village);
}

final villageControllerProvider =
    StateNotifierProvider<VillageController, VillageState>((ref) => VillageController(ref));
