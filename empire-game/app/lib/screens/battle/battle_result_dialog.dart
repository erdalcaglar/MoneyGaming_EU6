import 'package:flutter/material.dart';
import '../../models/battle.dart';
import '../../theme/app_colors.dart';

Future<void> showBattleResultDialog(BuildContext context, BattleResult result) {
  return showDialog(
    context: context,
    builder: (_) => AlertDialog(
      backgroundColor: AppColors.surface,
      title: Row(
        children: [
          Icon(result.isWin ? Icons.emoji_events : Icons.dangerous, color: result.isWin ? AppColors.success : AppColors.danger),
          const SizedBox(width: 8),
          Text(result.isWin ? 'Zafer!' : 'Yenilgi'),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Güç oranı: ${result.ratio.toStringAsFixed(2)}x'),
          const SizedBox(height: 8),
          if (result.isWin) ...[
            Text('Yağma: ${result.loot.gold.toInt()} Altın, ${result.loot.food.toInt()} Yiyecek, ${result.loot.wood.toInt()} Odun'),
          ],
          Text('Kazanılan XP: ${result.xpGained}'),
          if (result.conquered)
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text('Köy fethedildi! İmparatorluğuna eklendi.', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Tamam')),
      ],
    ),
  );
}
