const fs = require('fs');
const path = require('path');

const exists = p => fs.existsSync(p);
const read = p => fs.readFileSync(p, 'utf8');
const migrations = fs.readdirSync('supabase/migrations')
  .filter(name => /^\d{3}_.+\.sql$/.test(name))
  .sort();
const latestMigration = migrations.at(-1) || null;

const verificationSql = read('supabase/production-verification.sql');
const auth = read('flutter/lib/services/authentication.dart');
const socialAuth = read('flutter/lib/services/social_auth.dart');
const socialGateway = read('flutter/lib/services/supabase_authentication_gateway.dart');
const androidManifest = read('flutter/android/app/src/main/AndroidManifest.xml');
const storeWorkflow = read('.github/workflows/store-candidate.yml');
const androidGradle = read('flutter/android/app/build.gradle.kts');
const iosWorkflow = read('.github/workflows/ios-release-foundation.yml');
const pushContract = read('docs/push-worker-contract.md');
const storePack = read('docs/store-submission-pack.md');
const ops = read('docs/release-operations-runbook.md');
const reporter = read('flutter/lib/services/app_error_reporter.dart');
const physicalQa = read('docs/physical-device-release-qa.md');

const repoChecks = {
  productionVerificationPack:
    /begin read only/i.test(verificationSql) &&
    /rollback;/i.test(verificationSql) &&
    exists('docs/production-verification-evidence.md') &&
    exists('scripts/production-migration-manifest.js') &&
    exists('scripts/validate-production-verification.js') &&
    exists('scripts/production-email-auth-smoke.js') &&
    exists('.github/workflows/production-supabase-activation.yml') &&
    exists('docs/production-supabase-operator-runbook.md') &&
    latestMigration?.startsWith('031_'),
  productionConfigBoundary:
    storeWorkflow.includes('APP_ENV: production') &&
    storeWorkflow.includes('PRODUCTION_SUPABASE_URL') &&
    storeWorkflow.includes('PRODUCTION_SUPABASE_ANON_KEY') &&
    exists('scripts/guard-production-config.sh'),
  authTruthfulness:
    auth.includes('static const targetMethods') &&
    auth.includes('static const supportedMethods=<AuthMethod>{AuthMethod.emailPassword}') &&
    auth.includes('Social authentication is not enabled in this release.') &&
    socialAuth.includes("const socialAuthCallbackUri = 'kkokkapick://auth/callback'") &&
    socialGateway.includes("code_challenge_method") &&
    socialGateway.includes("'s256'") &&
    socialGateway.includes("token?grant_type=pkce") &&
    androidManifest.includes('android:scheme="kkokkapick"') &&
    iosWorkflow.includes('CFBundleURLSchemes') &&
    iosWorkflow.includes('string kkokkapick'),
  pushWorkerBoundary:
    pushContract.includes('never log raw tokens') &&
    pushContract.includes('Invalid-token cleanup') &&
    pushContract.includes('FCM HTTP v1') &&
    pushContract.includes('APNs HTTP/2') &&
    exists('supabase/migrations/031_push_delivery_target_fanout.sql') &&
    exists('src/fcm-sender.js') &&
    exists('src/apns-sender.js') &&
    exists('src/price-alert-push-worker.js') &&
    exists('.github/workflows/production-push-verification.yml') &&
    exists('.github/workflows/price-alert-push-worker.yml'),
  appIdentifiers:
    androidGradle.includes('applicationId = "com.kkokkapick.app"') &&
    iosWorkflow.includes('PRODUCT_BUNDLE_IDENTIFIER = com.kkokkapick.app;'),
  signingBoundary:
    androidGradle.includes('Release signing is injected only by protected CI/store credentials') &&
    storeWorkflow.includes('flutter build ios --release --no-codesign'),
  legalPlaceholders:
    storePack.includes('TBD Product Owner') &&
    storePack.includes('TBD final public support URL') &&
    storePack.includes('TBD final public privacy URL'),
  operationsRunbook:
    ops.includes('backup/restore') &&
    ops.includes('Rollback') &&
    ops.includes('Incident minimum record'),
  telemetryBoundary:
    reporter.includes('abstract interface class AppErrorReporter') &&
    reporter.includes('NoopAppErrorReporter') &&
    reporter.includes('sanitizeDiagnosticText'),
  physicalQaBoundary:
    physicalQa.includes('PREPARED_NOT_EXECUTED') &&
    physicalQa.includes('320 px logical width') &&
    physicalQa.includes('iOS Safari') &&
    physicalQa.includes('Android installed build'),
};

const gates = [
  {
    id: 'production_supabase',
    repository: repoChecks.productionVerificationPack && repoChecks.productionConfigBoundary ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Production Supabase project, public URL/anon key, applied migrations, read-only RLS/RPC verification evidence and deletion E2E.',
  },
  {
    id: 'social_auth',
    repository: repoChecks.authTruthfulness ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Provider apps/credentials, Supabase provider enablement + redirect allow-list and real-device provider E2E. PKCE/deep-link client transport is repository-ready; Email/password is the only enabled method today.',
  },
  {
    id: 'push_delivery',
    repository: repoChecks.pushWorkerBoundary ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'FCM/APNs credentials, native token acquisition, real-device delivery, invalid-token cleanup and retry/dead-letter evidence. Provider senders and per-device worker ledger are repository-ready.',
  },
  {
    id: 'provider_rights',
    repository: 'REPOSITORY_READY',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Written production retention/redisplay/image/attribution authorization.',
  },
  {
    id: 'app_registration_and_signing',
    repository: repoChecks.appIdentifiers && repoChecks.signingBoundary ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Apple/Google identifier registrations, protected signing credentials and signed artifact checksums.',
  },
  {
    id: 'legal_support_privacy',
    repository: repoChecks.legalPlaceholders ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Final business/controller identity, contact/support channel, approved privacy/deletion URLs, retention/processors.',
  },
  {
    id: 'backup_restore_rollback',
    repository: repoChecks.operationsRunbook ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Production-like backup identifier, restore validation and rollback/forward-fix rehearsal record.',
  },
  {
    id: 'crash_monitoring',
    repository: repoChecks.telemetryBoundary ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Selected production crash backend, sanitized delivery verification, alert route and incident owner.',
  },
  {
    id: 'physical_device_qa',
    repository: repoChecks.physicalQaBoundary ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'BLOCKED_EXTERNAL',
    requires: 'Actual iOS/Android device evidence, iOS Safari, 100/200% text, VoiceOver/TalkBack and approved-reference comparison.',
  },
  {
    id: 'final_submission',
    repository: Object.values(repoChecks).every(Boolean) ? 'REPOSITORY_READY' : 'REPOSITORY_GAP',
    external: 'HOLD_PRODUCT_OWNER',
    requires: 'Frozen signed release SHA plus explicit Product Owner authorization after all applicable external gates are complete.',
  },
];

const output = {
  generatedAt: new Date().toISOString(),
  status: Object.values(repoChecks).every(Boolean) ? 'REPOSITORY_READY_EXTERNAL_BLOCKED' : 'REPOSITORY_GAPS_PRESENT',
  latestMigration,
  migrationCount: migrations.length,
  repoChecks,
  gates,
};

const reportPath = process.env.EXTERNAL_BETA_READINESS_REPORT || 'artifacts/external-beta-readiness.json';
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
if (!Object.values(repoChecks).every(Boolean)) process.exitCode = 1;
