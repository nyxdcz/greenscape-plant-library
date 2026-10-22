import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrameScheduler } from '../assets/js/catalogue-render.mjs';

function fixture() {
  let next = 0;
  let renders = 0;
  const frames = new Map();
  const scheduler = createFrameScheduler(() => renders++, callback => {
    const id = next++;
    frames.set(id, callback);
    return id;
  }, id => frames.delete(id));
  return { scheduler, frames, get renders() { return renders; }, tick() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback());
  } };
}

test('rapid inputs share one next-frame render, including frame identifier zero', () => {
  const f = fixture();
  for (let i = 0; i < 20; i++) f.scheduler.schedule();
  assert.equal(f.frames.size, 1);
  assert.equal(f.renders, 0);
  f.tick();
  assert.equal(f.renders, 1);
});

test('an immediate filter/reset or composition start can cancel a pending search', () => {
  const f = fixture();
  f.scheduler.schedule();
  f.scheduler.cancel();
  f.tick();
  assert.equal(f.renders, 0);
  f.scheduler.schedule();
  f.tick();
  assert.equal(f.renders, 1);
});

test('later typing schedules a fresh render after the previous frame finishes', () => {
  const f = fixture();
  f.scheduler.schedule();
  f.tick();
  f.scheduler.schedule();
  f.tick();
  assert.equal(f.renders, 2);
  assert.equal(f.frames.size, 0);
});
