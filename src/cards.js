import { SHOWS, getShow } from './data/shows.js';
import { SCENES, scenesForShow, getScene } from './data/scenes.js';
import { VOCAB, filterVocab, vocabForScene } from './data/vocab.js';

export { SHOWS, SCENES, VOCAB, scenesForShow, getScene, getShow, filterVocab, vocabForScene };

/** @param {string} showId */
export function showProgress(showId) {
  const scenes = scenesForShow(showId);
  const words = filterVocab(showId);
  return { scenes: scenes.length, words: words.length };
}

/** @returns {{ shows: number, scenes: number, words: number }} */
export function catalogStats() {
  return { shows: SHOWS.length, scenes: SCENES.length, words: VOCAB.length };
}
