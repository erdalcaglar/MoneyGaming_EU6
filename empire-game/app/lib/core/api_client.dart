import 'package:dio/dio.dart';
import 'constants.dart';
import 'secure_storage.dart';

class ApiException implements Exception {
  ApiException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => message;
}

/// Backend'in `{ data: ... }` / `{ error: { code, message } }` zarfını
/// açan ince bir Dio sarmalayıcısı. JWT'yi her isteğe otomatik ekler.
class ApiClient {
  ApiClient(this._storage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.readToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final Dio _dio;
  final SecureStorage _storage;

  ApiException _toApiException(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['error'] is Map) {
      final err = data['error'] as Map;
      return ApiException((err['code'] ?? 'ERROR').toString(), (err['message'] ?? 'Bir hata oluştu').toString());
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.connectionError) {
      return ApiException('NETWORK_ERROR', 'Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.');
    }
    return ApiException('UNKNOWN_ERROR', 'Beklenmeyen bir hata oluştu.');
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    try {
      final res = await _dio.get(path, queryParameters: query);
      return res.data['data'];
    } on DioException catch (e) {
      throw _toApiException(e);
    }
  }

  Future<dynamic> post(String path, {Object? body}) async {
    try {
      final res = await _dio.post(path, data: body);
      return res.data['data'];
    } on DioException catch (e) {
      throw _toApiException(e);
    }
  }
}
