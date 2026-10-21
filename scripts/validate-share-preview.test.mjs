import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateSharePreview } from './validate-share-preview.mjs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const imagePath = 'assets/images/greenscape-share-card-v1.png';
const png = fs.readFileSync(new URL(`../${imagePath}`, import.meta.url));
const fixture = () => ({ html, exists: file => file === imagePath, readBytes: () => Buffer.from(png) });

test('published sharing metadata resolves to the wide PNG card', () => {
  assert.deepEqual(validateSharePreview(fixture()), []);
});

test('missing sharing image metadata fails before deployment', () => {
  const page = fixture();
  page.html = page.html.replace(/<meta property="og:image"[^>]*>/, '');
  assert.match(validateSharePreview(page).join('\n'), /Missing sharing metadata: og:image/);
});

test('relative, remote, and outside-project image URLs are rejected without a file read', () => {
  for (const url of ['assets/images/card.png', 'https://example.invalid/card.png', 'https://nyxdcz.github.io/assets/images/card.png']) {
    const page = fixture();
    page.html = page.html.replace(/(property="og:image" content=")[^"]+/, `$1${url}`);
    page.readBytes = () => assert.fail('An invalid URL must not read a local image.');
    assert.match(validateSharePreview(page).join('\n'), /absolute HTTPS PNG URL inside/);
  }
});

test('missing published image is rejected', () => {
  const page = fixture();
  page.exists = () => false;
  assert.match(validateSharePreview(page).join('\n'), /Missing sharing image/);
});

test('using the original narrow header logo is rejected', () => {
  const page = fixture();
  page.readBytes = () => fs.readFileSync(new URL('../assets/images/greenscape-logo.png', import.meta.url));
  assert.match(validateSharePreview(page).join('\n'), /rather than the narrow header logo/);
});

test('incorrect dimensions and non-PNG content are rejected', () => {
  const page = fixture();
  page.html = page.html.replace('property="og:image:width" content="1200"', 'property="og:image:width" content="600"');
  assert.match(validateSharePreview(page).join('\n'), /must match the actual PNG/);
  page.readBytes = () => Buffer.from('<html>Not an image</html>');
  assert.match(validateSharePreview(page).join('\n'), /must contain a PNG image header/);
});

test('conflicting images, duplicate tags, and stale canonical URLs fail', () => {
  const page = fixture();
  page.html = page.html.replace('name="twitter:image" content="https:', 'name="twitter:image" content="http:')
    .replace('</head>', '<meta property="og:title" content="Old title"></head>')
    .replace('property="og:url" content="https://nyxdcz.github.io/greenscape-plant-library/"', 'property="og:url" content="https://nyxdcz.github.io/old/"');
  const errors = validateSharePreview(page).join('\n');
  assert.match(errors, /must agree: og:image and twitter:image/);
  assert.match(errors, /Duplicate sharing metadata: og:title/);
  assert.match(errors, /must match the canonical/);
});
