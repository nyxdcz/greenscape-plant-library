import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CatalogueStore, STORAGE_KEYS } from '../assets/js/catalogue-store.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const plant = (id, name = 'Adansonii') => ({ id, name, latin: 'Monstera adansonii', category: 'Indoor Plants', code: 'AMa', material: '', image: 'ind-015.webp', sizes: ['20 cm'] });

test('existing device records load with their original storage keys', () => {
  const storage = memoryStorage({
    [STORAGE_KEYS.edits]: JSON.stringify({ 'ind-015': plant('ind-015', 'Edited Adansonii') }),
    [STORAGE_KEYS.added]: JSON.stringify([plant('custom-existing', 'Added plant')])
  });
  const store = new CatalogueStore(storage);
  assert.equal(store.hasReadError, false);
  assert.deepEqual(store.plants([plant('ind-015')]).map(record => record.name), ['Added plant', 'Edited Adansonii']);
});

test('failed saves leave both the published record and previous edit intact', () => {
  const storage = memoryStorage({ [STORAGE_KEYS.edits]: JSON.stringify({ 'ind-015': plant('ind-015', 'Previous edit') }) });
  const store = new CatalogueStore(storage);
  const before = storage.values.get(STORAGE_KEYS.edits);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => store.save(plant('ind-015', 'Unsaved edit')), /could not save/);
  assert.equal(store.plants([plant('ind-015')])[0].name, 'Previous edit');
  assert.equal(storage.values.get(STORAGE_KEYS.edits), before);
});

test('failed new-plant saves do not appear in the catalogue; retry saves once', () => {
  const storage = memoryStorage();
  const store = new CatalogueStore(storage);
  const write = storage.setItem;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  const draft = plant('custom-new');
  assert.throws(() => store.save(draft), /could not save/);
  assert.deepEqual(store.plants([]), []);
  assert.equal(storage.values.has(STORAGE_KEYS.added), false);
  storage.setItem = write;
  store.save(draft);
  store.save({ ...draft, name: 'Updated draft' });
  assert.equal(store.added.length, 1);
  assert.equal(new CatalogueStore(storage).plants([])[0].name, 'Updated draft');
});

test('unreadable saved changes are not overwritten by an edit', () => {
  for (const raw of ['{bad json', '[]', 'null', '{"ind-015":{"name":42}}']) {
    const storage = memoryStorage({ [STORAGE_KEYS.edits]: raw });
    const store = new CatalogueStore(storage);
    assert.equal(store.hasReadError, true);
    assert.equal(store.plants([plant('ind-015')])[0].name, 'Adansonii');
    assert.throws(() => store.save(plant('ind-015', 'Replacement')), /left untouched/);
    assert.equal(storage.values.get(STORAGE_KEYS.edits), raw);
  }
});

test('malformed added plants do not crash the catalogue or get replaced', () => {
  for (const raw of ['{}', '[null]', '[{"id":"custom-a","name":"Test","sizes":7}]', '[{"name":"Missing ID"}]']) {
    const storage = memoryStorage({ [STORAGE_KEYS.added]: raw });
    const store = new CatalogueStore(storage);
    assert.equal(store.hasReadError, true);
    assert.deepEqual(store.plants([]), []);
    assert.throws(() => store.save(plant('custom-new')), /left untouched/);
    assert.equal(storage.values.get(STORAGE_KEYS.added), raw);
  }
});

test('denied storage still allows published records to be browsed', () => {
  const storage = { getItem() { throw new Error('SecurityError'); } };
  const store = new CatalogueStore(storage);
  assert.equal(store.hasReadError, true);
  assert.equal(store.plants([plant('ind-015')]).length, 1);
  assert.throws(() => store.save(plant('custom-new')), /left untouched/);
  assert.equal(new CatalogueStore(null).hasReadError, true);
});

test('successful saves preserve sibling records and a deliberate empty optional field', () => {
  const storage = memoryStorage();
  const store = new CatalogueStore(storage);
  store.save(plant('ind-015'));
  store.save(plant('ind-016', 'Peace Lily'));
  store.save({ ...plant('ind-015'), latin: '', image: '', sizes: [] });
  const records = new CatalogueStore(storage).plants([plant('ind-015'), plant('ind-016')]);
  assert.equal(records.length, 2);
  assert.equal(records[0].latin, '');
  assert.equal(records[0].image, '');
  assert.deepEqual(records[0].sizes, []);
  assert.equal(records[1].name, 'Peace Lily');
});

test('empty record names are rejected before anything is stored', () => {
  const storage = memoryStorage();
  assert.throws(() => new CatalogueStore(storage).save(plant('custom-new', '   ')), /Enter a name/);
  assert.equal(storage.values.size, 0);
});

test('saving does not retain the editable draft size array', () => {
  const store = new CatalogueStore(memoryStorage());
  const draft = plant('custom-new');
  store.save(draft);
  draft.sizes.push('90 cm');
  assert.deepEqual(store.added[0].sizes, ['20 cm']);
});

test('older minimal custom records receive safe optional-field defaults', () => {
  const storage = memoryStorage({ [STORAGE_KEYS.added]: '[{"id":"custom-old","name":"Older plant"}]' });
  const store = new CatalogueStore(storage);
  assert.equal(store.hasReadError, false);
  assert.deepEqual(store.plants([])[0].sizes, []);
  assert.equal(store.plants([])[0].category, 'Other');
});
