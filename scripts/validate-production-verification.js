const fs = require('fs');

const input = process.argv[2] || process.env.PRODUCTION_VERIFICATION_JSON;
if (!input) throw new Error('usage: node scripts/validate-production-verification.js <verification.json>');
const raw = fs.readFileSync(input, 'utf8').trim();
const evidence = JSON.parse(raw);

const failures = [];
function requireValue(group, key, expected) {
  const actual = evidence?.[group]?.[key];
  if (actual !== expected) failures.push({ group, key, expected, actual });
}

for (const [key, value] of Object.entries(evidence.rls || {})) {
  if (value !== true) failures.push({ group: 'rls', key, expected: true, actual: value });
}
const requiredRls = [
  'profiles','child_profiles','favorites','price_alerts','push_devices','price_alert_deliveries',
  'providers','provider_themes','products','product_sizes','offers','price_history','brand_size_guides',
  'commercial_partners','commercial_campaigns','commercial_campaign_products','commercial_events',
  'admin_users','managed_popups','catalog_overrides','brand_size_evidence','admin_audit_log'
];
for (const key of requiredRls) {
  if (!(key in (evidence.rls || {}))) failures.push({ group: 'rls', key, expected: true, actual: 'missing' });
}

const requiredRoutines = [
  'get_published_catalog','get_my_app_data','sync_my_app_data','set_my_favorite','set_my_price_alert',
  'set_my_child_profile','delete_my_app_data','delete_my_account','set_my_push_device','remove_my_push_device',
  'record_commercial_event','evaluate_price_alerts','claim_price_alert_deliveries','complete_price_alert_delivery'
];
for (const key of requiredRoutines) requireValue('routines', key, true);

const expectedGrants = {
  catalogAnonExecute: true,
  catalogAuthenticatedExecute: true,
  accountAnonExecute: false,
  accountAuthenticatedExecute: true,
  syncAnonExecute: false,
  syncAuthenticatedExecute: true,
  favoriteAnonExecute: false,
  favoriteAuthenticatedExecute: true,
  priceAlertAnonExecute: false,
  priceAlertAuthenticatedExecute: true,
  childProfileAnonExecute: false,
  childProfileAuthenticatedExecute: true,
  deleteAppDataAnonExecute: false,
  deleteAppDataAuthenticatedExecute: true,
  deleteAccountAnonExecute: false,
  deleteAccountAuthenticatedExecute: true,
  pushDeviceAnonExecute: false,
  pushDeviceAuthenticatedExecute: true,
  removePushAnonExecute: false,
  removePushAuthenticatedExecute: true,
  commercialAnonExecute: true,
  commercialAuthenticatedExecute: true,
  evaluateAnonExecute: false,
  evaluateAuthenticatedExecute: false,
  claimAnonExecute: false,
  claimAuthenticatedExecute: false,
  completeAnonExecute: false,
  completeAuthenticatedExecute: false,
};
for (const [key, expected] of Object.entries(expectedGrants)) requireValue('grants', key, expected);

const expectedViews = {
  publishedCatalogProductsAnonSelect: false,
  publishedCatalogOffersAnonSelect: false,
  productPriceSummaryAnonSelect: false,
  commercialPerformanceAnonSelect: false,
  publishedCampaignsAnonSelect: true,
  publishedPopupsAnonSelect: true,
};
for (const [key, expected] of Object.entries(expectedViews)) requireValue('views', key, expected);

const result = {
  status: failures.length ? 'FAIL' : 'PASS',
  generatedAt: evidence.generatedAt || null,
  failureCount: failures.length,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
