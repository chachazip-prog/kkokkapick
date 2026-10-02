export const PushOutcome = Object.freeze({
  success: 'success',
  retryable: 'retryable',
  invalidToken: 'invalid_token',
  terminal: 'terminal',
});

function boundedCode(value, fallback) {
  const raw = String(value || fallback || 'provider_error')
    .trim()
    .replace(/[^A-Za-z0-9_.:-]+/g, '_');
  return raw.slice(0, 120) || 'provider_error';
}

export function successResult(code = 'ok') {
  return { outcome: PushOutcome.success, code: boundedCode(code, 'ok') };
}

export function retryableResult(code) {
  return { outcome: PushOutcome.retryable, code: boundedCode(code, 'retryable') };
}

export function invalidTokenResult(code) {
  return { outcome: PushOutcome.invalidToken, code: boundedCode(code, 'invalid_token') };
}

export function terminalResult(code) {
  return { outcome: PushOutcome.terminal, code: boundedCode(code, 'terminal') };
}

function fcmErrorCode(body) {
  if (!body || typeof body !== 'object') return null;
  const direct = body?.error?.status;
  if (typeof direct === 'string' && direct) return direct;
  const details = Array.isArray(body?.error?.details) ? body.error.details : [];
  for (const detail of details) {
    const code = detail?.errorCode;
    if (typeof code === 'string' && code) return code;
  }
  return null;
}

export function classifyFcmResponse(status, body = null) {
  if (status >= 200 && status < 300) return successResult('fcm_ok');
  const code = fcmErrorCode(body);

  // UNREGISTERED is the unambiguous HTTP v1 signal for an expired/invalid
  // registration token. INVALID_ARGUMENT is intentionally not treated as an
  // invalid token because it can also describe a malformed message payload.
  if (code === 'UNREGISTERED') return invalidTokenResult('fcm_unregistered');

  if (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    code === 'QUOTA_EXCEEDED' ||
    code === 'UNAVAILABLE' ||
    code === 'INTERNAL'
  ) {
    return retryableResult(`fcm_${String(code || status).toLowerCase()}`);
  }

  if (status === 401 || status === 403) {
    return terminalResult(`fcm_auth_${String(code || status).toLowerCase()}`);
  }
  if (code === 'INVALID_ARGUMENT') {
    return terminalResult('fcm_invalid_argument');
  }
  return terminalResult(`fcm_${String(code || status || 'error').toLowerCase()}`);
}

export function classifyApnsResponse(status, reason = null) {
  if (status >= 200 && status < 300) return successResult('apns_ok');

  if (status === 410 || reason === 'Unregistered' || reason === 'BadDeviceToken') {
    return invalidTokenResult(`apns_${String(reason || status).toLowerCase()}`);
  }

  if (status === 429 || status === 500 || status === 503) {
    return retryableResult(`apns_${String(reason || status).toLowerCase()}`);
  }

  if (status === 403 || status === 401) {
    return terminalResult(`apns_auth_${String(reason || status).toLowerCase()}`);
  }

  return terminalResult(`apns_${String(reason || status || 'error').toLowerCase()}`);
}

export class PushConfigurationError extends Error {
  constructor(code) {
    super(code);
    this.name = 'PushConfigurationError';
    this.code = boundedCode(code, 'push_configuration_error');
  }
}
