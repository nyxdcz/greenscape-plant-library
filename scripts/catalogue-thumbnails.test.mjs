import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { localImageName, thumbnailModule, validateThumbnails } from './catalogue-thumbnails.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture() {
  const original = Buffer.from('original photograph');
  const output = Buffer.from('RIFF1234WEBPthumbnail');
  const sourceHash = hash(original);
  const thumbnail = `thumbnails/plant-${sourceHash.slice(0, 12)}.webp`;
  const files = new Map([['plant.webp', original], [thumbnail, output]]);
  const entries = [{ image: 'plant.webp', sourceHash, thumbnail, outputHash: hash(output), width: 160, height: 120 }];
  return { files, images: ['plant.webp'], manifest: { settings: { width: 160, height: 160, fit: 'inside', withoutEnlargement: true, quality: 80 }, entries }, moduleSource: thumbnailModule(entries), read: name => { if (!files.has(name)) throw new Error('missing'); return files.get(name); } };
}

test('only supported local image filenames enter the thumbnail inventory', () => {
  assert.equal(localImageName('assets/images/plant.webp'), 'plant.webp');
  for (const value of ['https://example.com/plant.webp', '//example.com/a.jpg', '../a.jpg', 'thumbnails/a.webp', 'data:image/png;base64,abc', '', 'constructor']) assert.equal(localImageName(value), null);
});

test('matching photo bytes, thumbnail bytes, dimensions, and application map pass', () => {
  assert.deepEqual(validateThumbnails(fixture()), []);
});

test('malformed manifest entries produce a useful failure instead of an exception', () => {
  const f = fixture(); f.manifest.entries = [null];
  assert.match(validateThumbnails(f).join('\n'), /entries are invalid/);
});

test('a changed original requires regeneration even when its filename is unchanged', () => {
  const f = fixture(); f.files.set('plant.webp', Buffer.from('replacement photograph'));
  assert.match(validateThumbnails(f).join('\n'), /Photo changed/);
});

test('a missing derivative cannot pass the publication check', () => {
  const f = fixture(); f.files.delete(f.manifest.entries[0].thumbnail);
  assert.match(validateThumbnails(f).join('\n'), /Missing photo or thumbnail/);
});

test('new catalogue photos cannot be silently omitted from the manifest', () => {
  const f = fixture(); f.images.push('new.webp');
  assert.match(validateThumbnails(f).join('\n'), /must match the published/);
});

test('corrupt thumbnail output and oversized dimensions are rejected', () => {
  const f = fixture(); f.files.set(f.manifest.entries[0].thumbnail, Buffer.from('corrupt')); f.manifest.entries[0].width = 560;
  const errors = validateThumbnails(f).join('\n');
  assert.match(errors, /Thumbnail changed or invalid/); assert.match(errors, /Invalid thumbnail dimensions/);
});

test('stale application maps and paths outside the thumbnail directory are rejected', () => {
  const f = fixture(); f.moduleSource = '';
  assert.match(validateThumbnails(f).join('\n'), /application map is outdated/);
  f.manifest.entries[0].thumbnail = '../original.webp';
  assert.match(validateThumbnails(f).join('\n'), /Invalid thumbnail path/);
});
