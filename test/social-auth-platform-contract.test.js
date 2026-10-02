const fs=require('fs');

const callback='kkokkapick://auth/callback';
const social=fs.readFileSync('flutter/lib/services/social_auth.dart','utf8');
const gateway=fs.readFileSync('flutter/lib/services/supabase_authentication_gateway.dart','utf8');
const shell=fs.readFileSync('flutter/lib/release_app_v11.dart','utf8');
const manifest=fs.readFileSync('flutter/android/app/src/main/AndroidManifest.xml','utf8');
const ios=fs.readFileSync('.github/workflows/ios-release-foundation.yml','utf8');
const auth=fs.readFileSync('flutter/lib/services/authentication.dart','utf8');
const pub=fs.readFileSync('flutter/pubspec.yaml','utf8');

if(!social.includes("const socialAuthCallbackUri = 'kkokkapick://auth/callback'")) {
  throw new Error('social OAuth callback constant missing');
}

for(const term of [
  "code_challenge_method",
  "'s256'",
  "token?grant_type=pkce",
  "'auth_code': parsed.code",
  "'code_verifier': pending.codeVerifier",
]) if(!gateway.includes(term)) throw new Error('Supabase PKCE authorize/exchange missing: '+term);

if(!manifest.includes('android:scheme="kkokkapick"')||
   !manifest.includes('android:host="auth"')||
   !manifest.includes('android:path="/callback"')||
   !manifest.includes('android.intent.category.BROWSABLE')) {
  throw new Error('Android social callback intent filter incomplete');
}

for(const term of [
  'CFBundleURLTypes',
  'CFBundleURLSchemes',
  'string kkokkapick',
]) if(!ios.includes(term)) throw new Error('iOS social callback scheme missing: '+term);

for(const term of [
  'SecurePendingSocialAuthStore()',
  'SocialAuthCallbackRouter(',
  'AppLinksSocialAuthLinkSource()',
]) if(!shell.includes(term)) throw new Error('release shell callback wiring missing: '+term);

if(!auth.includes('static const supportedMethods=<AuthMethod>{AuthMethod.emailPassword}')) {
  throw new Error('social auth must remain disabled in current release UI');
}

for(const dep of ['app_links: 6.4.1','crypto: ^3.0.7']) {
  if(!pub.includes(dep)) throw new Error('social OAuth dependency missing: '+dep);
}

console.log('social auth platform contract PASS:',callback);
