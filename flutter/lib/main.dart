import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'release_app_v11.dart';
import 'services/app_error_reporter.dart';

const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  const reporter = NoopAppErrorReporter();
  final previousFlutterHandler = FlutterError.onError;

  FlutterError.onError = (details) {
    reporter.record(
      details.exception,
      details.stack ?? StackTrace.current,
      context: 'flutter',
    );
    if (previousFlutterHandler != null) {
      previousFlutterHandler(details);
    } else {
      FlutterError.presentError(details);
    }
  };

  PlatformDispatcher.instance.onError = (error, stackTrace) {
    reporter.record(error, stackTrace, context: 'platform');
    return false;
  };

  runReleaseAppV11();
}
