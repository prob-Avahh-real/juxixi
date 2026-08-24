import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAction, keysForMode, attachKeyboard } from '../src/keyboard.js';

describe('keyboard.resolveAction', () => {
  it('watch: arrows + space map to navigate / speak', () => {
    assert.equal(resolveAction('watch', 'ArrowLeft'), 'prev');
    assert.equal(resolveAction('watch', 'ArrowRight'), 'next');
    assert.equal(resolveAction('watch', ' '), 'speak');
  });

  it('practice: f=fill, r=retell, i=immersive, arrows navigate', () => {
    assert.equal(resolveAction('practice', 'f'), 'fill');
    assert.equal(resolveAction('practice', 'F'), 'fill');
    assert.equal(resolveAction('practice', 'r'), 'retell');
    assert.equal(resolveAction('practice', 'i'), 'immersive');
    assert.equal(resolveAction('practice', 'ArrowRight'), 'next');
  });

  it('vocab: digits grade, space flips, arrows navigate', () => {
    assert.equal(resolveAction('vocab', '1'), 'again');
    assert.equal(resolveAction('vocab', '4'), 'easy');
    assert.equal(resolveAction('vocab', ' '), 'flip');
    assert.equal(resolveAction('vocab', 'ArrowRight'), 'next');
  });

  it('quiz: digits pick options, right arrow advances', () => {
    assert.equal(resolveAction('quiz', '1'), 'pick-1');
    assert.equal(resolveAction('quiz', '4'), 'pick-4');
    assert.equal(resolveAction('quiz', 'ArrowRight'), 'next');
  });

  it('shows mode has no shortcuts (clean browser shortcuts)', () => {
    assert.equal(resolveAction('shows', 'ArrowRight'), null);
  });

  it('Ctrl / Meta / Alt shortcuts are ignored (do not hijack Cmd-R etc.)', () => {
    assert.equal(resolveAction('watch', 'ArrowRight', { meta: true }), null);
    assert.equal(resolveAction('vocab', 'r', { ctrl: true }), null);
    assert.equal(resolveAction('practice', 'f', { alt: true }), null);
  });

  it('unknown keys return null', () => {
    assert.equal(resolveAction('watch', 'q'), null);
    assert.equal(resolveAction('practice', 'x'), null);
  });

  it('keysForMode lists registered keys (used by help UI)', () => {
    const keys = keysForMode('practice');
    assert.ok(keys.includes('ArrowRight'));
    assert.ok(keys.includes('f'));
  });
});

describe('keyboard.attachKeyboard', () => {
  it('dispatches actions through ctx and ignores browser modifier shortcuts', () => {
    const calls = [];
    /** @type {Array<(e: any) => void>} */
    const handlers = [];
    const target = {
      addEventListener(type, h) { if (type === 'keydown') handlers.push(h); },
      removeEventListener(type, h) {
        if (type !== 'keydown') return;
        const i = handlers.indexOf(h);
        if (i >= 0) handlers.splice(i, 1);
      },
    };
    const unbind = attachKeyboard(target, {
      getMode: () => 'practice',
      dispatch: (a) => calls.push(a),
    });

    handlers.forEach((h) => h({ key: 'ArrowRight', ctrlKey: false, metaKey: false, altKey: false, repeat: false, defaultPrevented: false, preventDefault() {} }));
    handlers.forEach((h) => h({ key: 'r', ctrlKey: false, metaKey: false, altKey: false, repeat: false, defaultPrevented: false, preventDefault() {} }));
    handlers.forEach((h) => h({ key: 'r', ctrlKey: true, metaKey: false, altKey: false, repeat: false, defaultPrevented: false, preventDefault() {} }));

    assert.deepEqual(calls, ['next', 'retell']);
    unbind();
  });

  it('unbind removes the listener', () => {
    let count = 0;
    /** @type {Array<(e: any) => void>} */
    const handlers = [];
    const target = {
      addEventListener(type, h) { if (type === 'keydown') handlers.push(h); },
      removeEventListener(type, h) {
        if (type !== 'keydown') return;
        const i = handlers.indexOf(h);
        if (i >= 0) handlers.splice(i, 1);
      },
    };
    const unbind = attachKeyboard(target, {
      getMode: () => 'watch',
      dispatch: () => count++,
    });
    handlers.forEach((h) => h({ key: 'ArrowRight', ctrlKey: false, metaKey: false, altKey: false, repeat: false, defaultPrevented: false, preventDefault() {} }));
    unbind();
    handlers.length = 0;
    assert.equal(count, 1);
  });
});
