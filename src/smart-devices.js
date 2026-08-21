/**
 * Smart glasses (voice), smart mic (shadowing), smart headphones (MediaSession).
 */

import { matchPronunciation } from './pronunciation.js';

export { matchPronunciation } from './pronunciation.js';

/** @typedef {{
 *   step: (delta: number) => void,
 *   toggleSub: () => void,
 *   grade: (rating: string) => void,
 *   speak: () => void,
 *   stopSpeak: () => void,
 *   setMode: (mode: string) => void,
 *   pronounce: () => void,
 *   getLine: () => { es: string, zh: string } | null,
 *   getCard: () => { es: string, zh: string } | null,
 *   getMode: () => string,
 *   setStatus: (text: string, kind?: string) => void,
 *   onPronounceOk: () => void,
 *   onRender: (cb: () => void) => void,
 *   getExpected?: () => string | null,
 *   onMicResult?: (spoken: string, ok: boolean) => void,
 * }} SmartDeviceActions */

export function isGlassesMode() {
  const w = Math.min(window.innerWidth, screen.width || 9999);
  const h = Math.min(window.innerHeight, screen.height || 9999);
  return (w <= 420 && h <= 340) || (w <= 340 && h <= 420);
}

/** @param {string} text @returns {string|null} */
export function parseVoiceCommand(text) {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  if (/下一个|下一行|下一|siguiente|next|adelante/.test(t)) return 'next';
  if (/上一个|上一行|上一|anterior|prev|atrás|atras/.test(t)) return 'prev';
  if (/字幕|subtítulo|subtitulo|翻译|flip|voltear/.test(t)) return 'flip';
  if (/朗读|读出来|leer|speak|hablar|台词/.test(t)) return 'speak';
  if (/记住|correcto|good|bien|fácil|facil|easy/.test(t)) return 'good';
  if (/模糊|hard|difícil|dificil/.test(t)) return 'hard';
  if (/忘了|不会|olvid|again|mal|no/.test(t)) return 'again';
  if (/剧目|剧集|catálogo|catalogo|show|serie/.test(t)) return 'mode-shows';
  if (/追剧|台词|escena|drama|watch/.test(t)) return 'mode-watch';
  if (/闪卡|单词|vocab|palabra|tarjeta/.test(t)) return 'mode-vocab';
  if (/测验|quiz|examen|prueba/.test(t)) return 'mode-quiz';
  if (/练习|刻意|práctica|practica|practice|shadow/.test(t)) return 'mode-practice';
  if (/跟读|发音|pronunc|repetir|micrófono|microfono/.test(t)) return 'pronounce';
  if (/停|暂停|stop|parar|silencio/.test(t)) return 'stop';

  return null;
}

