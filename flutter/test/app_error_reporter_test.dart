import 'package:flutter_test/flutter_test.dart';
import 'package:kkokkapick/services/app_error_reporter.dart';

void main() {
  test('sanitizes bearer tokens, JWTs and email addresses', () {
    const jwt =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.abcdefghijklmnop';
    final sanitized = sanitizeDiagnosticText(
      'Bearer secret-token $jwt user@example.com',
    );

    expect(sanitized, contains('Bearer [REDACTED]'));
    expect(sanitized, contains('[REDACTED_JWT]'));
    expect(sanitized, contains('[REDACTED_EMAIL]'));
    expect(sanitized, isNot(contains('secret-token')));
    expect(sanitized, isNot(contains('user@example.com')));
  });

  test('sanitized error never exposes the original sensitive message', () {
    final error = SanitizedAppError.from(
      Exception('contact me at owner@example.com Bearer private-value'),
      StackTrace.fromString('trace owner@example.com'),
      context: 'auth owner@example.com',
    );

    expect(error.message, isNot(contains('owner@example.com')));
    expect(error.stackTrace, isNot(contains('owner@example.com')));
    expect(error.context, isNot(contains('owner@example.com')));
  });
}
