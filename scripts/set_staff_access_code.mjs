import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(root, 'staff-access', 'access-code.txt');
const configPath = path.join(root, 'assets', 'js', 'staff-access-config.js');
const indexPath = path.join(root, 'index.html');

function fail(message) {
  console.error(`Staff access update failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  fail('staff-access/access-code.txt is missing. Copy access-code.example.txt, rename it, and enter the new code.');
}
if (!fs.existsSync(configPath)) fail('assets/js/staff-access-config.js is missing.');
if (!fs.existsSync(indexPath)) fail('index.html is missing.');

const code = fs.readFileSync(inputPath, 'utf8').trim();
if (!code || code === 'REPLACE_WITH_NEW_STAFF_ACCESS_CODE') {
  fail('Replace the placeholder in staff-access/access-code.txt with the new code.');
}
if (code.length < 8 || code.length > 64) {
  fail('The staff access code must contain 8–64 characters.');
}
if (/[\r\n]/.test(code)) fail('The staff access code must be one line.');

const sandbox = { window: {} };
try {
  vm.runInNewContext(fs.readFileSync(configPath, 'utf8'), sandbox, { filename: configPath });
} catch (error) {
  fail(`The existing staff configuration could not be read: ${error.message}`);
}

const current = sandbox.window.GREENSCAPE_STAFF_ACCESS || {};
const sessionMinutes = Math.max(1, Number(current.sessionMinutes) || 30);
const maxAttempts = Math.max(1, Number(current.maxAttempts) || 5);
const cooldownSeconds = Math.max(1, Number(current.cooldownSeconds) || 30);

const salt = crypto.randomBytes(24).toString('hex');
const codeHash = crypto
  .createHash('sha256')
  .update(`${salt}:${code}`)
  .digest('hex');

const configSource = `window.GREENSCAPE_STAFF_ACCESS = Object.freeze({
  salt: '${salt}',
  codeHash: '${codeHash}',
  sessionMinutes: ${sessionMinutes},
  maxAttempts: ${maxAttempts},
  cooldownSeconds: ${cooldownSeconds}
});
`;

fs.writeFileSync(configPath, configSource, 'utf8');

const currentIndex = fs.readFileSync(indexPath, 'utf8');
const cacheVersion = `access-${codeHash.slice(0, 12)}`;
const nextIndex = currentIndex.replace(
  /assets\/js\/staff-access-config\.js\?v=[^"]+/,
  `assets/js/staff-access-config.js?v=${cacheVersion}`
);

if (nextIndex === currentIndex && !currentIndex.includes(`assets/js/staff-access-config.js?v=${cacheVersion}`)) {
  fail('index.html does not contain the expected staff-access-config.js script reference.');
}

if (nextIndex !== currentIndex) fs.writeFileSync(indexPath, nextIndex, 'utf8');

fs.rmSync(inputPath, { force: true });
console.log(`Staff access configuration updated with cache version ${cacheVersion}.`);
console.log('The plaintext staff-access/access-code.txt file was deleted.');
