/** @param {string} s */
export function normalizeSpanish(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[¿?¡!,."']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} spoken @param {string} expected */
export function matchPronunciation(spoken, expected) {
  const a = normalizeSpanish(spoken);
  const b = normalizeSpanish(expected);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aw = a.split(/\s+/);
  const bw = b.split(/\s+/);
  const overlap = aw.filter((w) => bw.includes(w)).length;
  return overlap >= Math.ceil(bw.length * 0.6);
}

/**
 * @param {string} spoken
 * @param {string} expected
 * @returns {{ passed: boolean, missed: string[], matched: string[], score: number }}
 */
export function analyzePronunciation(spoken, expected) {
  const b = normalizeSpanish(expected);
  const bw = b.split(/\s+/).filter(Boolean);
  const a = normalizeSpanish(spoken);
  const aw = a.split(/\s+/).filter(Boolean);

  const missed = [];
  const matched = [];
  for (const w of bw) {
    const hit = aw.some((w2) => w2 === w || w2.includes(w) || w.includes(w2));
    if (hit) matched.push(w);
    else missed.push(w);
  }

  const passed = matchPronunciation(spoken, expected);
  const score = bw.length ? matched.length / bw.length : 0;
  return { passed, missed, matched, score };
}

/**
 * @param {string} text
 * @param {string[]} missed
 * @param {string[]} matched
 */
export function highlightLine(text, missed, matched) {
  const words = text.split(/(\s+)/);
  return words.map((chunk) => {
    if (!chunk.trim()) return { text: chunk, kind: 'space' };
    const norm = normalizeSpanish(chunk);
    if (missed.some((m) => norm.includes(m) || m.includes(norm))) {
      return { text: chunk, kind: 'missed' };
    }
    if (matched.some((m) => norm.includes(m) || m.includes(norm))) {
      return { text: chunk, kind: 'matched' };
    }
    return { text: chunk, kind: 'neutral' };
  });
}
