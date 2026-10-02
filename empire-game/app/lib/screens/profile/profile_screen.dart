import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/battle.dart';
import '../../models/catalog.dart';
import '../../state/auth_controller.dart';
import '../../state/providers.dart';
import '../../theme/app_colors.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late Future<List<LeaderboardEntry>> _leaderboardFuture;

  @override
  void initState() {
    super.initState();
    _leaderboardFuture = ref.read(leaderboardServiceProvider).top(limit: 20);
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final player = auth.player;
    final catalogAsync = ref.watch(catalogProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Çıkış yap',
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (player != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(radius: 26, backgroundColor: AppColors.gold, child: Text(player.username[0].toUpperCase(), style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 20))),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(player.username, style: Theme.of(context).textTheme.titleLarge),
                              Text(player.email, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Seviye ${player.level}', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.gold)),
                            Text('${player.xp} XP', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    catalogAsync.maybeWhen(
                      data: (catalog) => _xpProgress(catalog, player.level, player.xp),
                      orElse: () => const SizedBox.shrink(),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 20),
          Text('Liderlik Tablosu', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          FutureBuilder<List<LeaderboardEntry>>(
            future: _leaderboardFuture,
            builder: (context, snapshot) {
              if (!snapshot.hasData) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
              final entries = snapshot.data!;
              return Column(
                children: entries
                    .map(
                      (e) => Card(
                        margin: const EdgeInsets.only(bottom: 6),
                        child: ListTile(
                          leading: CircleAvatar(child: Text('${e.rank}')),
                          title: Text(e.username),
                          subtitle: Text('Seviye ${e.level} • ${e.villageCount} köy'),
                          trailing: Text('${e.score} puan', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.gold)),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
        ],
      ),
    );
  }

  LevelCatalog? _findLevel(List<LevelCatalog> levels, int level) {
    for (final l in levels) {
      if (l.level == level) return l;
    }
    return null;
  }

  Widget _xpProgress(Catalog catalog, int level, int xp) {
    final levels = catalog.levels;
    final current = _findLevel(levels, level);
    final next = _findLevel(levels, level + 1);
    if (current == null || next == null) {
      return const Text('Maksimum seviye!', style: TextStyle(color: AppColors.gold));
    }
    final span = (next.xpRequired - current.xpRequired).clamp(1, 1 << 30);
    final progress = ((xp - current.xpRequired) / span).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(value: progress, minHeight: 8, backgroundColor: AppColors.surfaceBorder, color: AppColors.gold),
        ),
        const SizedBox(height: 4),
        Text('Sonraki seviyeye ${next.xpRequired - xp} XP kaldı', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
      ],
    );
  }
}
