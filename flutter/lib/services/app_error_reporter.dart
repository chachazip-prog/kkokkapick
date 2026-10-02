import 'package:flutter/foundation.dart';

abstract interface class AppErrorReporter {
  void record(
    Object error,
    StackTrace stackTrace, {
    String? context,
  });
}

final class NoopAppErrorReporter implements AppErrorReporter {
  const NoopAppErrorReporter();

  @override
  void record(
    Object error,
    StackTrace stackTrace, {
    String? context,
  }) {}
}

@visibleForTesting
String sanitizeDiagnosticText(String input) {
  var value = input;
  value = value.replaceAll(
    RegExp(r'Bearer\s+[A-Za-z0-9._~+\-/]+=*', caseSensitive: false),
    'Bearer [REDACTED]',
  );
  value = value.replaceAll(
    RegExp(r'\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b'),
    '[REDACTED_JWT]',
  );
  value = value.replaceAll(
    RegExp(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'),
    '[REDACTED_EMAIL]',
  );
  return value;
}

final class SanitizedAppError {
  const SanitizedAppError({
    required this.message,
    required this.stackTrace,
    this.context,
  });

  factory SanitizedAppError.from(
    Object error,
    StackTrace stackTrace, {
    String? context,
  }) =>
      SanitizedAppError(
        message: sanitizeDiagnosticText(error.toString()),
        stackTrace: sanitizeDiagnosticText(stackTrace.toString()),
        context: context == null ? null : sanitizeDiagnosticText(context),
      );

  final String message;
  final String stackTrace;
  final String? context;
}
