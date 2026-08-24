/**
 * Keyboard shortcuts for desktop / iPad-with-keyboard users.
 *
 * Strategy:
 * - Pure keymap lookup: `resolveAction(mode, key, modifiers)` → action name | null
 *   (testable without DOM).
 * - `attachKeyboard(target, dispatch)` binds a single keydown listener and
 *   dispatches resolved actions. Returns an `unbind` cleanup.
 * - Each mode owns its keymap table; new modes = new entry, no central if-tree.
 *
 * Action vocabulary (stable contract for app.js):
 *   watch:     'prev' | 'next' | 'speak' | 'sub' | 'autoplay'
 *   practice:  'prev' | 'next' | 'speak' | 'sub' | 'immersive' | 'shadow' | 'fill' | 'retell'
 *   vocab:     'prev' | 'next' | 'flip' | 'again' | 'hard' | 'good' | 'easy'
 *   quiz:      'pick-1' | 'pick-2' | 'pick-3' | 'pick-4' | 'next'
 *   shows:     (none — keep clean)
 */

/**
 * @typedef {'watch'|'practice'|'vocab'|'quiz'|'shows'} AppMode
 * @typedef {Record<string, string>} Keymap
 */

/** @type {Record<AppMode, Keymap>} */
const KEYMAPS = {
  watch: {
    ArrowLeft: 'prev',
    ArrowRight: 'next',
    ' ': 'speak',
    s: 'speak',
    S: 'speak',
    z: 'sub',
    Z: 'sub',
    a: 'autoplay',
    A: 'autoplay',
  },
  practice: {
    ArrowLeft: 'prev',
    ArrowRight: 'next',
    ' ': 'shadow',
    s: 'speak',
    S: 'speak',
    z: 'sub',
    Z: 'sub',
    i: 'immersive',
    I: 'immersive',
    f: 'fill',
    F: 'fill',
    r: 'retell',
    R: 'retell',
  },
  vocab: {
    ArrowLeft: 'prev',
    ArrowRight: 'next',
    ' ': 'flip',
    '1': 'again',
    '2': 'hard',
    '3': 'good',
    '4': 'easy',
  },
  quiz: {
    '1': 'pick-1',
    '2': 'pick-2',
    '3': 'pick-3',
    '4': 'pick-4',
    ArrowRight: 'next',
  },
  shows: {},
};

/**
 * Pure: look up the action for a (mode, key, modifiers) tuple.
 * Modifier-aware: returns null when Ctrl/Meta/Alt are held so we never
 * hijack browser shortcuts (Cmd-R, Ctrl-L, etc.).
 *
 * @param {AppMode} mode
 * @param {string} key
 * @param {{ ctrl?: boolean, meta?: boolean, alt?: boolean }} [modifiers]
 * @returns {string|null}
 */
export function resolveAction(mode, key, modifiers = {}) {
  if (!mode) return null;
  if (modifiers.ctrl || modifiers.meta || modifiers.alt) return null;
  const table = KEYMAPS[mode];
  if (!table) return null;
  return table[key] ?? null;
}

/**
 * @param {AppMode} mode
 * @returns {string[]} keys registered for the mode (helpful for help dialogs)
 */
export function keysForMode(mode) {
  const table = KEYMAPS[mode] ?? {};
  return Object.keys(table);
}

/**
 * @param {{ addEventListener: Function, removeEventListener: Function }} target
 * @param {{ getMode: () => AppMode, dispatch: (action: string) => void }} ctx
 * @returns {() => void} unbind
 */
export function attachKeyboard(target, ctx) {
  const handler = (e) => {
    if (e.defaultPrevented) return;
    if (e.repeat && (e.key === ' ' || e.key.startsWith('Arrow'))) return;
    const action = resolveAction(ctx.getMode(), e.key, {
      ctrl: e.ctrlKey,
      meta: e.metaKey,
      alt: e.altKey,
    });
    if (!action) return;
    e.preventDefault();
    ctx.dispatch(action);
  };
  target.addEventListener('keydown', handler);
  return () => target.removeEventListener('keydown', handler);
}
