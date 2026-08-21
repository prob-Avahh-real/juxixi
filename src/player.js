/**
 * Scene line player — TTS + optional local video sync.
 */

let utterance = null;
let playing = false;
let lineTimer = null;

/** @returns {SpeechSynthesisVoice | null} */
export function pickSpanishVoice() {
  const voices = speechSynthesis.getVoices();
  const es = voices.find((v) => v.lang.startsWith('es'));
  return es ?? voices[0] ?? null;
}

/** @param {string} text */
export function speakLine(text, onEnd) {
  stopSpeak();
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickSpanishVoice();
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = 'es-ES';
  }
  u.rate = 0.92;
  u.onend = () => {
    playing = false;
    onEnd?.();
  };
  u.onerror = () => {
    playing = false;
    onEnd?.();
  };
  utterance = u;
  playing = true;
  speechSynthesis.speak(u);
}

export function stopSpeak() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  playing = false;
  utterance = null;
  if (lineTimer) {
    clearTimeout(lineTimer);
    lineTimer = null;
  }
}

export function isPlaying() {
  return playing;
}

/**
 * Auto-advance lines by duration when no video.
 * @param {import('./data/scenes.js').Line[]} lines
 * @param {number} idx
 * @param {(nextIdx: number) => void} onStep
 */
export function scheduleLine(lines, idx, onStep) {
  if (lineTimer) clearTimeout(lineTimer);
  const line = lines[idx];
  if (!line) return;
  const ms = Math.max(2000, (line.end - line.start) * 1000);
  lineTimer = setTimeout(() => {
    if (idx < lines.length - 1) onStep(idx + 1);
  }, ms);
}

/**
 * @param {HTMLVideoElement | null} video
 * @param {import('./data/scenes.js').Line[]} lines
 * @returns {number}
 */
export function lineIndexAtTime(video, lines) {
  const t = video?.currentTime ?? 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (t >= lines[i].start) return i;
  }
  return 0;
}
