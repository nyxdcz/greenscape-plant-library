import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const textExtensions = new Set([
  '.css', '.html', '.js', '.json', '.md', '.mjs', '.txt',
  '.webmanifest', '.xml', '.yaml', '.yml'
]);
const maximumFileBytes = 1_000_000;
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['OpenAI-style secret key', /\bsk-[A-Za-z0-9_-]{20,}\b/]
];

const tracked = spawnSync('git', ['ls-files', '-z'], {
  cwd: root,
  encoding: 'utf8'
});

if (tracked.status !== 0) {
  console.error(tracked.stderr || 'Unable to list tracked files.');
  process.exit(1);
}

const files = tracked.stdout.split('\0').filter(Boolean);
const failures = [];

for (const file of files) {
  const basename = path.basename(file);
  if (
    basename === '.env'
    || (basename.startsWith('.env.') && basename !== '.env.example')
  ) {
    failures.push(`${file}: environment file must not be tracked`);
    continue;
  }

  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;

  const absolutePath = path.join(root, file);
  if (
    !fs.existsSync(absolutePath)
    || fs.statSync(absolutePath).size > maximumFileBytes
  ) continue;

  const source = fs.readFileSync(absolutePath, 'utf8');
  for (const [label, expression] of patterns) {
    if (expression.test(source)) failures.push(`${file}: possible ${label}`);
  }
}

if (failures.length) {
  console.error('High-confidence secret scan failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`High-confidence secret scan passed for ${files.length} tracked files.`);
