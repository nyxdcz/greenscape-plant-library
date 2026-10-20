import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectRecords, highlightedText, recordSummary } from '../assets/js/catalogue-records.mjs';

const plants = [
  { id: 'partial', name: 'Yellow Bell', latin: 'Allamanda cathartica', code: 'YAc', category: 'Shrubs', sizes: [] },
  { id: 'name', name: 'AMa', latin: '', code: 'Other', category: 'Trees', sizes: [] },
  { id: 'code', name: 'Adansonii', latin: 'Monstera adansonii', code: 'AMa', category: 'Indoor Plants', sizes: ['20 cm', '30 cm'] },
  { id: 'material', name: 'Pot', latin: 'Concrete', material: 'Concrete', category: 'Landscape Materials', sizes: [] }
];

test('an exact code precedes an exact name and incidental substring matches', () => {
  assert.deepEqual(selectRecords(plants, { query: 'AMa' }).map(record => record.id), ['code', 'name', 'partial']);
});

test('search is case insensitive and ignores surrounding query whitespace', () => {
  assert.deepEqual(selectRecords(plants, { query: '  MONSTERA  ' }).map(record => record.id), ['code']);
});

test('record type and category constrain search together', () => {
  assert.deepEqual(selectRecords(plants, { scope: 'plants', category: 'Shrubs', query: 'AMa' }).map(record => record.id), ['partial']);
  assert.deepEqual(selectRecords(plants, { scope: 'materials', query: 'Concrete' }).map(record => record.id), ['material']);
  assert.deepEqual(selectRecords(plants, { scope: 'materials', category: 'Trees' }), []);
});

test('material text is searchable when the description is missing', () => {
  const material = { name: 'Planter', category: 'Landscape Materials', material: 'Terracotta' };
  assert.deepEqual(selectRecords([material], { query: 'terra' }), [material]);
});

test('unfiltered results are alphabetical without mutating the source collection', () => {
  const before = [...plants];
  const results = selectRecords(plants);
  assert.equal(results.at(-1).name, 'Yellow Bell');
  assert.deepEqual(plants, before);
});

test('highlighting escapes record markup and highlights every literal match', () => {
  assert.equal(highlightedText('<img onerror="x">AMa & ama', 'ama'), '&lt;img onerror=&quot;x&quot;&gt;<mark>AMa</mark> &amp; <mark>ama</mark>');
  assert.equal(highlightedText('A <script> B', '<script>'), 'A <mark>&lt;script&gt;</mark> B');
});

test('regex punctuation in a query is treated as plain text', () => {
  assert.equal(highlightedText('Size [20] cm', '[20]'), 'Size <mark>[20]</mark> cm');
  assert.equal(highlightedText('A & B', ''), 'A &amp; B');
});

test('a plant summary includes the actual identity, code, category, and sizes', () => {
  assert.equal(recordSummary(plants[2]), 'Adansonii\nMonstera adansonii\nCode: AMa\nCategory: Indoor Plants\nRecorded sizes: 20 cm, 30 cm');
});

test('summaries omit missing values, avoid duplicate material text, and preserve plain text', () => {
  assert.equal(recordSummary(plants[3]), 'Pot\nConcrete\nCategory: Landscape Materials\nRecorded sizes: Not recorded');
  assert.equal(recordSummary({ name: 'A & B' }), 'A & B\nRecorded sizes: Not recorded');
});
