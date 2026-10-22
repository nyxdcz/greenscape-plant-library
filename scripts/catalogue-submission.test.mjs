import { test } from 'node:test';
import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { validateSubmission, inspectSubmissionImage, MAX_IMAGE_BYTES, SUBMISSION_EMAIL, SUBMISSION_ENDPOINT } from '../assets/js/catalogue-submission.mjs';

const categories = ['Shrubs', 'Indoor Plants', 'Palms', 'Trees', 'Climbers & Ferns', 'Cycads, Agaves & Yuccas', 'Grasses & Groundcovers', 'Bamboo', 'Landscape Materials'];
const image = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])], 'plant.png', { type: 'image/png' });
const valid = () => ({ name: 'Adansonii', latin: 'Monstera adansonii', category: 'Indoor Plants', image, reference: '' });

test('new plants require both names, an existing category, and an uploaded image', () => {
  assert.deepEqual(validateSubmission(valid(), categories), []);
  for (const key of ['name', 'latin', 'category', 'image']) {
    const values = valid(); values[key] = key === 'image' ? undefined : '   ';
    assert.ok(validateSubmission(values, categories).some(error => error.key === key), key);
  }
});
test('category and reference values cannot introduce arbitrary categories or executable URLs', () => {
  assert.ok(validateSubmission({ ...valid(), category: 'New category' }, categories).some(error => error.key === 'category'));
  for (const reference of ['javascript:alert(1)', 'file:///tmp/photo', 'not a URL']) assert.ok(validateSubmission({ ...valid(), reference }, categories).some(error => error.key === 'reference'));
  assert.deepEqual(validateSubmission({ ...valid(), reference: 'https://example.org/botanical-reference' }, categories), []);
});
test('corrections validate only selected fields and cannot send an empty correction', () => {
  const options = { correction: true, selected: ['code'] };
  assert.deepEqual(validateSubmission({ code: 'AMa' }, categories, options), []);
  assert.ok(validateSubmission({ code: ' ' }, categories, options).some(error => error.key === 'code'));
  assert.ok(validateSubmission({}, categories, { correction: true }).some(error => error.key === 'selection'));
  assert.ok(validateSubmission({}, categories, { correction: true, selected: ['unknown'] }).some(error => error.key === 'selection'));
});
test('selected image corrections require an actual file and reject failed inspections', () => {
  const options = { correction: true, selected: ['image'] };
  assert.ok(validateSubmission({}, categories, options).some(error => error.key === 'image'));
  assert.ok(validateSubmission({ image }, categories, { ...options, imageError: 'Could not read image.' }).some(error => error.key === 'image'));
});
test('image checks reject renamed text, unsupported image types, empty files, and oversized attachments', async () => {
  assert.equal(await inspectSubmissionImage(image), '');
  for (const file of [new File(['not a photo'], 'fake.png', { type: 'image/png' }), new File(['<svg/>'], 'plant.svg', { type: 'image/svg+xml' }), new File([], 'empty.png', { type: 'image/png' })]) assert.ok(await inspectSubmissionImage(file));
  assert.ok(validateSubmission({ ...valid(), image: { size: MAX_IMAGE_BYTES + 1, type: 'image/png' } }, categories).some(error => error.key === 'image'));
});
test('text limits and the fixed recipient remain enforced', () => {
  assert.ok(validateSubmission({ ...valid(), name: 'x'.repeat(161) }, categories).some(error => error.key === 'name'));
  assert.equal(SUBMISSION_EMAIL, 'nyxdcz@gmail.com');
  assert.equal(SUBMISSION_ENDPOINT, 'https://formsubmit.co/nyxdcz@gmail.com');
});
