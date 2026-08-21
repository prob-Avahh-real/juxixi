/** @typedef {{ id: string, es: string, zh: string, showId: string, sceneId: string, note?: string }} VocabCard */

/** @type {VocabCard[]} */
export const VOCAB = [
  { id: 'v-operacion', es: 'la operación', zh: '行动、手术', showId: 'lcdp', sceneId: 'lcdp-plan', note: '可数名词，复数 operaciones' },
  { id: 'v-vinculos', es: 'los vínculos', zh: '联系、羁绊', showId: 'lcdp', sceneId: 'lcdp-plan' },
  { id: 'v-mision', es: 'la misión', zh: '任务', showId: 'lcdp', sceneId: 'lcdp-plan' },
  { id: 'v-sale-mal', es: 'salir mal', zh: '出错、搞砸', showId: 'lcdp', sceneId: 'lcdp-plan', note: '动词短语' },
  { id: 'v-resistir', es: 'resistir', zh: '坚持、抵抗', showId: 'lcdp', sceneId: 'lcdp-plan' },
  { id: 'v-negociar', es: 'negociar', zh: '谈判', showId: 'lcdp', sceneId: 'lcdp-plan' },
  { id: 'v-clave', es: 'la clave', zh: '关键、密码', showId: 'lcdp', sceneId: 'lcdp-plan' },
  { id: 'v-rehenes', es: 'los rehenes', zh: '人质', showId: 'lcdp', sceneId: 'lcdp-negociar' },
  { id: 'v-exigir', es: 'exigir', zh: '要求、苛求', showId: 'lcdp', sceneId: 'lcdp-negociar' },
  { id: 'v-cambio', es: 'a cambio', zh: '作为交换', showId: 'lcdp', sceneId: 'lcdp-negociar', note: '固定短语' },
  { id: 'v-relajate', es: 'relajarse', zh: '放松', showId: 'elite', sceneId: 'elite-bienvenida', note: '命令式 Relájate' },
  { id: 'v-amistad', es: 'la amistad', zh: '友谊', showId: 'elite', sceneId: 'elite-bienvenida' },
  { id: 'v-reglas', es: 'las reglas', zh: '规则', showId: 'elite', sceneId: 'elite-bienvenida' },
  { id: 'v-salud', es: '¡salud!', zh: '干杯；祝你健康', showId: 'elite', sceneId: 'elite-fiesta' },
  { id: 'v-temprano', es: 'temprano', zh: '早', showId: 'elite', sceneId: 'elite-fiesta' },
  { id: 'v-miedo', es: 'el miedo', zh: '恐惧', showId: 'visavis', sceneId: 'visavis-celda' },
  { id: 'v-paga-caro', es: 'pagar caro', zh: '付出高昂代价', showId: 'visavis', sceneId: 'visavis-celda' },
  { id: 'v-plata-plomo', es: 'plata o plomo', zh: '贿赂或暴力威胁', showId: 'narcos', sceneId: 'narcos-plata', note: '拉美俚语' },
  { id: 'v-precio', es: 'el precio', zh: '价格；代价', showId: 'narcos', sceneId: 'narcos-plata' },
  { id: 'v-patron', es: 'el patrón', zh: '老板；长官', showId: 'narcos', sceneId: 'narcos-plata' },
  { id: 'v-mentira', es: 'la mentira', zh: '谎言', showId: 'flores', sceneId: 'flores-secreto' },
  { id: 'v-desastre', es: 'el desastre', zh: '灾难；烂摊子', showId: 'flores', sceneId: 'flores-secreto' },
  { id: 'v-operadora', es: 'la operadora', zh: '女接线员', showId: 'cable', sceneId: 'cable-trabajo' },
  { id: 'v-verguenza', es: 'la vergüenza', zh: '羞耻、不好意思', showId: 'cable', sceneId: 'cable-trabajo' },
  { id: 'v-libres', es: 'libre / libres', zh: '自由的', showId: 'lcdp', sceneId: 'lcdp-bella' },
  { id: 'v-aterrizar', es: 'aterrizar', zh: '降落', showId: 'narcos', sceneId: 'narcos-negocio' },
  { id: 'v-oportunidad', es: 'la oportunidad', zh: '机会', showId: 'narcos', sceneId: 'narcos-negocio' },
  { id: 'v-enemigos', es: 'los enemigos', zh: '敌人', showId: 'narcos', sceneId: 'narcos-negocio' },
];

/** @param {string} [showId] */
export function filterVocab(showId) {
  if (!showId) return [...VOCAB];
  return VOCAB.filter((v) => v.showId === showId);
}

/** @param {string} sceneId */
export function vocabForScene(sceneId) {
  return VOCAB.filter((v) => v.sceneId === sceneId);
}
