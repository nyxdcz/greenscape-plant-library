import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { plantReference } from '../assets/js/catalogue-reference.mjs';
import { PLANT_REFERENCES } from '../assets/js/catalogue-reference-data.mjs';

const plant = { id: 'ind-015', name: 'Adansonii', latin: 'Monstera adansonii', category: 'Indoor Plants' };

test('a researched identity opens its botanical information page', () => {
  const reference = plantReference(plant);
  assert.equal(reference.kind, 'reference');
  assert.equal(reference.url, 'https://gardeningsg.nparks.gov.sg/gardening-resource-library/adansons-monstera/');
  assert.equal(reference.source, 'NParks GardeningSG');
});

test('a missing photograph does not remove the plant reference', () => {
  assert.deepEqual(plantReference({ ...plant, image: '' }), plantReference(plant));
});

test('case and harmless spacing preserve a checked identity', () => {
  assert.equal(plantReference({ ...plant, name: '  ADANSONII ', latin: 'Monstera   adansonii' }).kind, 'reference');
});

test('a changed botanical name or named variety falls back instead of reusing a stale reference', () => {
  for (const edit of [{ latin: 'Monstera deliciosa' }, { name: 'Variegated Adansonii' }]) {
    const record = { ...plant, ...edit };
    const reference = plantReference(record);
    assert.equal(reference.kind, 'google');
    assert.equal(new URL(reference.url).searchParams.get('q'), `${record.name} ${record.latin} plant`);
  }
});

test('unresearched and newly added plants get a correctly encoded Google search', () => {
  const record = { id: 'custom-new', name: 'A & B "fern"', latin: 'Ficus sp. <unknown>', category: 'Shrubs' };
  const reference = plantReference(record);
  const url = new URL(reference.url);
  assert.equal(reference.kind, 'google');
  assert.equal(url.origin + url.pathname, 'https://www.google.com/search');
  assert.equal(url.searchParams.get('q'), 'A & B "fern" Ficus sp. <unknown> plant');
});

test('missing botanical names and unusual IDs safely use Google', () => {
  for (const id of ['unknown', '__proto__', 'constructor']) {
    const result = plantReference({ id, name: 'Garden fern' });
    assert.equal(result.kind, 'google');
    assert.equal(new URL(result.url).searchParams.get('q'), 'Garden fern plant');
  }
});

test('landscape materials do not receive a plant-information reference', () => {
  assert.equal(plantReference({ ...plant, category: 'Landscape Materials' }), null);
});

test('every curated link is an HTTPS botanical page with a complete reviewed identity', () => {
  for (const reference of Object.values(PLANT_REFERENCES)) {
    const url = new URL(reference.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(['www.nparks.gov.sg', 'gardeningsg.nparks.gov.sg', 'plants.ces.ncsu.edu'].includes(url.hostname));
    assert.ok(reference.name && reference.latin && reference.source);
    assert.match(reference.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!/\.(?:jpg|png|webp)(?:$|\?)/i.test(reference.url));
  }
});

test('unconfirmed forms and conflicting common names keep the Google fallback', () => {
  for (const [id, name, latin] of [
    ['shr-040', 'Variegated Ficus triangularis', 'Ficus deltoidea'],
    ['pal-006', 'Parlor Palm', 'Chamaedorea seifrizii'],
    ['pal-038', 'Golden Dwarf Coconut', 'Cocos nucifera']
  ]) assert.equal(plantReference({ id, name, latin }).kind, 'google');
});

test('checked named forms and documented synonyms use their specific source pages', () => {
  for (const [id, suffix] of [
    ['shr-023', '/flora/1/9/1964'],
    ['pal-008', '/flora/2/6/2600'],
    ['pal-005', '/chrysalidocarpus-lutescens/'],
    ['pal-034', '/adonidia-merrillii/']
  ]) {
    const reference = plantReference({ id, ...PLANT_REFERENCES[id] });
    assert.equal(reference.kind, 'reference');
    assert.ok(reference.url.endsWith(suffix));
  }
});

test('the research inventory records the decision for every curated identity', () => {
  const audit = JSON.parse(readFileSync(new URL('../data/plant-reference-review.json', import.meta.url), 'utf8'));
  assert.equal(new Set(audit.map(record => record.id)).size, audit.length);
  for (const record of audit) {
    const result = plantReference(record);
    assert.ok(record.reason && record.checkedAt);
    assert.equal(result.kind, record.status);
    if (record.status === 'reference') {
      assert.equal(result.url, record.url);
      assert.equal(result.source, record.source);
    }
  }
  assert.equal(audit.filter(record => record.status === 'reference').length, Object.keys(PLANT_REFERENCES).length);
});
