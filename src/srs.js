const STORAGE_KEY = 'juxixi-srs-v1';
const STREAK_KEY = 'juxixi-streak-v1';
export const LINE_PREFIX = 'line:';

/** @typedef {{ ease: number, interval: number, reps: number, nextReview: number, lapses: number }} SrsState */

/** @returns {Record<string, SrsState>} */
export function loadSrs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, SrsState>} data */
export function saveSrs(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** @returns {SrsState} */
export function defaultState() {
  return { ease: 2.5, interval: 0, reps: 0, nextReview: 0, lapses: 0 };
}

/**
 * @param {SrsState} s
 * @param {'again'|'hard'|'good'|'easy'} rating
 * @param {number} [now]
 * @returns {SrsState}
 */
export function gradeCard(s, rating, now = Date.now()) {
  const next = { ...s };
  const day = 86_400_000;

  if (rating === 'again') {
    next.lapses += 1;
    next.reps = 0;
    next.interval = 0;
    next.ease = Math.max(1.3, next.ease - 0.2);
    next.nextReview = now + 10 * 60_000;
    return next;
  }

  if (rating === 'hard') {
    next.ease = Math.max(1.3, next.ease - 0.15);
    next.interval = next.reps === 0 ? 1 : Math.max(1, Math.round(next.interval * 1.2));
    next.reps += 1;
    next.nextReview = now + next.interval * day;
    return next;
  }

  if (rating === 'good') {
    if (next.reps === 0) next.interval = 1;
    else if (next.reps === 1) next.interval = 3;
    else next.interval = Math.round(next.interval * next.ease);
    next.reps += 1;
    next.nextReview = now + next.interval * day;
    return next;
  }

  next.ease += 0.15;
  if (next.reps === 0) next.interval = 2;
  else next.interval = Math.round(next.interval * next.ease * 1.3);
  next.reps += 1;
  next.nextReview = now + next.interval * day;
  return next;
}

/**
 * @param {string[]} ids
 * @param {Record<string, SrsState>} srs
 * @param {number} [now]
 */
export function dueQueue(ids, srs, now = Date.now()) {
  const due = [];
  const fresh = [];
  for (const id of ids) {
    const st = srs[id];
    if (!st || st.reps === 0) fresh.push(id);
    else if (st.nextReview <= now) due.push(id);
  }
  return [...shuffle(due), ...shuffle(fresh)];
}

/**
 * @param {string[]} ids
 * @param {Record<string, SrsState>} srs
 * @param {number} [now]
 */
export function stats(ids, srs, now = Date.now()) {
  let learned = 0;
  let due = 0;
  for (const id of ids) {
    const st = srs[id];
    if (st?.reps > 0) learned += 1;
    if (st && st.reps > 0 && st.nextReview <= now) due += 1;
  }
  return { total: ids.length, learned, due, fresh: ids.length - learned };
}

/** @param {string} sceneId @param {number} lineIdx */
export function srsIdForLine(sceneId, lineIdx) {
  return `${LINE_PREFIX}${sceneId}:${lineIdx}`;
}

/** @param {boolean} passed */
export function gradeFromShadow(passed) {
  return passed ? 'good' : 'again';
}

/** @returns {{ count: number, lastDate: string }} */
export function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
  } catch {
    return { count: 0, lastDate: '' };
  }
}

/** @param {{ count: number, lastDate: string }} streak */
export function saveStreak(streak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

/**
 * @param {{ count: number, lastDate: string }} streak
 * @param {number} [now]
 */
export function touchStreak(streak, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (streak.lastDate === today) return streak;
  const yesterday = new Date(now - 86_400_000).toISOString().slice(0, 10);
  const count = streak.lastDate === yesterday ? streak.count + 1 : 1;
  return { count, lastDate: today };
}

/**
 * @param {{ lineIds: string[], vocabIds: string[], srs: Record<string, SrsState>, streak: { count: number } }} input
 * @param {number} [now]
 */
export function dashboardStats(input, now = Date.now()) {
  const lineSt = stats(input.lineIds, input.srs, now);
  const vocabSt = stats(input.vocabIds, input.srs, now);
  return {
    dueLines: lineSt.due,
    dueWords: vocabSt.due,
    learnedLines: lineSt.learned,
    learnedWords: vocabSt.learned,
    totalLines: lineSt.total,
    totalWords: vocabSt.total,
    streak: input.streak.count,
  };
}

/** @template T */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
