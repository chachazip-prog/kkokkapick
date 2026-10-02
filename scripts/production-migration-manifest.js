const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = 'supabase/migrations';
const names = fs.readdirSync(dir)
  .filter(name => /^\d{3}_.+\.sql$/.test(name))
  .sort();

const entries = names.map((name, index) => {
  const expected = String(index + 1).padStart(3, '0');
  const prefix = name.slice(0, 3);
  if (prefix !== expected) {
    throw new Error(`migration sequence gap: expected ${expected}, got ${prefix}`);
  }
  const body = fs.readFileSync(path.join(dir, name));
  return {
    sequence: Number(prefix),
    file: name,
    sha256: crypto.createHash('sha256').update(body).digest('hex'),
  };
});

if (entries.length === 0) throw new Error('no migrations found');

const output = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  first: entries[0].file,
  latest: entries.at(-1).file,
  entries,
};

const out = process.env.PRODUCTION_MIGRATION_MANIFEST || 'artifacts/production-migration-manifest.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