function getSpeechRecognition() {
  const w = window;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** @param {SmartDeviceActions} actions */
function dispatchCommand(cmd, actions) {
  switch (cmd) {
    case 'next': actions.step(1); break;
    case 'prev': actions.step(-1); break;
    case 'flip': actions.toggleSub(); break;
    case 'speak': actions.speak(); break;
    case 'good': actions.grade('good'); break;
    case 'hard': actions.grade('hard'); break;
    case 'again': actions.grade('again'); break;
    case 'mode-shows': actions.setMode('shows'); break;
    case 'mode-watch': actions.setMode('watch'); break;
    case 'mode-vocab': actions.setMode('vocab'); break;
    case 'mode-quiz': actions.setMode('quiz'); break;
    case 'mode-practice': actions.setMode('practice'); break;
    case 'pronounce': actions.pronounce(); break;
    case 'stop': actions.stopSpeak(); break;
    default: break;
  }
}

/** @param {SmartDeviceActions} actions */
export function initSmartDevices(actions) {
  const glassesDot = document.getElementById('glasses-dot');
  const micDot = document.getElementById('mic-dot');
  const hpDot = document.getElementById('headphone-dot');
  const enableBtn = document.getElementById('smart-enable');

  let glassesRec = null;
  let micRec = null;
  /** @type {HTMLAudioElement|null} */
  let silentAudio = null;

  function setDot(el, state) {
    if (!el) return;
    el.classList.remove('active', 'listening', 'command');
    if (state) el.classList.add(state);
  }

  function syncGlassesLayout() {
    const on = isGlassesMode();
    document.body.classList.toggle('glasses-mode', on);
    if (on) startGlassesVoice();
    else stopGlassesVoice();
    if (glassesDot) glassesDot.title = on ? '智能眼镜模式已启用' : '智能眼镜（窄屏自动启用）';
  }

  function stopGlassesVoice() {
    if (glassesRec) {
      try { glassesRec.stop(); } catch { /* */ }
      glassesRec = null;
    }
    setDot(glassesDot, null);
  }

  function startGlassesVoice() {
    const SR = getSpeechRecognition();
    if (!SR || glassesRec) return;

    glassesRec = new SR();
    glassesRec.lang = 'es-ES';
    glassesRec.continuous = true;
    glassesRec.interimResults = false;
    glassesRec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        const cmd = parseVoiceCommand(t);
        if (cmd) {
          setDot(glassesDot, 'command');
          dispatchCommand(cmd, actions);
          setTimeout(() => setDot(glassesDot, 'listening'), 600);
        }
      }
    };
    glassesRec.onerror = () => setDot(glassesDot, null);
    glassesRec.onend = () => {
      if (isGlassesMode()) {
        try { glassesRec?.start(); setDot(glassesDot, 'listening'); } catch { /* */ }
      }
    };
    try {
      glassesRec.start();
      setDot(glassesDot, 'listening');
    } catch { /* */ }
  }

  function stopMic() {
    if (micRec) {
      try { micRec.stop(); } catch { /* */ }
      micRec = null;
    }
    setDot(micDot, null);
  }

  function resolveExpected() {
    if (actions.getExpected) {
      const custom = actions.getExpected();
      if (custom) return custom;
    }
    if (actions.getMode() === 'watch' || actions.getMode() === 'practice') {
      return actions.getLine()?.es ?? null;
    }
    return actions.getCard()?.es ?? null;
  }

  function startMicPronounce(expectedOverride, onResultOverride) {
    const SR = getSpeechRecognition();
    if (!SR) {
      actions.setStatus('此设备不支持语音识别', 'warn');
      return;
    }
    stopMic();

    const expected = expectedOverride ?? resolveExpected();
    if (!expected) {
      actions.setStatus('当前没有可跟读的内容', 'warn');
      return;
    }

    micRec = new SR();
    micRec.lang = 'es-ES';
    micRec.continuous = false;
    micRec.interimResults = false;
    micRec.onstart = () => setDot(micDot, 'listening');
    micRec.onresult = (e) => {
      const spoken = e.results[0]?.[0]?.transcript ?? '';
      const ok = matchPronunciation(spoken, expected);
      if (onResultOverride) onResultOverride(spoken, ok);
      else if (actions.onMicResult) actions.onMicResult(spoken, ok);
      else {
        actions.setStatus(
          ok ? `¡Muy bien! 发音正确：${spoken}` : `再试一次。听到：${spoken}`,
          ok ? 'ok' : 'warn',
        );
        if (ok && actions.getMode() === 'vocab') actions.grade('good');
        else if (ok) actions.onPronounceOk();
      }
      setDot(micDot, ok ? 'active' : 'command');
      setTimeout(() => setDot(micDot, null), 1200);
    };
    micRec.onerror = () => {
      actions.setStatus('麦克风未听清，请再试', 'warn');
      setDot(micDot, null);
    };
    micRec.onend = () => stopMic();
    try {
      micRec.start();
      actions.setStatus('请用西班牙语跟读这句台词…', 'busy');
    } catch {
      actions.setStatus('无法启动麦克风', 'err');
    }
  }

  function setupHeadphones() {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.setActionHandler('previoustrack', () => actions.step(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => actions.step(1));
    navigator.mediaSession.setActionHandler('play', () => actions.speak());
    navigator.mediaSession.setActionHandler('pause', () => actions.stopSpeak());
    navigator.mediaSession.setActionHandler('seekbackward', () => actions.step(-1));
    navigator.mediaSession.setActionHandler('seekforward', () => actions.step(1));

    setDot(hpDot, 'active');
    if (hpDot) hpDot.title = '智能耳机：线控翻台词 · 播放/暂停朗读';
  }

  /** @param {{ title?: string, artist?: string }} meta */
  function updateMediaSession(meta) {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title ?? '剧西西',
      artist: meta.artist ?? '西语追剧学西语',
      album: '剧西西',
    });
  }

  async function ensureSilentAudio() {
    if (silentAudio) return silentAudio;
    silentAudio = new Audio(
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA',
    );
    silentAudio.loop = true;
    silentAudio.volume = 0.01;
    return silentAudio;
  }

  async function enableAll() {
    syncGlassesLayout();

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setDot(micDot, 'active');
        if (micDot) micDot.title = '智能麦克风：点击「跟读」或说「跟读」';
      }
    } catch {
      actions.setStatus('麦克风权限未授予', 'warn');
    }

    setupHeadphones();
    try {
      const audio = await ensureSilentAudio();
      await audio.play();
    } catch { /* */ }

    if (enableBtn) enableBtn.textContent = '智能设备已启用';
    actions.setStatus('眼镜/麦克风/耳机已就绪', 'ok');
  }

  window.addEventListener('resize', syncGlassesLayout);

  actions.onRender(() => {
    syncGlassesLayout();
    const line = actions.getLine();
    const card = actions.getCard();
    if (line && (actions.getMode() === 'watch' || actions.getMode() === 'practice')) {
      updateMediaSession({ title: line.es, artist: line.zh });
    } else if (card) {
      updateMediaSession({ title: card.es, artist: card.zh });
    }
  });

  if (enableBtn) {
    enableBtn.addEventListener('click', () => enableAll().catch(() => {}));
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.mic-pronounce')) startMicPronounce();
  });

  syncGlassesLayout();

  return { startMicPronounce, stopMic, updateMediaSession, isGlassesMode };
}
