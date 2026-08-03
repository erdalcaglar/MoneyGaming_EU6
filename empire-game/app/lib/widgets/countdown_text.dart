import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Bir bitiş zamanına kalan süreyi her saniye güncelleyerek gösterir
/// (inşa/eğitim zamanlayıcıları için). Süre dolunca [onDone] çağrılır.
class CountdownText extends StatefulWidget {
  const CountdownText({super.key, required this.endsAt, this.onDone, this.style});

  final DateTime endsAt;
  final VoidCallback? onDone;
  final TextStyle? style;

  @override
  State<CountdownText> createState() => _CountdownTextState();
}

class _CountdownTextState extends State<CountdownText> {
  late Timer _timer;
  Duration _remaining = Duration.zero;
  bool _doneFired = false;

  @override
  void initState() {
    super.initState();
    _tick();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  void _tick() {
    final remaining = widget.endsAt.difference(DateTime.now());
    setState(() => _remaining = remaining.isNegative ? Duration.zero : remaining);
    if (_remaining == Duration.zero && !_doneFired) {
      _doneFired = true;
      widget.onDone?.call();
    }
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final h = _remaining.inHours;
    final m = _remaining.inMinutes % 60;
    final s = _remaining.inSeconds % 60;
    final text = h > 0
        ? '${h}s ${m.toString().padLeft(2, '0')}d'
        : '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    return Text(text, style: widget.style ?? const TextStyle(color: AppColors.warning, fontWeight: FontWeight.w700));
  }
}
