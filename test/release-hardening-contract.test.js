const fs = require('fs');

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`missing release hardening artifact: ${path}`);
  return fs.readFileSync(path, 'utf8');
}

const storeWorkflow = read('.github/workflows/store-candidate.yml');
for (const term of [
  'REQUIRE_PRODUCTION_CONFIG: "1"',
  'APP_ENV: production',
  '--dart-define=APP_ENV=$APP_ENV',
  '--dart-define=SUPABASE_URL=$SUPABASE_URL',
  '--dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY',
  'flutter build appbundle --release',
  'flutter build ios --release --no-codesign',
]) {
  if (!storeWorkflow.includes(term)) throw new Error(`store candidate contract missing: ${term}`);
}

const releaseApp = read('flutter/lib/release_app_v11.dart');
for (const term of [
  "String.fromEnvironment('APP_ENV', defaultValue: 'preview')",
  "_appEnvironment == 'production'",
  'Production candidate requires Supabase public configuration.',
  "import 'services/overlay_coordinator.dart';",
  'final _overlayCoordinator = OverlayCoordinator();',
  'coordinatedModal<ChildProfile>',
  'coordinatedModal<void>',
  'coordinatedModal<_EmailCredentials>',
  'overlayCoordinator: _overlayCoordinator',
]) {
  if (!releaseApp.includes(term)) throw new Error(`release app hardening missing: ${term}`);
}

const accountPage = read('flutter/lib/widgets/v10_account_page.dart');
for (const term of [
  "services/overlay_coordinator.dart",
  'final OverlayCoordinator? overlayCoordinator;',
  'coordinatedModal<T>',
  '_showAppSettings',
  '_showPrivacyAndData',
]) {
  if (!accountPage.includes(term)) throw new Error(`account overlay hardening missing: ${term}`);
}

const imageScript = read('scripts/catalog-image-health.js');
for (const term of [
  'AbortController',
  "content-type",
  "startsWith('image/')",
  'IMAGE_HEALTH_MIN_SUCCESS_RATE',
  'deterministicSample',
]) {
  if (!imageScript.includes(term)) throw new Error(`image health contract missing: ${term}`);
}

const imageWorkflow = read('.github/workflows/catalog-image-health.yml');
for (const term of [
  'pull_request:',
  'continue-on-error:',
  'cron: "35 * * * *"',
  'schedule:',
  'node scripts/catalog-image-health.js',
  'actions/upload-artifact@v4',
]) {
  if (!imageWorkflow.includes(term)) throw new Error(`image health workflow missing: ${term}`);
}

const providerSyncWorkflow = read('.github/workflows/sync-adpick-biz.yml');
for (const term of [
  'cron: "43 * * * *"',
  'Verify catalog image health after publish',
  'node scripts/catalog-image-health.js',
  'post-publish-catalog-image-health',
  'actions/upload-artifact@v4',
]) {
  if (!providerSyncWorkflow.includes(term)) throw new Error(`provider sync image health contract missing: ${term}`);
}

const main = read('flutter/lib/main.dart');
for (const term of [
  "services/app_error_reporter.dart",
  'NoopAppErrorReporter',
  'FlutterError.onError',
  'PlatformDispatcher.instance.onError',
]) {
  if (!main.includes(term)) throw new Error(`error reporter foundation missing: ${term}`);
}

console.log('release hardening contract PASS');
