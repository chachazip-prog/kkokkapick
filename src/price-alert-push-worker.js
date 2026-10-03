import {
  PushConfigurationError,
  PushOutcome,
  retryableResult,
  terminalResult,
} from './push-provider-result.js';

export function buildPriceAlertNotification() {
  return {
    title: '가격이 내려갔어요',
    body: '찜한 상품의 새 가격을 꼬까픽에서 확인해보세요.',
  };
}

function normalizeTarget(row) {
  return {
    targetId: row.target_id ?? row.targetId,
    deliveryId: row.delivery_id ?? row.deliveryId,
    productId: row.product_id ?? row.productId,
    observedPrice: row.observed_price ?? row.observedPrice,
    platform: row.platform,
    token: row.token,
    attemptCount: row.attempt_count ?? row.attemptCount ?? 0,
  };
}

function safeTransportFailure(error) {
  if (error instanceof PushConfigurationError) {
    return terminalResult(error.code || 'provider_configuration_error');
  }
  return retryableResult('provider_transport_error');
}

export async function runPriceAlertPushBatch({
  backend,
  senders,
  platform = null,
  evaluateLimit = 500,
  claimLimit = 100,
  staleAfter = '15 minutes',
  maxAttempts = 5,
} = {}) {
  if (!backend) throw new PushConfigurationError('push_backend_missing');
  if (!senders || typeof senders !== 'object') {
    throw new PushConfigurationError('push_senders_missing');
  }
  if (platform && !senders[platform]) {
    throw new PushConfigurationError(`push_sender_${platform}_missing`);
  }

  const evaluated = await backend.evaluate(evaluateLimit);
  const rows = await backend.claim({
    limit: claimLimit,
    staleAfter,
    maxAttempts,
    platform,
  });

  const summary = {
    evaluated,
    claimed: rows.length,
    sent: 0,
    retryable: 0,
    invalidToken: 0,
    failed: 0,
  };

  for (const row of rows) {
    const target = normalizeTarget(row);
    const sender = senders[target.platform];
    let result;

    if (!sender) {
      result = terminalResult('provider_not_configured');
    } else {
      try {
        result = await sender.send(
          target,
          buildPriceAlertNotification(target),
        );
      } catch (error) {
        result = safeTransportFailure(error);
      }
    }

    const success = result.outcome === PushOutcome.success;
    const retryable = result.outcome === PushOutcome.retryable;
    const invalidToken = result.outcome === PushOutcome.invalidToken;

    await backend.complete({
      targetId: target.targetId,
      success,
      retryable,
      invalidToken,
      errorCode: success ? null : result.code,
      maxAttempts,
    });

    if (success) summary.sent++;
    else if (retryable) summary.retryable++;
    else if (invalidToken) summary.invalidToken++;
    else summary.failed++;
  }

  return summary;
}
