async function jsonResponse(response, label) {
  if (!response.ok) throw new Error(`${label}_http_${response.status}`);
  let body;
  try { body = await response.json(); } catch { throw new Error(`${label}_invalid_json`); }
  return body;
}

function required(env, name) {
  const value = String(env[name] || '').trim();
  if (!value) throw new Error(`missing_${name}`);
  return value;
}

async function runProductionEmailAuthSmoke({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const baseUrl = required(env, 'PRODUCTION_SUPABASE_URL').replace(/\/+$/,'');
  const anonKey = required(env, 'PRODUCTION_SUPABASE_ANON_KEY');
  const email = required(env, 'PRODUCTION_TEST_EMAIL');
  const password = required(env, 'PRODUCTION_TEST_PASSWORD');

  const authHeaders = {
    apikey: anonKey,
    'Content-Type': 'application/json',
  };

  const signIn = await jsonResponse(await fetchImpl(
    `${baseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email, password }),
    },
  ), 'signin');

  const accessToken = signIn?.access_token;
  const refreshToken = signIn?.refresh_token;
  const userId = signIn?.user?.id;
  if (!accessToken || !refreshToken || !userId) throw new Error('signin_missing_session');

  const refresh = await jsonResponse(await fetchImpl(
    `${baseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  ), 'refresh');
  const refreshedAccess = refresh?.access_token;
  if (!refreshedAccess) throw new Error('refresh_missing_access_token');

  const account = await jsonResponse(await fetchImpl(
    `${baseUrl}/rest/v1/rpc/get_my_app_data`,
    {
      method: 'POST',
      headers: {
        ...authHeaders,
        Authorization: `Bearer ${refreshedAccess}`,
      },
      body: '{}',
    },
  ), 'account');
  if (account == null || typeof account !== 'object') throw new Error('account_invalid_payload');

  const catalog = await jsonResponse(await fetchImpl(
    `${baseUrl}/rest/v1/rpc/get_published_catalog`,
    {
      method: 'POST',
      headers: {
        ...authHeaders,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ p_limit: 1, p_offset: 0 }),
    },
  ), 'catalog');
  const products = catalog?.products;
  if (!Array.isArray(products)) throw new Error('catalog_invalid_payload');

  return {
    status: 'PASS',
    authenticatedUserPresent: true,
    refreshSucceeded: true,
    accountRpcSucceeded: true,
    catalogRpcSucceeded: true,
    catalogSampleCount: products.length,
  };
}

if (require.main === module) {
  runProductionEmailAuthSmoke()
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => {
      console.error(JSON.stringify({ status: 'FAIL', code: String(error?.message || error) }));
      process.exitCode = 1;
    });
}

module.exports = { runProductionEmailAuthSmoke };
