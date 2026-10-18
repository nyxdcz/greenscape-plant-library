import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateCataloguePage } from './validate-catalogue.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const originalHtml = fs.readFileSync(`${root}index.html`, 'utf8');
const originalFiles = new Map(['assets/js/catalogue.mjs', 'assets/js/catalogue-store.mjs', 'assets/js/data.js', 'assets/css/catalogue.css']
  .map(file => [file, fs.readFileSync(`${root}${file}`, 'utf8')]));

function fixture() {
  const files = new Map(originalFiles);
  return { html: originalHtml, files, read: file => files.get(file), exists: file => files.has(file) };
}

test('the published catalogue entry and its complete module graph validate', () => {
  assert.deepEqual(validateCataloguePage(fixture()), []);
});

test('a missing application module is rejected', () => {
  const page = fixture();
  page.files.delete('assets/js/catalogue.mjs');
  assert.match(validateCataloguePage(page).join('\n'), /Missing catalogue module/);
});

test('a missing transitive storage module is rejected', () => {
  const page = fixture();
  page.files.delete('assets/js/catalogue-store.mjs');
  assert.match(validateCataloguePage(page).join('\n'), /Missing catalogue module: assets\/js\/catalogue-store.mjs/);
});

test('module syntax errors fail validation before deployment', () => {
  const page = fixture();
  page.files.set('assets/js/catalogue-store.mjs', 'export {');
  assert.match(validateCataloguePage(page).join('\n'), /Invalid catalogue module/);
});

test('a missing stylesheet is rejected', () => {
  const page = fixture();
  page.files.delete('assets/css/catalogue.css');
  assert.match(validateCataloguePage(page).join('\n'), /stylesheet must exist/);
});

test('stale script and stylesheet cache combinations are rejected', () => {
  const page = fixture();
  page.html = page.html.replace(/(catalogue\.css\?v=)[^"]+/, '$1stale-version');
  assert.match(validateCataloguePage(page).join('\n'), /cache versions must be present and agree/);
});

test('a stale imported module cache version is rejected', () => {
  const page = fixture();
  page.files.set('assets/js/catalogue.mjs', page.files.get('assets/js/catalogue.mjs').replace(/(catalogue-store\.mjs\?v=)[^']+/, '$1stale-version'));
  assert.match(validateCataloguePage(page).join('\n'), /import cache version must match/);
});

test('a stale data revision is rejected', () => {
  const page = fixture();
  page.html = page.html.replace(/(data-catalogue-src=")[^"]+/, '$1assets/js/data.js?v=csv-000000000000-catalogue-sync1');
  assert.match(validateCataloguePage(page).join('\n'), /data cache must match its published source revision/);
});

test('the data source cannot be silently redirected to a remote script', () => {
  const page = fixture();
  page.html = page.html.replace(/(data-catalogue-src=")[^"]+/, '$1https://example.invalid/data.js');
  assert.match(validateCataloguePage(page).join('\n'), /published local data.js/);
});

test('an import outside the project is rejected without reading it', () => {
  const page = fixture();
  page.files.set('assets/js/catalogue.mjs', "import '../../../outside.mjs';");
  assert.match(validateCataloguePage(page).join('\n'), /Invalid catalogue module import/);
});

test('loading both applications is rejected', () => {
  const page = fixture();
  page.html = page.html.replace('</body>', '<script src="assets/js/app.js" defer></script></body>');
  assert.match(validateCataloguePage(page).join('\n'), /only its own application entry/);
});

test('removing the native dialog is rejected', () => {
  const page = fixture();
  page.html = page.html.replace('<dialog ', '<div ').replace('</dialog>', '</div>');
  assert.match(validateCataloguePage(page).join('\n'), /named native dialog/);
});

test('a dangling dialog title is rejected', () => {
  const page = fixture();
  page.html = page.html.replace('aria-labelledby="plant-title"', 'aria-labelledby="missing-title"');
  assert.match(validateCataloguePage(page).join('\n'), /dialog title must exist/);
});

test('unlabeled inputs and missing live feedback are rejected', () => {
  const page = fixture();
  page.html = page.html.replace('for="category"', 'for="missing-category"').replace('aria-live="polite"', 'aria-live="off"');
  const failures = validateCataloguePage(page).join('\n');
  assert.match(failures, /associated label: category/);
  assert.match(failures, /result announcements must be polite/);
});

test('missing initial loading feedback is rejected', () => {
  const page = fixture();
  page.html = page.html.replace('aria-busy="true"', 'aria-busy="false"');
  assert.match(validateCataloguePage(page).join('\n'), /initial catalogue page must expose its loading state/);
});

test('removing the explicit entry-page mode is rejected', () => {
  const page = fixture();
  page.html = page.html.replace('data-app="catalogue"', '');
  assert.match(validateCataloguePage(page).join('\n'), /must declare data-app/);
});
