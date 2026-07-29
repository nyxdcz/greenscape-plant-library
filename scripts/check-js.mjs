import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['assets/js', 'scripts'];
const extensions = new Set(['.js', '.mjs']);

function collect(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) return [];

  return fs.readdirSync(absoluteDirectory, { withFileTypes: true })
    .flatMap(entry => {
      const relativePath = path.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) return collect(relativePath);
      if (!entry.isFile() || !extensions.has(path.extname(entry.name))) return [];
      return [relativePath.split(path.sep).join('/')];
    });
}

const files = sourceRoots.flatMap(collect).sort();
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    failures.push(`${file}\n${result.stderr || result.stdout || 'Unknown syntax error.'}`);
  }
}

if (failures.length) {
  console.error(`JavaScript syntax check failed for ${failures.length} file(s):`);
  console.error(failures.join('\n\n'));
  process.exit(1);
}

console.log(`JavaScript syntax check passed for ${files.length} source files.`);
