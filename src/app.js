import {
  SHOWS, SCENES, VOCAB, scenesForShow, getScene, getShow, filterVocab, catalogStats,
} from './cards.js';
import {
  loadSrs, saveSrs, defaultState, gradeCard, dueQueue, stats,
  srsIdForLine, gradeFromShadow, loadStreak, saveStreak, touchStreak, dashboardStats,
} from './srs.js';
import { buildQuiz } from './quiz.js';
import { speakLine, stopSpeak, scheduleLine, lineIndexAtTime } from './player.js';
import { initSmartDevices } from './smart-devices.js';
import { analyzePronunciation, highlightLine } from './pronunciation.js';
import {
  loadPracticeStats, savePracticeStats, recordLinePractice, weakLineQueue,
  shouldAdvanceWeakQueue, buildFillBlank, checkFillBlank, checkRetell,
  getTprCue, tprGestureMatches, lineIdsForScene,
} from './learning.js';

const $ = (sel) => document.querySelector(sel);

let mode = 'shows';
let showFilter = '';
let sceneId = SCENES[0]?.id ?? null;
let lineIdx = 0;
let showZh = true;
let autoPlay = false;
/** @type {HTMLVideoElement|null} */
let localVideo = null;

let vocabIds = [];
let vocabIdx = 0;
let vocabFlipped = false;
let srs = loadSrs();

let quizItems = [];
let quizIdx = 0;
let quizPicked = -1;
let quizScore = 0;

let practiceSubMode = 'shadow';
let immersive = false;
let shadowPhase = 'idle';
/** @type {{ passed: boolean, missed: string[], matched: string[], spoken: string } | null} */
let shadowFeedback = null;
let weakQueue = [];
let weakQueuePos = 0;
/** @type {{ type: 'fill' | 'retell', blanked?: string, answer?: string } | null} */
let outputPrompt = null;
let outputAnswer = '';
let practiceStats = loadPracticeStats();
let streak = loadStreak();
/** @type {ReturnType<typeof initSmartDevices>|null} */
let smartDevices = null;

const renderHooks = [];

function setStatus(text, kind = '') {
  const el = $('#status');
  if (!el) return;
  el.textContent = text;
  el.className = 'status' + (kind ? ` ${kind}` : '');
}

function currentScene() {
  return sceneId ? getScene(sceneId) : null;
}

function currentLine() {
  const sc = currentScene();
  if (!sc) return null;
  const idx = mode === 'practice' && practiceSubMode === 'weak' && weakQueue.length
    ? weakQueue[weakQueuePos] ?? lineIdx
    : lineIdx;
  return sc.lines[idx] ?? null;
}

function currentLineId() {
  const sc = currentScene();
  if (!sc) return null;
  const idx = mode === 'practice' && practiceSubMode === 'weak' && weakQueue.length
    ? weakQueue[weakQueuePos] ?? lineIdx
    : lineIdx;
  return srsIdForLine(sc.id, idx);
}

function currentLineIndex() {
  const sc = currentScene();
  if (!sc) return lineIdx;
  if (mode === 'practice' && practiceSubMode === 'weak' && weakQueue.length) {
    return weakQueue[weakQueuePos] ?? lineIdx;
  }
  return lineIdx;
}

function currentCard() {
  const id = vocabIds[vocabIdx];
  return VOCAB.find((v) => v.id === id) ?? null;
}

function persistSrs() {
  saveSrs(srs);
}

function persistPractice() {
  savePracticeStats(practiceStats);
}

function persistStreak() {
  saveStreak(streak);
}

function feedShadowSrs(passed) {
  const id = currentLineId();
  if (!id) return;
  const st = srs[id] ?? defaultState();
  srs[id] = gradeCard(st, gradeFromShadow(passed));
  practiceStats = recordLinePractice(practiceStats, id, passed);
  streak = touchStreak(streak);
  persistSrs();
  persistPractice();
  persistStreak();
}

function refreshWeakQueue() {
  const sc = currentScene();
  if (!sc) {
    weakQueue = [];
    weakQueuePos = 0;
    return;
  }
  weakQueue = weakLineQueue(sc, practiceStats, srs);
  weakQueuePos = Math.min(weakQueuePos, Math.max(0, weakQueue.length - 1));
}

