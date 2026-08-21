import { srsIdForLine } from './srs.js';
import { analyzePronunciation, normalizeSpanish } from './pronunciation.js';

const PRACTICE_KEY = 'juxixi-practice-v1';

/** @typedef {{ attempts: number, passes: number, fails: number, lastAt?: number }} LinePractice */

/** @returns {Record<string, LinePractice>} */
export function loadPracticeStats() {
  try {
    const raw = localStorage.getItem(PRACTICE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, LinePractice>} stats */
export function savePracticeStats(stats) {
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(stats));
}

/**
 * @param {Record<string, LinePractice>} stats
 * @param {string} lineId
 * @param {boolean} passed
 */
export function recordLinePractice(stats, lineId, passed) {
  const prev = stats[lineId] ?? { attempts: 0, passes: 0, fails: 0 };
  const next = {
    ...prev,
    attempts: prev.attempts + 1,
    passes: prev.passes + (passed ? 1 : 0),
    fails: prev.fails + (passed ? 0 : 1),
    lastAt: Date.now(),
  };
  return { ...stats, [lineId]: next };
}

/** @param {import('./data/scenes.js').Scene} scene */
export function lineIdsForScene(scene) {
  return scene.lines.map((_, i) => srsIdForLine(scene.id, i));
}

/**
 * Weak-lines queue: never passed, high fail rate, or SRS due.
 * @param {import('./data/scenes.js').Scene} scene
 * @param {Record<string, LinePractice>} practiceStats
 * @param {Record<string, import('./srs.js').SrsState>} srs
 * @param {number} [now]
 */
export function weakLineQueue(scene, practiceStats, srs, now = Date.now()) {
  const ranked = [];
  for (let i = 0; i < scene.lines.length; i++) {
    const id = srsIdForLine(scene.id, i);
    const ps = practiceStats[id];
    const srsSt = srs[id];
    let weight = 0;
    if (!ps || ps.passes === 0) weight += 3;
    if (ps && ps.attempts > 0) weight += (ps.fails / ps.attempts) * 2;
    if (srsSt && srsSt.reps > 0 && srsSt.nextReview <= now) weight += 2;
    if (srsSt?.lapses) weight += srsSt.lapses * 0.5;
    if (weight > 0) ranked.push({ lineIdx: i, weight });
  }
  return ranked.sort((a, b) => b.weight - a.weight).map((r) => r.lineIdx);
}

/** @param {boolean} passed */
export function shouldAdvanceWeakQueue(passed) {
  return passed;
}

/**
 * @param {import('./data/scenes.js').Line} line
 * @param {number} [wordIdx]
 */
export function buildFillBlank(line, wordIdx = 0) {
  const vocab = line.vocab ?? [];
  if (!vocab.length) return null;
  const idx = wordIdx % vocab.length;
  const answer = vocab[idx];
  const re = new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  const blanked = line.es.replace(re, '______');
  if (blanked === line.es) {
    const fallback = line.es.replace(new RegExp(answer, 'i'), '______');
    if (fallback === line.es) return null;
    return { blanked: fallback, answer, hint: line.zh };
  }
  return { blanked, answer, hint: line.zh };
}

/** @param {string} input @param {string} answer */
export function checkFillBlank(input, answer) {
  const a = normalizeSpanish(input);
  const b = normalizeSpanish(answer);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/** @param {string} spoken @param {string} expected */
export function checkRetell(spoken, expected) {
  return analyzePronunciation(spoken, expected);
}

/** @type {Record<string, { gesture: string, action: string, zh: string }>} */
const TPR_VERBS = {
  entrar: { gesture: 'tap', action: '敲手杖', zh: '进入' },
  salir: { gesture: 'shake', action: '晃戒指', zh: '离开' },
  resistir: { gesture: 'tilt-up', action: '戒指上倾', zh: '坚持' },
  negociar: { gesture: 'tilt-left', action: '戒指左倾', zh: '谈判' },
  imprimir: { gesture: 'tap', action: '敲手杖', zh: '印刷' },
  relajate: { gesture: 'tilt-down', action: '戒指下倾', zh: '放松' },
  relajarse: { gesture: 'tilt-down', action: '戒指下倾', zh: '放松' },
  correr: { gesture: 'swing', action: '挥动手杖', zh: '跑' },
  saltar: { gesture: 'shake', action: '晃戒指', zh: '跳' },
};

/**
 * @param {import('./data/scenes.js').Line} line
 * @returns {{ word: string, gesture: string, action: string, zh: string } | null}
 */
export function getTprCue(line) {
  const vocab = line.vocab ?? [];
  for (const w of vocab) {
    const key = w.toLowerCase().replace(/^[^a-záéíóúñ]+/i, '');
    const cue = TPR_VERBS[key] ?? TPR_VERBS[w.split(/\s+/).pop()?.toLowerCase() ?? ''];
    if (cue) return { word: w, ...cue };
  }
  return null;
}

/**
 * @param {string} gestureName
 * @param {{ dir?: string }} detail
 * @param {{ gesture: string }} cue
 */
export function tprGestureMatches(gestureName, detail, cue) {
  if (!cue) return false;
  if (cue.gesture === gestureName) return true;
  if (cue.gesture === 'tilt-up' && gestureName === 'tilt' && detail?.dir === 'up') return true;
  if (cue.gesture === 'tilt-down' && gestureName === 'tilt' && detail?.dir === 'down') return true;
  if (cue.gesture === 'tilt-left' && gestureName === 'tilt' && detail?.dir === 'left') return true;
  if (cue.gesture === 'tilt-right' && gestureName === 'tilt' && detail?.dir === 'right') return true;
  return false;
}
