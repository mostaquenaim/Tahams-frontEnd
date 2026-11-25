#!/usr/bin/env node
// Checks the admin panel's access rules (utils/adminAccess.js):
//
//   1. every page under pages/admin has a PAGE_RULES entry, and no rule
//      points at a page that no longer exists
//   2. every sidebar link (components/Drawers/Config/NavConfig.tsx) has a rule
//   3. with --backend <path to Tahams-backend> (or TAHAMS_BACKEND): the
//      permission keys here match the backend's catalog
//      (src/Rbac/permissions.ts) exactly, and every one has a label
//
//   npm run check:admin-access -- --backend ../../Tahams-backend
//
// Exits non-zero on any problem. The backend enforces access on its own;
// this only keeps the UI's idea of it from drifting.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const backendArg = args.includes('--backend')
  ? args[args.indexOf('--backend') + 1]
  : process.env.TAHAMS_BACKEND;

const problems = [];
const problem = (msg) => problems.push(msg);

// utils/adminAccess.js uses ES module syntax in a .js file; load a copy as .mjs
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-access-'));
const copy = path.join(tmp, 'adminAccess.mjs');
fs.copyFileSync(path.join(root, 'utils', 'adminAccess.js'), copy);
const access = await import(pathToFileURL(copy).href);
fs.rmSync(tmp, { recursive: true, force: true });

// 1. pages <-> rules
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
const pagesDir = path.join(root, 'pages');
const adminRoutes = walk(path.join(pagesDir, 'admin'))
  .filter((f) => /\.(js|jsx|ts|tsx)$/.test(f))
  .map(
    (f) =>
      '/' +
      path
        .relative(pagesDir, f)
        .split(path.sep)
        .join('/')
        .replace(/\.(js|jsx|ts|tsx)$/, '')
        .replace(/\/index$/, ''),
  );
for (const route of adminRoutes) {
  if (!(route in access.PAGE_RULES)) problem(`page ${route} has no PAGE_RULES entry (it is Owner-only until it gets one)`);
}
for (const rule of Object.keys(access.PAGE_RULES)) {
  if (!adminRoutes.includes(rule)) problem(`PAGE_RULES has "${rule}" but no such page exists`);
}

// 2. sidebar links
const nav = fs.readFileSync(path.join(root, 'components', 'Drawers', 'Config', 'NavConfig.tsx'), 'utf8');
const hrefs = [...nav.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);
if (!hrefs.length) problem('found no sidebar links in NavConfig.tsx');
for (const href of hrefs) {
  const pathOnly = href.split('?')[0];
  if (!(pathOnly in access.PAGE_RULES)) problem(`sidebar link ${href} has no rule`);
}

// rules only use known permissions
const known = new Set(Object.values(access.P));
const ruleKeys = (rule) => (rule ? [...(rule.all || []), ...(rule.any || [])] : []);
for (const [page, rule] of Object.entries(access.PAGE_RULES)) {
  for (const p of ruleKeys(rule)) if (!known.has(p)) problem(`rule for ${page} uses unknown permission "${p}"`);
}

// 3. frontend permission list vs backend catalog
if (backendArg) {
  const file = path.resolve(root, backendArg, 'src', 'Rbac', 'permissions.ts');
  if (!fs.existsSync(file)) {
    problem(`backend permissions file not found: ${file}`);
  } else {
    const src = fs.readFileSync(file, 'utf8');
    const block = src.slice(src.indexOf('export const P = {'), src.indexOf('} as const'));
    const backend = new Set([...block.matchAll(/:\s*'([a-z_]+:[a-z_]+)'/g)].map((m) => m[1]));
    if (!backend.size) problem(`could not read permission keys from ${file}`);
    for (const p of backend) {
      if (!known.has(p)) problem(`backend permission "${p}" is missing from utils/adminAccess.js P (its pages stay Owner-only)`);
      if (!access.PERMISSION_INFO[p]) problem(`backend permission "${p}" has no label in PERMISSION_INFO`);
    }
    for (const p of known) {
      if (!backend.has(p)) problem(`"${p}" in utils/adminAccess.js is not a backend permission`);
    }
    const ownerOnly = [...src.matchAll(/OWNER_ONLY_PERMISSIONS[^=]*=\s*\[([^\]]*)\]/g)][0]?.[1] || '';
    const backendOwnerOnly = [...ownerOnly.matchAll(/P\.([A-Z_]+)/g)].map((m) => access.P[m[1]]);
    if (backendOwnerOnly.sort().join() !== [...access.OWNER_ONLY_PERMISSIONS].sort().join()) {
      problem(`owner-only permissions differ: backend [${backendOwnerOnly}] vs frontend [${access.OWNER_ONLY_PERMISSIONS}]`);
    }
  }
}

console.log(
  `admin access: ${adminRoutes.length} pages, ${hrefs.length} sidebar links, ${known.size} permissions` +
    (backendArg ? ' (checked against backend)' : ' (backend not checked - pass --backend <path>)'),
);
if (problems.length) {
  console.error(problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log('  ✓ all good');
