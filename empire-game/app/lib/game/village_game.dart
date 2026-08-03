import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import '../models/catalog.dart';
import '../models/village.dart';
import '../theme/app_colors.dart';

/// Backend'deki `GRID_SIZE` sabitiyle eşleşmeli (bkz. backend/src/modules/village/service.ts).
const int gridSize = 6;

/// Köy sahnesini basit, sprite'sız (renkli+etiketli) bir grid olarak
/// çizen hafif bir Flame sahnesi. Gerçek sprite'lar eklendiğinde
/// (bkz. ROADMAP.md) sadece [BuildingTile._renderContent] değişir,
/// grid/etkileşim mantığı aynı kalır.
class VillageGame extends FlameGame {
  VillageGame({required Village village, required Catalog catalog, required this.onSlotTap})
      : _village = village,
        _catalog = catalog;

  Village _village;
  Catalog _catalog;
  final void Function(int slotX, int slotY) onSlotTap;

  static const double tileSize = 64;
  static const double tileGap = 6;

  @override
  Color backgroundColor() => const Color(0xFF1B2415);

  @override
  Future<void> onLoad() async {
    camera.viewfinder.anchor = Anchor.topLeft;
    _rebuild();
  }

  void updateVillage(Village village, Catalog catalog) {
    _village = village;
    _catalog = catalog;
    _rebuild();
  }

  void _rebuild() {
    world.removeAll(world.children.whereType<BuildingTile>().toList());
    final occupied = {for (final b in _village.buildings) '${b.slotX},${b.slotY}': b};

    for (var y = 0; y < gridSize; y++) {
      for (var x = 0; x < gridSize; x++) {
        final building = occupied['$x,$y'];
        final def = building != null ? _catalog.building(building.type) : null;
        world.add(
          BuildingTile(
            slotX: x,
            slotY: y,
            building: building,
            def: def,
            onTap: () => onSlotTap(x, y),
          )..position = Vector2(x * (tileSize + tileGap), y * (tileSize + tileGap)),
        );
      }
    }
  }
}

class BuildingTile extends PositionComponent with TapCallbacks {
  BuildingTile({
    required this.slotX,
    required this.slotY,
    required this.building,
    required this.def,
    required this.onTap,
  }) : super(size: Vector2.all(VillageGame.tileSize));

  final int slotX;
  final int slotY;
  final BuildingInstance? building;
  final BuildingCatalog? def;
  final VoidCallback onTap;

  @override
  void render(Canvas canvas) {
    final rect = Rect.fromLTWH(0, 0, size.x, size.y);
    final color = building != null ? AppColors.forKey(def?.colorKey ?? 'default') : const Color(0xFF2A3A22);
    final paint = Paint()..color = building != null ? color.withValues(alpha: building!.isFoundation ? 0.35 : 0.85) : color;
    final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(10));
    canvas.drawRRect(rrect, paint);

    final borderPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4
      ..color = building != null ? Colors.white.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.15);
    canvas.drawRRect(rrect, borderPaint);

    if (building == null) {
      _drawText(canvas, '+', rect.center, 18, Colors.white24);
      return;
    }

    final label = def?.name ?? building!.type;
    _drawText(canvas, _shorten(label), Offset(rect.center.dx, rect.center.dy - 6), 10, Colors.white);
    final levelLabel = building!.isFoundation ? '…' : 'Sv ${building!.level}';
    _drawText(canvas, levelLabel, Offset(rect.center.dx, rect.center.dy + 12), 9, Colors.white70);

    if (building!.isUnderConstruction) {
      final dot = Paint()..color = AppColors.warning;
      canvas.drawCircle(Offset(rect.right - 8, rect.top + 8), 4, dot);
    }
    if (building!.workersAssigned > 0) {
      final dot = Paint()..color = AppColors.forest;
      canvas.drawCircle(Offset(rect.left + 8, rect.top + 8), 4, dot);
    }
  }

  String _shorten(String label) => label.length <= 10 ? label : '${label.substring(0, 9)}…';

  void _drawText(Canvas canvas, String text, Offset center, double fontSize, Color color) {
    final painter = TextPainter(
      text: TextSpan(text: text, style: TextStyle(color: color, fontSize: fontSize, fontWeight: FontWeight.w700)),
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.center,
    )..layout(maxWidth: size.x - 4);
    painter.paint(canvas, Offset(center.dx - painter.width / 2, center.dy - painter.height / 2));
  }

  @override
  void onTapUp(TapUpEvent event) => onTap();
}