function learningDashboard() {
  const sc = currentScene();
  const lineIds = sc ? lineIdsForScene(sc) : SCENES.flatMap((s) => lineIdsForScene(s));
  const vocabIds = filterVocab(showFilter || undefined).map((v) => v.id);
  return dashboardStats({ lineIds, vocabIds, srs, streak });
}

function refreshVocabQueue() {
  const pool = filterVocab(showFilter || undefined).map((v) => v.id);
  vocabIds = dueQueue(pool, srs);
  vocabIdx = Math.min(vocabIdx, Math.max(0, vocabIds.length - 1));
}

function setMode(m) {
  mode = m;
  document.querySelectorAll('#mode-tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.mode === m);
  });
  if (m === 'vocab') refreshVocabQueue();
  if (m === 'quiz') startQuiz();
  if (m === 'practice') {
    refreshWeakQueue();
    shadowPhase = 'idle';
    shadowFeedback = null;
    outputPrompt = null;
  }
  document.body.classList.toggle('immersive', immersive && m === 'practice');
  render();
}

function startQuiz() {
  const sc = currentScene();
  if (!sc) return;
  quizItems = buildQuiz(sc, sc.quiz.length);
  quizIdx = 0;
  quizPicked = -1;
  quizScore = 0;
}

function step(delta) {
  if (mode === 'watch') {
    const sc = currentScene();
    if (!sc) return;
    lineIdx = Math.max(0, Math.min(sc.lines.length - 1, lineIdx + delta));
    if (localVideo && sc.lines[lineIdx]) {
      localVideo.currentTime = sc.lines[lineIdx].start;
    }
    render();
    if (autoPlay) playCurrentLine();
  } else if (mode === 'practice') {
    const sc = currentScene();
    if (!sc) return;
    if (practiceSubMode === 'weak' && weakQueue.length) {
      weakQueuePos = Math.max(0, Math.min(weakQueue.length - 1, weakQueuePos + delta));
    } else {
      lineIdx = Math.max(0, Math.min(sc.lines.length - 1, lineIdx + delta));
    }
    shadowPhase = 'idle';
    shadowFeedback = null;
    outputPrompt = null;
    render();
  } else if (mode === 'vocab') {
    if (vocabIds.length === 0) return;
    vocabIdx = (vocabIdx + delta + vocabIds.length) % vocabIds.length;
    vocabFlipped = false;
    render();
  } else if (mode === 'quiz') {
    if (quizPicked < 0 || quizIdx >= quizItems.length - 1) return;
    quizIdx += 1;
    quizPicked = -1;
    render();
  }
}

function toggleSub() {
  showZh = !showZh;
  render();
}

function grade(rating) {
  const id = vocabIds[vocabIdx];
  if (!id) return;
  const st = srs[id] ?? defaultState();
  srs[id] = gradeCard(st, rating);
  persistSrs();
  refreshVocabQueue();
  vocabFlipped = false;
  render();
  setStatus(rating === 'good' ? '已记住这个词' : '已记录复习', 'ok');
}

function speak() {
  const line = currentLine();
  const card = currentCard();
  const text = (mode === 'watch' || mode === 'practice') ? line?.es : card?.es;
  if (!text) return;
  stopSpeak();
  speakLine(text, () => setStatus('朗读结束', ''));
  setStatus('朗读中…', 'busy');
}

function stopSpeakAction() {
  stopSpeak();
  setStatus('', '');
}

