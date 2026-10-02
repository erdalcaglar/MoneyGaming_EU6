class AppConfig {
  AppConfig._();

  /// Backend API adresi. Android emülatörü host makineye 10.0.2.2 ile
  /// erişir; iOS simülatörü/gerçek cihazlar için `--dart-define=API_BASE_URL=...`
  /// ile geçersiz kılınabilir (bkz. README "Ortam değişkenleri").
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api/v1',
  );
}
