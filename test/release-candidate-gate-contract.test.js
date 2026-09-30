const fs = require('fs');

const required = [
  'docs/release-candidate-gate-matrix.md',
  'docs/production-activation-checklist.md',
  'docs/physical-device-release-qa.md',
  'docs/store-submission-pack.md',
  'flutter/lib/widgets/v10_account_page.dart',
  'flutter/test/v10_account_page_test.dart',
];
for (const p of required) {
  if (!fs.existsSync(p)) throw new Error(`release candidate gate artifact missing: ${p}`);
}

const matrix = fs.readFileSync('docs/release-candidate-gate-matrix.md', 'utf8');
for (const term of [
  'Production Supabase',
  'provider production rights',
  'Official operator/legal identity',
  'protected signing credentials',
  'Product Owner final external-beta/store submission authorization',
  'Account mutation outbox is owner-scoped',
]) {
  if (!matrix.toLowerCase().includes(term.toLowerCase())) {
    throw new Error(`release candidate matrix missing explicit gate: ${term}`);
  }
}

const checklist = fs.readFileSync('docs/production-activation-checklist.md', 'utf8');
for (const term of [
  'Production Supabase',
  'Provider production rights',
  'Privacy/support/account-deletion pages finalized',
  'Product Owner final release/submission authorization',
]) {
  if (!checklist.includes(term)) throw new Error(`production checklist missing: ${term}`);
}

const physicalQa = fs.readFileSync('docs/physical-device-release-qa.md', 'utf8');
for (const term of [
  '320 px logical width',
  '430 px logical width',
  'iOS Safari',
  'Account switch',
  'Customer Support is visibly unavailable and non-tappable',
  'PHYSICAL_DEVICE_QA_PASS',
]) {
  if (!physicalQa.includes(term)) throw new Error(`physical-device QA checklist missing: ${term}`);
}

const storePack = fs.readFileSync('docs/store-submission-pack.md', 'utf8');
for (const placeholder of [
  'TBD final public support URL',
  'TBD final public privacy URL',
  'TBD Product Owner',
]) {
  if (!storePack.includes(placeholder)) {
    throw new Error(`store pack must not silently invent external gate: ${placeholder}`);
  }
}

const accountPage = fs.readFileSync('flutter/lib/widgets/v10_account_page.dart', 'utf8');
if (!accountPage.includes("title: Text('고객지원')")) {
  throw new Error('My page must expose the customer-support release state');
}
if (!accountPage.includes('enabled: false')) {
  throw new Error('customer support must remain disabled until an official channel exists');
}
if (!accountPage.includes('공식 운영 주체와 고객지원 채널 확정 후 제공됩니다.')) {
  throw new Error('customer support disabled state must explain the external gate');
}

const accountTests = fs.readFileSync('flutter/test/v10_account_page_test.dart', 'utf8');
if (!accountTests.includes('customer support remains visibly unavailable until official channel exists')) {
  throw new Error('customer-support availability gate must have widget regression coverage');
}

for (const page of ['privacy.html', 'support.html', 'account-deletion.html']) {
  const body = fs.readFileSync(page, 'utf8');
  if (!/release|draft|준비|초안/i.test(body)) {
    throw new Error(`${page} lost its non-final release marker`);
  }
}

console.log('release candidate gate contract PASS');
