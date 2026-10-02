import { ApnsSender } from '../src/apns-sender.js';
import { FcmSender } from '../src/fcm-sender.js';
import { runPriceAlertPushBatch } from '../src/price-alert-push-worker.js';
import { PushConfigurationError } from '../src/push-provider-result.js';
import { SupabasePushWorkerBackend } from '../src/supabase-push-worker-backend.js';

function present(value) {
  return String(value || '').trim().length > 0;
}

function buildSenders(env) {
  const senders = {};

  if (present(env.FCM_SERVICE_ACCOUNT_JSON)) {
    senders.android = new FcmSender({
      serviceAccount: env.FCM_SERVICE_ACCOUNT_JSON,
    });
  }

  const apnsFields = [
    env.APNS_KEY_ID,
    env.APNS_TEAM_ID,
    env.APNS_BUNDLE_ID,
    env.APNS_PRIVATE_KEY_P8,
  ];
  if (apnsFields.some(present) && !apnsFields.every(present)) {
    throw new PushConfigurationError('apns_credentials_incomplete');
  }
  if (apnsFields.every(present)) {
    senders.ios = new ApnsSender({
      keyId: env.APNS_KEY_ID,
      teamId: env.APNS_TEAM_ID,
      bundleId: env.APNS_BUNDLE_ID,
      privateKey: env.APNS_PRIVATE_KEY_P8,
      environment: env.APNS_ENVIRONMENT || 'production',
    });
  }

  return senders;
}

export async function runFromEnvironment(env = process.env) {
  if (env.PUSH_WORKER_EXECUTE !== '1') {
    throw new PushConfigurationError('push_worker_execute_confirmation_required');
  }

  const senders = buildSenders(env);
  const platforms = Object.keys(senders);
  if (!platforms.length) throw new PushConfigurationError('push_provider_credentials_missing');

  let platform = String(env.PUSH_WORKER_PLATFORM || '').trim().toLowerCase() || null;
  if (platform && !['ios', 'android'].includes(platform)) {
    throw new PushConfigurationError('push_worker_platform_invalid');
  }
  if (!platform && platforms.length === 1) platform = platforms[0];
  if (platform && !senders[platform]) {
    throw new PushConfigurationError(`push_sender_${platform}_missing`);
  }

  const backend = new SupabasePushWorkerBackend({
    baseUrl: env.PRODUCTION_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  });

  return runPriceAlertPushBatch({
    backend,
    senders,
    platform,
    evaluateLimit: Number(env.PUSH_EVALUATE_LIMIT || 500),
    claimLimit: Number(env.PUSH_CLAIM_LIMIT || 50),
    staleAfter: env.PUSH_STALE_AFTER || '15 minutes',
    maxAttempts: Number(env.PUSH_MAX_ATTEMPTS || 5),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFromEnvironment()
    .then((summary) => {
      // Summary contains aggregate counts only. Never print device tokens,
      // provider credentials, customer IDs or provider response bodies.
      console.log(JSON.stringify({ status: 'PASS', ...summary }, null, 2));
    })
    .catch((error) => {
      const code = error instanceof PushConfigurationError
        ? error.code
        : 'push_worker_failed';
      console.error(JSON.stringify({ status: 'FAIL', code }));
      process.exitCode = 1;
    });
}