function renderShows() {
  const statsEl = catalogStats();
  const list = $('#show-list');
  if (!list) return;
  list.innerHTML = SHOWS.map((s) => {
    const prog = scenesForShow(s.id).length;
    const words = filterVocab(s.id).length;
    return `
      <button type="button" class="show-card" data-show="${s.id}">
        <span class="show-emoji">${s.emoji}</span>
        <div class="show-meta">
          <strong>${s.title}</strong>
          <span class="show-zh">${s.titleZh}</span>
          <span class="show-tags">${s.region} · ${s.level} · ${s.genre}</span>
          <span class="show-blurb">${s.blurb}</span>
          <span class="show-count">${prog} 场景 · ${words} 词</span>
        </div>
      </button>`;
  }).join('');

  const scenePanel = $('#scene-picker');
  if (scenePanel) {
    const scenes = showFilter ? scenesForShow(showFilter) : SCENES;
    scenePanel.innerHTML = `
      <h3>${showFilter ? (getShow(showFilter)?.titleZh ?? '') + ' · 选场景' : '全部场景'}</h3>
      <div class="scene-chips">
        ${scenes.map((sc) => `
          <button type="button" class="chip ${sc.id === sceneId ? 'active' : ''}" data-scene="${sc.id}">
            ${sc.titleZh}<span>${sc.level}</span>
          </button>`).join('')}
      </div>`;
  }

  $('#catalog-stats')?.replaceChildren();
  const statNode = $('#catalog-stats');
  if (statNode) {
    statNode.textContent = `${statsEl.shows} 部剧 · ${statsEl.scenes} 场景 · ${statsEl.words} 词条`;
  }
}

function renderWatch() {
  const sc = currentScene();
  const stage = $('#watch-stage');
  if (!stage || !sc) {
    if (stage) stage.innerHTML = '<p class="empty">请先选择一部剧和场景</p>';
    return;
  }

  const line = sc.lines[lineIdx];
  const show = getShow(sc.showId);
  const progress = ((lineIdx + 1) / sc.lines.length) * 100;

  stage.innerHTML = `
    <div class="theater">
      <div class="theater-bar">
        <span>${show?.emoji ?? '🎬'} ${show?.title ?? ''}</span>
        <span class="scene-title">${sc.titleZh}</span>
      </div>
      <div class="video-slot" id="video-slot">
        ${localVideo ? '' : '<div class="video-placeholder"><span>可导入本地视频同步字幕</span></div>'}
      </div>
      <div class="progress"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="subtitle-box ${showZh ? 'dual' : 'es-only'}">
        <div class="speaker">${line?.speaker ?? ''}</div>
        <p class="line-es">${line?.es ?? ''}</p>
        ${showZh ? `<p class="line-zh">${line?.zh ?? ''}</p>` : ''}
      </div>
      ${line?.vocab?.length ? `
        <div class="line-vocab">
          ${line.vocab.map((w) => `<span class="tag">${w}</span>`).join('')}
        </div>` : ''}
      <div class="line-nav">
        <span>${lineIdx + 1} / ${sc.lines.length}</span>
      </div>
    </div>`;

  if (localVideo) {
    const slot = $('#video-slot');
    slot?.appendChild(localVideo);
    localVideo.className = 'local-video';
  }
}

function renderVocab() {
  const card = currentCard();
  const panel = $('#vocab-panel');
  if (!panel) return;
  if (!card) {
    panel.innerHTML = '<p class="empty">暂无词条，先去追剧模式选场景</p>';
    return;
  }
  const st = stats(vocabIds.length ? filterVocab(showFilter || undefined).map((v) => v.id) : [], srs);
  panel.innerHTML = `
    <div class="flash ${vocabFlipped ? 'flipped' : ''}" id="flash-card">
      <div class="face front">
        <p class="flash-es">${card.es}</p>
        <p class="flash-hint">点击翻面 · 来自剧集台词</p>
      </div>
      <div class="face back">
        <p class="flash-zh">${card.zh}</p>
        ${card.note ? `<p class="flash-note">${card.note}</p>` : ''}
      </div>
    </div>
    <p class="srs-stats">已学 ${st.learned}/${st.total} · 待复习 ${st.due}</p>
    <div class="grade-row">
      <button type="button" data-grade="again">忘了</button>
      <button type="button" data-grade="hard">模糊</button>
      <button type="button" data-grade="good">记住</button>
      <button type="button" data-grade="easy">简单</button>
    </div>`;

  $('#flash-card')?.addEventListener('click', () => {
    vocabFlipped = !vocabFlipped;
    renderVocab();
  });
  panel.querySelectorAll('[data-grade]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      grade(btn.getAttribute('data-grade'));
    });
  });
}

