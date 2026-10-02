import { PushConfigurationError } from './push-provider-result.js';

function required(value, code) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new PushConfigurationError(code);
  return normalized;
}

export class SupabasePushWorkerBackend {
  constructor({
    baseUrl,
    serviceRoleKey,
    fetchImpl = fetch,
  }) {
    this.baseUrl = required(baseUrl, 'push_supabase_url_missing').replace(/\/+$/, '');
    this.serviceRoleKey = required(serviceRoleKey, 'push_service_role_missing');
    this.fetchImpl = fetchImpl;
  }

  async rpc(name, body) {
    const response = await this.fetchImpl(
      `${this.baseUrl}/rest/v1/rpc/${name}`,
      {
        method: 'POST',
        headers: {
          apikey: this.serviceRoleKey,
          authorization: `Bearer ${this.serviceRoleKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body || {}),
      },
    );
    let payload = null;
    if (response.status !== 204) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }
    if (!response.ok) {
      throw new Error(`push_backend_${name}_http_${response.status}`);
    }
    return payload;
  }

  async evaluate(limit = 500) {
    const rows = await this.rpc('evaluate_price_alerts', { p_limit: limit });
    return Array.isArray(rows) ? rows.length : 0;
  }

  async claim({
    limit = 100,
    staleAfter = '15 minutes',
    maxAttempts = 5,
    platform = null,
  } = {}) {
    const rows = await this.rpc('claim_price_alert_delivery_targets', {
      p_limit: limit,
      p_stale_after: staleAfter,
      p_max_attempts: maxAttempts,
      p_platform: platform,
    });
    return Array.isArray(rows) ? rows : [];
  }

  async complete({
    targetId,
    success,
    retryable = false,
    invalidToken = false,
    errorCode = null,
    maxAttempts = 5,
  }) {
    await this.rpc('complete_price_alert_delivery_target', {
      p_target_id: targetId,
      p_success: Boolean(success),
      p_retryable: Boolean(retryable),
      p_invalid_token: Boolean(invalidToken),
      p_error_code: errorCode,
      p_max_attempts: maxAttempts,
    });
  }
}
