import crypto from 'node:crypto';
import http2 from 'node:http2';

import {
  PushConfigurationError,
  classifyApnsResponse,
} from './push-provider-result.js';

function required(value, code) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new PushConfigurationError(code);
  return normalized;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function createApnsProviderToken(
  { keyId, teamId, privateKey },
  now = new Date(),
) {
  const header = base64UrlJson({ alg: 'ES256', kid: keyId });
  const payload = base64UrlJson({
    iss: teamId,
    iat: Math.floor(now.getTime() / 1000),
  });
  const input = `${header}.${payload}`;
  const signature = crypto.sign(
    null,
    Buffer.from(input),
    {
      key: privateKey,
      dsaEncoding: 'ieee-p1363',
    },
  ).toString('base64url');
  return `${input}.${signature}`;
}

export async function defaultApnsTransport({
  origin,
  path,
  headers,
  payload,
}) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(origin);
    let settled = false;
    let status = 0;
    const chunks = [];

    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      try { client.close(); } catch {}
      if (error) reject(error);
      else resolve(result);
    };

    client.once('error', (error) => finish(error));
    const request = client.request({
      ':method': 'POST',
      ':path': path,
      ...headers,
    });
    request.setEncoding('utf8');
    request.on('response', (responseHeaders) => {
      status = Number(responseHeaders[':status'] || 0);
    });
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => finish(null, {
      status,
      body: chunks.join(''),
    }));
    request.on('error', (error) => finish(error));
    request.end(JSON.stringify(payload));
  });
}

export class ApnsSender {
  constructor({
    keyId,
    teamId,
    bundleId,
    privateKey,
    environment = 'production',
    transport = defaultApnsTransport,
    now = () => new Date(),
  }) {
    this.keyId = required(keyId, 'apns_key_id_missing');
    this.teamId = required(teamId, 'apns_team_id_missing');
    this.bundleId = required(bundleId, 'apns_bundle_id_missing');
    this.privateKey = required(privateKey, 'apns_private_key_missing').replace(/\\n/g, '\n');
    if (!['production', 'sandbox'].includes(environment)) {
      throw new PushConfigurationError('apns_environment_invalid');
    }
    this.environment = environment;
    this.transport = transport;
    this.now = now;
    this.cachedToken = null;
  }

  providerToken() {
    const nowMs = this.now().getTime();
    // Apple provider tokens are valid for at most one hour. Reuse a token
    // for 50 minutes to avoid rotating too frequently on the same connection.
    if (this.cachedToken && nowMs - this.cachedToken.createdAtMs < 50 * 60 * 1000) {
      return this.cachedToken.value;
    }
    const value = createApnsProviderToken({
      keyId: this.keyId,
      teamId: this.teamId,
      privateKey: this.privateKey,
    }, this.now());
    this.cachedToken = { value, createdAtMs: nowMs };
    return value;
  }

  async send(target, notification) {
    const origin = this.environment === 'production'
      ? 'https://api.push.apple.com'
      : 'https://api.sandbox.push.apple.com';
    const response = await this.transport({
      origin,
      path: `/3/device/${encodeURIComponent(target.token)}`,
      headers: {
        authorization: `bearer ${this.providerToken()}`,
        'apns-topic': this.bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'apns-collapse-id': String(target.deliveryId).slice(0, 64),
        'content-type': 'application/json',
      },
      payload: {
        aps: {
          alert: {
            title: notification.title,
            body: notification.body,
          },
          sound: 'default',
        },
        kkokkapick: {
          deliveryId: String(target.deliveryId),
          productId: String(target.productId),
          observedPrice: Number(target.observedPrice),
        },
      },
    });

    let reason = null;
    if (response.body) {
      try {
        reason = JSON.parse(response.body)?.reason || null;
      } catch {
        reason = null;
      }
    }
    return classifyApnsResponse(response.status, reason);
  }
}
