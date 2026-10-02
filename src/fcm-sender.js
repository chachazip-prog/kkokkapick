import crypto from 'node:crypto';

import {
  PushConfigurationError,
  classifyFcmResponse,
} from './push-provider-result.js';

const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function required(value, code) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new PushConfigurationError(code);
  return normalized;
}

export function parseFcmServiceAccount(raw) {
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw new PushConfigurationError('fcm_service_account_invalid_json');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new PushConfigurationError('fcm_service_account_invalid');
  }
  return {
    projectId: required(parsed.project_id, 'fcm_project_id_missing'),
    clientEmail: required(parsed.client_email, 'fcm_client_email_missing'),
    privateKey: required(parsed.private_key, 'fcm_private_key_missing').replace(/\\n/g, '\n'),
    tokenUri: String(parsed.token_uri || DEFAULT_TOKEN_URI).trim() || DEFAULT_TOKEN_URI,
  };
}

export function createGoogleServiceAccountAssertion(
  serviceAccount,
  now = new Date(),
) {
  const iat = Math.floor(now.getTime() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: serviceAccount.clientEmail,
    scope: FCM_SCOPE,
    aud: serviceAccount.tokenUri,
    iat,
    exp: iat + 3600,
  }));
  const signingInput = `${header}.${payload}`;
  const signature = crypto.sign(
    'RSA-SHA256',
    Buffer.from(signingInput),
    serviceAccount.privateKey,
  ).toString('base64url');
  return `${signingInput}.${signature}`;
}

export class FcmSender {
  constructor({
    serviceAccount,
    fetchImpl = fetch,
    now = () => new Date(),
  }) {
    this.serviceAccount = parseFcmServiceAccount(serviceAccount);
    this.fetchImpl = fetchImpl;
    this.now = now;
    this.cachedAccessToken = null;
  }

  async accessToken() {
    const nowMs = this.now().getTime();
    if (
      this.cachedAccessToken &&
      this.cachedAccessToken.expiresAtMs - 60_000 > nowMs
    ) {
      return this.cachedAccessToken.value;
    }

    const assertion = createGoogleServiceAccountAssertion(
      this.serviceAccount,
      this.now(),
    );
    const response = await this.fetchImpl(this.serviceAccount.tokenUri, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok || !body?.access_token) {
      throw new PushConfigurationError(`fcm_oauth_${response.status || 'failed'}`);
    }
    const expiresIn = Number(body.expires_in);
    this.cachedAccessToken = {
      value: body.access_token,
      expiresAtMs: nowMs + (Number.isFinite(expiresIn) ? expiresIn : 3600) * 1000,
    };
    return body.access_token;
  }

  async send(target, notification) {
    const accessToken = await this.accessToken();
    const response = await this.fetchImpl(
      `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(this.serviceAccount.projectId)}/messages:send`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: target.token,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: {
              // Keep notification transport account-agnostic. Product identity
              // and observed price are resolved only after the current app
              // session opens and fetches its own authorized account state.
              deliveryId: String(target.deliveryId),
            },
          },
        }),
      },
    );

    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return classifyFcmResponse(response.status, body);
  }
}