function renderQuiz() {
  const panel = $('#quiz-panel');
  if (!panel) return;
  const q = quizItems[quizIdx];
  if (!q) {
    panel.innerHTML = `<p class="empty">选个场景后开始测验（${quizScore}/${quizItems.length || 0}）</p>`;
    return;
  }
  panel.innerHTML = `
    <p class="quiz-q">${q.q}</p>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button type="button" class="quiz-opt ${quizPicked === i ? (i === q.answer ? 'correct' : 'wrong') : ''}"
          data-pick="${i}" ${quizPicked >= 0 ? 'disabled' : ''}>${opt}</button>`).join('')}
    </div>
    ${quizPicked >= 0 && q.explain ? `<p class="quiz-explain">${q.explain}</p>` : ''}
    <p class="quiz-score">得分 ${quizScore} / ${quizItems.length}</p>`;

  panel.querySelectorAll('[data-pick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (quizPicked >= 0) return;
      const pick = Number(btn.getAttribute('data-pick'));
      quizPicked = pick;
      if (pick === q.answer) quizScore += 1;
      renderQuiz();
    });
  });
}

function renderPracticeDashboard() {
  const dash = learningDashboard();
  const lineId = currentLineId();
  const ps = lineId ? practiceStats[lineId] : null;
  return `
    <div class="learn-dash">
      <div class="dash-cell"><span class="dash-num">${dash.dueLines}</span><span class="dash-label">待练台词</span></div>
      <div class="dash-cell"><span class="dash-num">${dash.dueWords}</span><span class="dash-label">待复习词</span></div>
      <div class="dash-cell"><span class="dash-num">${dash.streak}</span><span class="dash-label">连续天数</span></div>
      ${ps ? `<div class="dash-cell"><span class="dash-num">${ps.passes}/${ps.attempts}</span><span class="dash-label">本句通过</span></div>` : ''}
    </div>`;
}

function renderHighlightedLine(text, feedback) {
  if (!feedback) return `<p class="line-es">${text}</p>`;
  const parts = highlightLine(text, feedback.missed, feedback.matched);
  const html = parts.map((p) => {
    if (p.kind === 'missed') return `<span class="word-missed">${p.text}</span>`;
    if (p.kind === 'matched') return `<span class="word-ok">${p.text}</span>`;
    return p.text;
  }).join('');
  return `<p class="line-es feedback-line">${html}</p>`;
}

function renderPractice() {
  const sc = currentScene();
  const stage = $('#practice-stage');
  if (!stage) return;
  if (!sc) {
    stage.innerHTML = '<p class="empty">请先在剧目页选择场景</p>';
    return;
  }

  const idx = currentLineIndex();
  const line = sc.lines[idx];
  const show = getShow(sc.showId);
  const tpr = getTprCue(line);
  const lineId = srsIdForLine(sc.id, idx);
  const ps = practiceStats[lineId];

  let practiceBody = '';
  if (practiceSubMode === 'output' && outputPrompt?.type === 'fill') {
    practiceBody = `
      <p class="practice-label">填空 · 关键词</p>
      <p class="line-es">${outputPrompt.blanked}</p>
      <input type="text" class="output-input" id="fill-input" placeholder="输入缺失的词…" value="${outputAnswer}" />
      <button type="button" class="btn-primary" id="btn-check-fill">检查</button>`;
  } else if (practiceSubMode === 'output' && outputPrompt?.type === 'retell') {
    practiceBody = `
      <p class="practice-label">复述 · 不看字幕说出这句</p>
      <p class="line-zh">${line.zh}</p>
      <button type="button" class="btn-primary mic-pronounce" id="btn-retell">开始复述</button>`;
  } else {
    practiceBody = `
      <p class="practice-label">${practiceSubMode === 'weak' ? '弱项重练 · 通过才跳下一句' : '影子跟读 · 先听后说'}</p>
      ${renderHighlightedLine(line.es, shadowFeedback)}
      ${showZh ? `<p class="line-zh">${line.zh}</p>` : ''}
      ${tpr ? `<p class="tpr-cue">TPR ${tpr.action} → <strong>${tpr.word}</strong>（${tpr.zh}）</p>` : ''}
      <div class="shadow-controls">
        <button type="button" class="btn-primary" id="btn-shadow-start">${shadowPhase === 'listening' ? '正在听…' : '开始跟读'}</button>
        ${shadowFeedback ? `<span class="feedback-badge ${shadowFeedback.passed ? 'ok' : 'warn'}">${shadowFeedback.passed ? '✅ 通过' : '⚠️ 再练一次'}</span>` : ''}
      </div>`;
  }

  stage.innerHTML = `
    ${immersive ? '' : renderPracticeDashboard()}
    <div class="theater ${immersive ? 'immersive-theater' : ''}">
      <div class="theater-bar">
        <span>${show?.emoji ?? '🎬'} ${sc.titleZh}</span>
        <span class="scene-title">${practiceSubMode === 'weak' ? `弱项 ${weakQueuePos + 1}/${weakQueue.length || 1}` : `第 ${idx + 1} 句`}</span>
      </div>
      <div class="subtitle-box practice-box">
        <div class="speaker">${line.speaker}</div>
        ${practiceBody}
        ${ps ? `<p class="line-stats">练习 ${ps.attempts} 次 · 通过 ${ps.passes} · 失败 ${ps.fails}</p>` : ''}
      </div>
    </div>`;

  $('#btn-shadow-start')?.addEventListener('click', () => startShadowing());
  $('#btn-check-fill')?.addEventListener('click', () => checkFillAnswer());
  $('#fill-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkFillAnswer();
  });
  $('#fill-input')?.addEventListener('input', (e) => {
    outputAnswer = e.target.value;
  });
}

function checkFillAnswer() {
  const line = currentLine();
  if (!line || !outputPrompt?.answer) return;
  const ok = checkFillBlank(outputAnswer, outputPrompt.answer);
  feedShadowSrs(ok);
  shadowFeedback = {
    passed: ok,
    missed: ok ? [] : [outputPrompt.answer],
    matched: ok ? [outputPrompt.answer] : [],
    spoken: outputAnswer,
  };
  setStatus(ok ? '✅ 填空正确' : `⚠️ 正确答案：${outputPrompt.answer}`, ok ? 'ok' : 'warn');
  renderPractice();
}

function startShadowing() {
  const line = currentLine();
  if (!line) return;
  shadowPhase = 'playing';
  shadowFeedback = null;
  renderPractice();
  stopSpeak();
  setStatus('先听示范…', 'busy');
  speakLine(line.es, () => {
    shadowPhase = 'listening';
    renderPractice();
    setStatus('跟着说…', 'busy');
    smartDevices?.startMicPronounce(line.es, handleShadowResult);
  });
}

function handleShadowResult(spoken, ok) {
  const line = currentLine();
  if (!line) return;
  const detail = analyzePronunciation(spoken, line.es);
  shadowFeedback = { ...detail, spoken };
  shadowPhase = 'feedback';
  feedShadowSrs(detail.passed);
  setStatus(
    detail.passed ? '✅ 影子跟读通过' : `⚠️ 再练一次（漏读：${detail.missed.join('、') || '—'}）`,
    detail.passed ? 'ok' : 'warn',
  );
  if (practiceSubMode === 'weak' && shouldAdvanceWeakQueue(detail.passed) && weakQueue.length) {
    if (weakQueuePos < weakQueue.length - 1) {
      weakQueuePos += 1;
      shadowPhase = 'idle';
      shadowFeedback = null;
    } else {
      refreshWeakQueue();
      weakQueuePos = 0;
    }
  }
  renderPractice();
}

function startOutputFill() {
  const line = currentLine();
  if (!line) return;
  const prompt = buildFillBlank(line);
  if (!prompt) {
    setStatus('这句没有关键词可填空', 'warn');
    return;
  }
  practiceSubMode = 'output';
  outputPrompt = { type: 'fill', blanked: prompt.blanked, answer: prompt.answer };
  outputAnswer = '';
  shadowFeedback = null;
  renderPractice();
}

function startOutputRetell() {
  practiceSubMode = 'output';
  outputPrompt = { type: 'retell' };
  outputAnswer = '';
  shadowFeedback = null;
  renderPractice();
}

function setPracticeSubMode(sub) {
  practiceSubMode = sub;
  shadowPhase = 'idle';
  shadowFeedback = null;
  outputPrompt = null;
  if (sub === 'weak') refreshWeakQueue();
  document.querySelectorAll('[data-practice]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-practice') === sub);
  });
  render();
}

function renderToolbar() {
  const watchTools = $('#watch-tools');
  const vocabTools = $('#vocab-tools');
  const practiceTools = $('#practice-tools');
  if (watchTools) watchTools.hidden = mode !== 'watch';
  if (vocabTools) vocabTools.hidden = mode !== 'vocab';
  if (practiceTools) practiceTools.hidden = mode !== 'practice';
}

function renderPanels() {
  $('#panel-shows')?.toggleAttribute('hidden', mode !== 'shows');
  $('#panel-watch')?.toggleAttribute('hidden', mode !== 'watch');
  $('#panel-vocab')?.toggleAttribute('hidden', mode !== 'vocab');
  $('#panel-quiz')?.toggleAttribute('hidden', mode !== 'quiz');
  $('#panel-practice')?.toggleAttribute('hidden', mode !== 'practice');
}

function render() {
  renderPanels();
  renderToolbar();
  document.body.classList.toggle('immersive', immersive && mode === 'practice');
  if (mode === 'shows') renderShows();
  if (mode === 'watch') renderWatch();
  if (mode === 'vocab') renderVocab();
  if (mode === 'quiz') renderQuiz();
  if (mode === 'practice') renderPractice();
  renderHooks.forEach((cb) => cb());
}

function playCurrentLine() {
  const line = currentLine();
  if (!line) return;
  speakLine(line.es, () => {
    if (autoPlay && currentScene()) {
      scheduleLine(currentScene().lines, lineIdx, (next) => {
        lineIdx = next;
        render();
        playCurrentLine();
      });
    }
  });
}

function bindUI() {
  document.querySelectorAll('#mode-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  $('#show-list')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-show]');
    if (!card) return;
    showFilter = card.getAttribute('data-show') ?? '';
    renderShows();
  });

  $('#scene-picker')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-scene]');
    if (!chip) return;
    sceneId = chip.getAttribute('data-scene');
    lineIdx = 0;
    weakQueuePos = 0;
    refreshWeakQueue();
    setMode('watch');
  });

  $('#btn-prev')?.addEventListener('click', () => step(-1));
  $('#btn-next')?.addEventListener('click', () => step(1));
  $('#btn-practice-prev')?.addEventListener('click', () => step(-1));
  $('#btn-practice-next')?.addEventListener('click', () => step(1));
  $('#btn-speak')?.addEventListener('click', speak);
  $('#btn-sub')?.addEventListener('click', toggleSub);
  $('#btn-autoplay')?.addEventListener('click', () => {
    autoPlay = !autoPlay;
    $('#btn-autoplay')?.classList.toggle('active', autoPlay);
    if (autoPlay) playCurrentLine();
    else stopSpeakAction();
  });

  document.querySelectorAll('[data-practice]').forEach((btn) => {
    btn.addEventListener('click', () => setPracticeSubMode(btn.getAttribute('data-practice')));
  });

  $('#btn-output-fill')?.addEventListener('click', () => {
    setPracticeSubMode('output');
    startOutputFill();
  });

  $('#btn-output-retell')?.addEventListener('click', () => {
    setPracticeSubMode('output');
    startOutputRetell();
  });

  $('#btn-immersive')?.addEventListener('click', () => {
    immersive = !immersive;
    $('#btn-immersive')?.classList.toggle('active', immersive);
    render();
  });

  $('#vocab-filter')?.addEventListener('change', (e) => {
    showFilter = e.target.value;
    refreshVocabQueue();
    render();
  });

  $('#video-import')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localVideo) {
      localVideo.pause();
      URL.revokeObjectURL(localVideo.src);
    }
    localVideo = document.createElement('video');
    localVideo.src = URL.createObjectURL(file);
    localVideo.controls = true;
    localVideo.playsInline = true;
    localVideo.addEventListener('timeupdate', () => {
      const sc = currentScene();
      if (!sc) return;
      const idx = lineIndexAtTime(localVideo, sc.lines);
      if (idx !== lineIdx) {
        lineIdx = idx;
        renderWatch();
      }
    });
    render();
    setStatus('已加载本地视频，字幕将随时间轴同步', 'ok');
  });

  window.onWearableGesture = (name, detail) => {
    const line = currentLine();
    const tpr = line ? getTprCue(line) : null;

    if (mode === 'practice') {
      if (tpr && tprGestureMatches(name, detail, tpr)) {
        setStatus(`TPR ✓ ${tpr.action} → ${tpr.word}`, 'ok');
        if (shadowPhase === 'idle' && practiceSubMode !== 'output') startShadowing();
        return;
      }
      if (name === 'tilt') {
        if (detail?.dir === 'left') {
          if (shadowPhase === 'feedback' || shadowPhase === 'idle') speak();
          else stopSpeakAction();
          return;
        }
        if (detail?.dir === 'right') {
          if (practiceSubMode === 'weak' && shadowFeedback && !shadowFeedback.passed) {
            setStatus('弱项模式：通过后才能跳下一句', 'warn');
            return;
          }
          step(1);
          return;
        }
        if (detail?.dir === 'down') startShadowing();
        if (detail?.dir === 'up') toggleSub();
        return;
      }
      if (name === 'tap') {
        if (practiceSubMode === 'output' && outputPrompt?.type === 'retell') {
          smartDevices?.startMicPronounce(line?.es, (spoken) => {
            const result = checkRetell(spoken, line?.es ?? '');
            shadowFeedback = { ...result, spoken };
            feedShadowSrs(result.passed);
            setStatus(result.passed ? '✅ 复述通过' : '⚠️ 再试一次', result.passed ? 'ok' : 'warn');
            renderPractice();
          });
        } else startShadowing();
        return;
      }
      if (name === 'shake') {
        if (practiceSubMode === 'weak') refreshWeakQueue();
        else startOutputRetell();
        return;
      }
    }

    if (name === 'tilt') {
      if (detail?.dir === 'left') step(-1);
      if (detail?.dir === 'right') step(1);
      if (detail?.dir === 'up') toggleSub();
      if (detail?.dir === 'down') speak();
    }
    if (name === 'shake') {
      if (mode === 'vocab') grade('good');
      else toggleSub();
    }
    if (name === 'tap') {
      if (mode === 'vocab') {
        vocabFlipped = !vocabFlipped;
        renderVocab();
      } else speak();
    }
  };
}

smartDevices = initSmartDevices({
  step,
  toggleSub,
  grade,
  speak,
  stopSpeak: stopSpeakAction,
  setMode,
  pronounce: () => {
    if (mode === 'practice') startShadowing();
    else document.querySelector('.mic-pronounce')?.click();
  },
  getLine: () => {
    const l = currentLine();
    return l ? { es: l.es, zh: l.zh } : null;
  },
  getCard: () => {
    const c = currentCard();
    return c ? { es: c.es, zh: c.zh } : null;
  },
  getMode: () => mode,
  setStatus,
  onPronounceOk: () => {
    if (mode === 'practice') handleShadowResult('', true);
    else setStatus('跟读通过！', 'ok');
  },
  onMicResult: (spoken, ok) => {
    if (mode === 'practice' && outputPrompt?.type === 'retell') {
      const line = currentLine();
      const result = checkRetell(spoken, line?.es ?? '');
      shadowFeedback = { ...result, spoken };
      feedShadowSrs(result.passed);
      setStatus(result.passed ? '✅ 复述通过' : '⚠️ 再试一次', result.passed ? 'ok' : 'warn');
      renderPractice();
      return;
    }
    if (mode === 'practice') handleShadowResult(spoken, ok);
  },
  onRender: (cb) => renderHooks.push(cb),
});

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {};
}

bindUI();
refreshVocabQueue();
render();
