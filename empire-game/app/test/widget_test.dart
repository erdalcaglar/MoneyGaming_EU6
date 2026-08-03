import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:empire_age/main.dart';

void main() {
  testWidgets('Uygulama açılışta yükleniyor/giriş durumunu gösterir', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: EmpireAgeApp()));
    // AuthGate başlangıçta "unknown" durumdayken bir yükleniyor göstergesi çizer.
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
