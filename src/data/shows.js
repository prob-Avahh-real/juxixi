/** @typedef {{ id: string, title: string, titleZh: string, region: string, level: string, genre: string, accent: string, emoji: string, blurb: string }} Show */

/** @type {Show[]} */
export const SHOWS = [
  {
    id: 'lcdp',
    title: 'La Casa de Papel',
    titleZh: '纸钞屋',
    region: '西班牙',
    level: 'B1',
    genre: '惊悚',
    accent: '半岛西语',
    emoji: '🎭',
    blurb: '劫匪与警察的智斗，口语密集、情绪饱满，适合练听力与地道表达。',
  },
  {
    id: 'elite',
    title: 'Élite',
    titleZh: '名校风暴',
    region: '西班牙',
    level: 'B1',
    genre: '青春悬疑',
    accent: '半岛西语',
    emoji: '🏫',
    blurb: '精英学校里的秘密与冲突，日常对话多，适合积累生活词汇。',
  },
  {
    id: 'visavis',
    title: 'Vis a vis',
    titleZh: '面对面',
    region: '西班牙',
    level: 'B2',
    genre: '监狱剧',
    accent: '半岛西语',
    emoji: '🔒',
    blurb: '女子监狱群像，俚语与情绪表达丰富，语速偏快。',
  },
  {
    id: 'narcos',
    title: 'Narcos',
    titleZh: '毒枭',
    region: '哥伦比亚',
    level: 'B2',
    genre: '犯罪传记',
    accent: '拉美西语',
    emoji: '🌴',
    blurb: '哥伦比亚口音与历史叙事并存，适合适应拉美发音。',
  },
  {
    id: 'flores',
    title: 'La Casa de las Flores',
    titleZh: '花之屋',
    region: '墨西哥',
    level: 'B1',
    genre: '黑色喜剧',
    accent: '墨西哥西语',
    emoji: '🌸',
    blurb: '上流家庭闹剧，墨西哥口音清晰，幽默与讽刺并存。',
  },
  {
    id: 'cable',
    title: 'Las chicas del cable',
    titleZh: '接线女孩',
    region: '西班牙',
    level: 'A2',
    genre: '年代剧',
    accent: '半岛西语',
    emoji: '☎️',
    blurb: '1920 年代马德里，语速适中，适合初中级跟读。',
  },
];

/** @param {string} id */
export function getShow(id) {
  return SHOWS.find((s) => s.id === id) ?? null;
}
