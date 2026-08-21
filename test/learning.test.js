import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SCENES } from '../src/cards.js';
import {
  gradeCard, defaultState, srsIdForLine, gradeFromShadow,
  touchStreak, dashboardStats,
} from '../src/srs.js';
import {
  analyzePronunciation, matchPronunciation, highlightLine, normalizeSpanish,
} from '../src/pronunciation.js';
import {
  recordLinePractice, weakLineQueue, buildFillBlank, checkFillBlank,
  checkRetell, getTprCue, tprGestureMatches, shouldAdvanceWeakQueue,
} from '../src/learning.js';

describe('pronunciation', () => {
  it('matchPronunciation accepts partial overlap', () => {
    assert.equal(
      matchPronunciation('empezamos la operacion', 'Empezamos la operación más importante'),
      true,
    );
  });

  it('analyzePronunciation lists missed words', () => {
    const r = analyzePronunciation('mundo', 'hola mundo amigo');
    assert.ok(r.missed.includes('hola'));
    assert.ok(r.missed.includes('amigo'));
    assert.ok(r.matched.includes('mundo'));
    assert.ok(r.score > 0 && r.score < 1);
  });

  it('highlightLine marks missed and matched', () => {
    const parts = highlightLine('hola mundo', ['mundo'], ['hola']);
    const missed = parts.find((p) => p.kind === 'missed');
    const matched = parts.find((p) => p.kind === 'matched');
    assert.ok(missed);
    assert.ok(matched);
  });

  it('normalizeSpanish strips accents', () => {
    assert.equal(normalizeSpanish('Operación'), 'operacion');
  });
});

describe('learning', () => {
  const scene = SCENES[0];
  const line = scene.lines[2];

  it('buildFillBlank blanks a vocab keyword', () => {
    const fb = buildFillBlank(line, 0);
    assert.ok(fb);
    assert.ok(fb.blanked.includes('______'));
    assert.ok(checkFillBlank(fb.answer, fb.answer));
  });

  it('checkRetell uses pronunciation scoring', () => {
    const r = checkRetell(line.es, line.es);
    assert.equal(r.passed, true);
    assert.equal(r.score, 1);
  });

  it('getTprCue finds verb gesture', () => {
    const cue = getTprCue(line);
    assert.ok(cue);
    assert.equal(cue.word, 'imprimir');
    assert.equal(tprGestureMatches('tap', {}, cue), true);
  });

  it('weakLineQueue prioritizes unpassed lines', () => {
    const stats = {};
    const srs = {};
    const q = weakLineQueue(scene, stats, srs);
    assert.equal(q.length, scene.lines.length);
    assert.equal(q[0], 0);
  });

  it('recordLinePractice tracks attempts', () => {
    const id = srsIdForLine(scene.id, 0);
    const next = recordLinePractice({}, id, false);
    assert.equal(next[id].attempts, 1);
    assert.equal(next[id].fails, 1);
    const pass = recordLinePractice(next, id, true);
    assert.equal(pass[id].passes, 1);
  });

  it('shouldAdvanceWeakQueue only on pass', () => {
    assert.equal(shouldAdvanceWeakQueue(true), true);
    assert.equal(shouldAdvanceWeakQueue(false), false);
  });
});

describe('srs extensions', () => {
  it('gradeFromShadow maps pass/fail', () => {
    assert.equal(gradeFromShadow(true), 'good');
    assert.equal(gradeFromShadow(false), 'again');
  });

  it('shadow fail then pass updates SRS', () => {
    let st = defaultState();
    st = gradeCard(st, gradeFromShadow(false));
    assert.equal(st.lapses, 1);
    st = gradeCard(st, gradeFromShadow(true));
    assert.equal(st.reps, 1);
  });

  it('touchStreak increments on consecutive days', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const s1 = touchStreak({ count: 2, lastDate: yesterday });
    assert.equal(s1.count, 3);
    assert.equal(s1.lastDate, today);
    const s2 = touchStreak(s1);
    assert.equal(s2.count, 3);
  });

  it('dashboardStats aggregates lines and words', () => {
    const lineIds = [srsIdForLine(SCENES[0].id, 0)];
    const vocabIds = ['v-operacion'];
    const srs = { [lineIds[0]]: gradeCard(defaultState(), 'good') };
    const dash = dashboardStats({ lineIds, vocabIds, srs, streak: { count: 5 } });
    assert.equal(dash.learnedLines, 1);
    assert.equal(dash.streak, 5);
  });
});
