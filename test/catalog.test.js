import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SHOWS, SCENES, VOCAB, catalogStats, scenesForShow } from '../src/cards.js';
import { getScene } from '../src/data/scenes.js';
import { buildQuiz } from '../src/quiz.js';
import { gradeCard, defaultState } from '../src/srs.js';

describe('catalog', () => {
  it('has shows, scenes, and vocab', () => {
    const s = catalogStats();
    assert.ok(s.shows >= 6);
    assert.ok(s.scenes >= 10);
    assert.ok(s.words >= 25);
  });

  it('every scene references a valid show', () => {
    const showIds = new Set(SHOWS.map((x) => x.id));
    for (const sc of SCENES) {
      assert.ok(showIds.has(sc.showId), `invalid show ${sc.showId} on ${sc.id}`);
      assert.ok(sc.lines.length >= 3);
      assert.ok(sc.quiz.length >= 1);
    }
  });

  it('vocab ids are unique', () => {
    const ids = new Set();
    for (const v of VOCAB) {
      assert.ok(!ids.has(v.id));
      ids.add(v.id);
      assert.ok(getScene(v.sceneId), `missing scene ${v.sceneId}`);
    }
  });

  it('scenesForShow filters correctly', () => {
    const lcdp = scenesForShow('lcdp');
    assert.ok(lcdp.length >= 3);
    assert.ok(lcdp.every((s) => s.showId === 'lcdp'));
  });
});

describe('quiz', () => {
  it('builds quiz from scene', () => {
    const sc = SCENES[0];
    const q = buildQuiz(sc, 2);
    assert.equal(q.length, 2);
    assert.ok(q.every((x) => x.options.length >= 2));
  });
});

describe('srs', () => {
  it('grades good increases reps', () => {
    const next = gradeCard(defaultState(), 'good');
    assert.equal(next.reps, 1);
  });
});
