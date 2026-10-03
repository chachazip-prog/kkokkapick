const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kkokkapick-prod-verify-'));
const good = {
  generatedAt: '2026-10-03T00:00:00Z',
  rls: Object.fromEntries([
    'profiles','child_profiles','favorites','price_alerts','push_devices','price_alert_deliveries','price_alert_delivery_targets',
    'providers','provider_themes','products','product_sizes','offers','price_history','brand_size_guides',
    'commercial_partners','commercial_campaigns','commercial_campaign_products','commercial_events',
    'admin_users','managed_popups','catalog_overrides','brand_size_evidence','admin_audit_log'
  ].map(k => [k,true])),
  routines: Object.fromEntries([
    'get_published_catalog','get_my_app_data','sync_my_app_data','set_my_favorite','set_my_price_alert',
    'set_my_child_profile','delete_my_app_data','delete_my_account','set_my_push_device','remove_my_push_device',
    'record_commercial_event','evaluate_price_alerts','claim_price_alert_deliveries','complete_price_alert_delivery',
    'claim_price_alert_delivery_targets','complete_price_alert_delivery_target'
  ].map(k => [k,true])),
  grants: {
    catalogAnonExecute:true,catalogAuthenticatedExecute:true,
    accountAnonExecute:false,accountAuthenticatedExecute:true,
    syncAnonExecute:false,syncAuthenticatedExecute:true,
    favoriteAnonExecute:false,favoriteAuthenticatedExecute:true,
    priceAlertAnonExecute:false,priceAlertAuthenticatedExecute:true,
    childProfileAnonExecute:false,childProfileAuthenticatedExecute:true,
    deleteAppDataAnonExecute:false,deleteAppDataAuthenticatedExecute:true,
    deleteAccountAnonExecute:false,deleteAccountAuthenticatedExecute:true,
    pushDeviceAnonExecute:false,pushDeviceAuthenticatedExecute:true,
    removePushAnonExecute:false,removePushAuthenticatedExecute:true,
    commercialAnonExecute:true,commercialAuthenticatedExecute:true,
    evaluateAnonExecute:false,evaluateAuthenticatedExecute:false,evaluateServiceRoleExecute:true,
    claimAnonExecute:false,claimAuthenticatedExecute:false,claimServiceRoleExecute:false,
    completeAnonExecute:false,completeAuthenticatedExecute:false,completeServiceRoleExecute:false,
    targetClaimAnonExecute:false,targetClaimAuthenticatedExecute:false,targetClaimServiceRoleExecute:true,
    targetCompleteAnonExecute:false,targetCompleteAuthenticatedExecute:false,targetCompleteServiceRoleExecute:true
  },
  views: {
    publishedCatalogProductsAnonSelect:false,
    publishedCatalogOffersAnonSelect:false,
    productPriceSummaryAnonSelect:false,
    commercialPerformanceAnonSelect:false,
    publishedCampaignsAnonSelect:true,
    publishedPopupsAnonSelect:true
  }
};
const goodPath = path.join(dir,'good.json');
fs.writeFileSync(goodPath, JSON.stringify(good));
execFileSync(process.execPath,['scripts/validate-production-verification.js',goodPath],{stdio:'pipe'});

const bad = JSON.parse(JSON.stringify(good));
bad.grants.deleteAccountAnonExecute = true;
const badPath = path.join(dir,'bad.json');
fs.writeFileSync(badPath, JSON.stringify(bad));
const r = spawnSync(process.execPath,['scripts/validate-production-verification.js',badPath],{encoding:'utf8'});
if (r.status === 0) throw new Error('validator must reject unsafe anonymous account deletion grant');
if (!r.stdout.includes('deleteAccountAnonExecute')) throw new Error('validator failure must identify drift');
console.log('production verification validator PASS');
