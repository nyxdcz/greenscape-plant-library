import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyImageToClipboard } from '../assets/js/catalogue-image.mjs';

class ClipboardItem {
  constructor(data) { this.data = data; }
}

test('image writes begin inside the click before asynchronous preparation starts', async () => {
  const calls = [];
  const png = new Blob(['photo'], { type: 'image/png' });
  let finishPreparing;
  let copied;
  const result = copyImageToClipboard('/plant.webp', {
    ClipboardItem,
    prepareImage: source => {
      calls.push(`prepare ${source}`);
      return new Promise(resolve => { finishPreparing = resolve; });
    },
    clipboard: { write: items => {
      calls.push('write');
      assert.deepEqual(Object.keys(items[0].data), ['image/png']);
      return items[0].data['image/png'].then(blob => { copied = blob; });
    } }
  });
  assert.deepEqual(calls, ['write']);
  await Promise.resolve();
  assert.deepEqual(calls, ['write', 'prepare /plant.webp']);
  assert.equal(copied, undefined);
  finishPreparing(png);
  await result;
  assert.equal(copied, png);
});

test('unsupported clipboard APIs fail without preparing or substituting a text URL', async () => {
  for (const platform of [{ clipboard: {}, ClipboardItem }, { clipboard: { write() {} }, ClipboardItem: null }, { clipboard: { write() {} }, ClipboardItem: class { static supports() { return false; } } }]) {
    await assert.rejects(copyImageToClipboard('/plant.webp', {
      ...platform,
      prepareImage: () => assert.fail('Unsupported copying must not fetch the image.')
    }), /cannot copy images/);
  }
});

test('a missing photo never writes to the clipboard', async () => {
  await assert.rejects(copyImageToClipboard('', {
    ClipboardItem,
    clipboard: { write: () => assert.fail('There is no photo.') }
  }), /no photo to copy/);
});

test('an image fetch or conversion failure rejects the copy operation', async () => {
  await assert.rejects(copyImageToClipboard('/missing.webp', {
    ClipboardItem,
    clipboard: { write: items => items[0].data['image/png'] },
    prepareImage: async () => { throw new Error('Photo fetch failed'); }
  }), /Photo fetch failed/);
});

test('denied clipboard access remains a failure even when image preparation succeeds', async () => {
  await assert.rejects(copyImageToClipboard('/plant.webp', {
    ClipboardItem,
    clipboard: { write: async () => { throw new Error('Permission denied'); } },
    prepareImage: async () => new Blob(['photo'], { type: 'image/png' })
  }), /Permission denied/);
});

test('synchronous clipboard rejection and later image rejection are both handled', async () => {
  await assert.rejects(copyImageToClipboard('/plant.webp', {
    ClipboardItem,
    clipboard: { write: () => { throw new Error('Clipboard unavailable'); } },
    prepareImage: async () => { throw new Error('Photo unavailable too'); }
  }), /Clipboard unavailable/);
  await new Promise(resolve => setImmediate(resolve));
});
