import { shuffle } from './srs.js';

/**
 * @param {{ quiz: { q: string, options: string[], answer: number }[] }} scene
 * @param {number} [count]
 */
export function buildQuiz(scene, count = 3) {
  const pool = [...scene.quiz];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

/**
 * @param {string[]} options
 * @param {number} correctIdx
 */
export function checkAnswer(options, correctIdx, picked) {
  return options[picked] === options[correctIdx];
}

/**
 * @param {{ es: string, zh: string }[]} vocabPool
 * @param {string} correctEs
 */
export function distractors(vocabPool, correctEs, n = 3) {
  const others = vocabPool.filter((v) => v.es !== correctEs);
  const picks = shuffle(others).slice(0, n);
  const options = shuffle([...picks.map((p) => p.zh), vocabPool.find((v) => v.es === correctEs)?.zh ?? '']);
  const answer = options.indexOf(vocabPool.find((v) => v.es === correctEs)?.zh ?? '');
  return { options, answer };
}
