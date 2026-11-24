// One-off: copy a local SQLite store (and its data/uploads photos) into the empty Turso database and Blob store.
// Usage: node --env-file=.env.local scripts/import-to-turso.mjs <snapshot.db> <uploads-dir>
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import fs from 'node:fs';
import path from 'node:path';

const [src, uploads] = process.argv.slice(2);
if (!src || !uploads) throw new Error('usage: import-to-turso.mjs <snapshot.db> <uploads-dir>');
if (!process.env.TURSO_DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN) throw new Error('TURSO_DATABASE_URL and BLOB_READ_WRITE_TOKEN must be set');

const local = createClient({ url: `file:${src}` });
const remote = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const objects = (await local.execute("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type = 'index'")).rows;
const tables = objects.filter((o) => o.type === 'table').map((o) => String(o.name));

// Never write over existing data: stop if any of these tables already has rows in Turso.
const existing = new Set((await remote.execute("SELECT name FROM sqlite_master WHERE type = 'table'")).rows.map((r) => String(r.name)));
for (const t of tables) {
  if (existing.has(t) && Number((await remote.execute(`SELECT COUNT(*) n FROM "${t}"`)).rows[0].n) > 0)
    throw new Error(`Turso table ${t} already has rows; aborting without changes.`);
}

// 1. Photos to Blob, keeping their file names.
const urls = new Map();
for (const f of fs.readdirSync(uploads)) {
  const blob = await put(`uploads/${f}`, fs.readFileSync(path.join(uploads, f)), { access: 'public', addRandomSuffix: false, allowOverwrite: true });
  urls.set(`/uploads/${f}`, blob.url);
}
console.log(`uploaded ${urls.size} photos`);
const fix = (v) => (typeof v === 'string' && v.includes('/uploads/') ? v.replace(/\/uploads\/[\w.-]+/g, (m) => urls.get(m) ?? m) : v);

// 2. Schema, then rows in batches.
await remote.batch(objects.map((o) => String(o.sql).replace(/^CREATE (TABLE|INDEX) /, 'CREATE $1 IF NOT EXISTS ')), 'write');
for (const t of tables) {
  const rs = await local.execute(`SELECT * FROM "${t}"`);
  const cols = rs.columns.map((c) => `"${c}"`).join(',');
  const qs = rs.columns.map(() => '?').join(',');
  const stmts = rs.rows.map((r) => ({ sql: `INSERT INTO "${t}" (${cols}) VALUES (${qs})`, args: rs.columns.map((_, i) => fix(r[i])) }));
  for (let i = 0; i < stmts.length; i += 200) await remote.batch(stmts.slice(i, i + 200), 'write');
  console.log(`${t}: ${stmts.length} rows`);
}
const left = (await remote.execute("SELECT COUNT(*) n FROM products WHERE img LIKE '/uploads/%'")).rows[0].n;
console.log(`products still pointing at /uploads: ${left}`);
