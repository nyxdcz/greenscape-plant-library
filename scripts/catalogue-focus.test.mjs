import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackInputModality } from '../assets/js/catalogue-focus.mjs';

function fixture() {
  const document = new EventTarget();
  document.documentElement = { dataset: {} };
  trackInputModality(document);
  return { document, get mode() { return document.documentElement.dataset.inputModality; }, key(key, modifiers = {}) {
    document.dispatchEvent(Object.assign(new Event('keydown'), { key, ...modifiers }));
  }, pointer() { document.dispatchEvent(new Event('pointerdown')); } };
}

test('default browser focus behavior remains until an input modality is observed', () => {
  assert.equal(fixture().mode, undefined);
});

test('touch or mouse interaction suppresses lingering outlines and Tab restores keyboard mode', () => {
  const f = fixture();
  f.pointer(); assert.equal(f.mode, 'pointer');
  f.key('Tab'); assert.equal(f.mode, 'keyboard');
  f.pointer(); assert.equal(f.mode, 'pointer');
  f.key('Tab', { shiftKey: true }); assert.equal(f.mode, 'keyboard');
});

test('keyboard activation, dismissal, and navigation preserve visible focus', () => {
  const f = fixture();
  for (const key of ['Enter', ' ', 'Escape', 'ArrowDown', 'Home', 'End', 'PageDown']) {
    f.pointer(); f.key(key); assert.equal(f.mode, 'keyboard');
  }
});

test('typing and browser shortcuts do not mistake pointer interactions for keyboard navigation', () => {
  const f = fixture(); f.pointer();
  for (const [key, modifiers] of [['a', {}], ['Shift', {}], ['ArrowLeft', { metaKey: true }], ['Tab', { ctrlKey: true }], ['ArrowDown', { altKey: true }]]) {
    f.key(key, modifiers); assert.equal(f.mode, 'pointer');
  }
});
