/** @typedef {{ word: string, zh: string, note?: string }} VocabHint */
/** @typedef {{ start: number, end: number, speaker: string, es: string, zh: string, vocab?: string[] }} Line */
/** @typedef {{ id: string, showId: string, title: string, titleZh: string, duration: number, level: string, lines: Line[], quiz: { q: string, options: string[], answer: number, explain?: string }[] }} Scene */

/** @type {Scene[]} */
export const SCENES = [
  {
    id: 'lcdp-plan',
    showId: 'lcdp',
    title: 'El plan del Profesor',
    titleZh: '教授的计划',
    duration: 38,
    level: 'B1',
    lines: [
      { start: 0, end: 5, speaker: 'Profesor', es: 'Empezamos la operación más importante de nuestras vidas.', zh: '我们开始一生中最重要的一次行动。', vocab: ['operación', 'importante'] },
      { start: 5, end: 10, speaker: 'Profesor', es: 'No habrá nombres, no habrá vínculos personales.', zh: '没有名字，没有私人羁绊。', vocab: ['vínculos', 'personales'] },
      { start: 10, end: 16, speaker: 'Profesor', es: 'Solo tendremos una misión: entrar, imprimir dinero y salir.', zh: '我们只有一个任务：进去、印钱、出来。', vocab: ['misión', 'imprimir'] },
      { start: 16, end: 22, speaker: 'Tokio', es: '¿Y si algo sale mal? Siempre sale mal.', zh: '要是出错了呢？总会出错的。', vocab: ['sale mal'] },
      { start: 22, end: 28, speaker: 'Profesor', es: 'Por eso llevamos años preparando cada detalle.', zh: '所以我们花了好几年准备每个细节。', vocab: ['preparando', 'detalle'] },
      { start: 28, end: 38, speaker: 'Profesor', es: 'Resistir, negociar y no perder la cabeza. Esa es la clave.', zh: '坚持、谈判、保持冷静。这就是关键。', vocab: ['resistir', 'negociar', 'clave'] },
    ],
    quiz: [
      { q: '「no habrá vínculos personales」是什么意思？', options: ['没有私人关系', '没有个人证件', '没有私人房间', '没有个人武器'], answer: 0, explain: 'vínculo = 联系、羁绊' },
      { q: 'Tokio 担心什么？', options: ['计划太简单', '总会出错', '钱印太少', '警察不来'], answer: 1 },
      { q: 'Profesor 说的 clave 指？', options: ['钥匙', '关键/要领', '密码', '门锁'], answer: 1 },
    ],
  },
  {
    id: 'lcdp-negociar',
    showId: 'lcdp',
    title: 'Negociación con la policía',
    titleZh: '与警方谈判',
    duration: 32,
    level: 'B1',
    lines: [
      { start: 0, end: 6, speaker: 'Profesor', es: 'Queremos garantías para los rehenes.', zh: '我们要人质的保障。', vocab: ['garantías', 'rehenes'] },
      { start: 6, end: 12, speaker: 'Raquel', es: 'Usted no está en posición de exigir nada.', zh: '你没有资格提任何要求。', vocab: ['posición', 'exigir'] },
      { start: 12, end: 18, speaker: 'Profesor', es: 'Estoy en la posición de quien tiene la información.', zh: '我处在掌握信息的一方。', vocab: ['información'] },
      { start: 18, end: 24, speaker: 'Raquel', es: 'Hable claro. ¿Qué quiere a cambio?', zh: '说清楚。你要什么交换条件？', vocab: ['a cambio'] },
      { start: 24, end: 32, speaker: 'Profesor', es: 'Tiempo. Solo necesitamos más tiempo.', zh: '时间。我们只需要更多时间。', vocab: ['necesitamos'] },
    ],
    quiz: [
      { q: 'rehenes 的意思是？', options: ['人质', '劫匪', '警察', '记者'], answer: 0 },
      { q: 'a cambio 表示？', options: ['顺便', '作为交换', '改变主意', '换频道'], answer: 1 },
    ],
  },
  {
    id: 'elite-bienvenida',
    showId: 'elite',
    title: 'Bienvenida a Las Encinas',
    titleZh: '欢迎来到 Las Encinas',
    duration: 30,
    level: 'B1',
    lines: [
      { start: 0, end: 6, speaker: 'Samuel', es: 'Nunca imaginé que estudiaría aquí.', zh: '从没想过我会在这里上学。', vocab: ['imaginé', 'estudiaría'] },
      { start: 6, end: 12, speaker: 'Christian', es: 'Relájate, todos miran pero nadie muerde.', zh: '放松，大家都在看但不会咬人。', vocab: ['relájate', 'miran'] },
      { start: 12, end: 18, speaker: 'Nadia', es: 'No confundas curiosidad con amistad.', zh: '别把好奇当成友谊。', vocab: ['confundas', 'amistad'] },
      { start: 18, end: 24, speaker: 'Lu', es: 'Aquí las reglas las ponen quienes pagan.', zh: '这里的规则由付钱的人定。', vocab: ['reglas', 'pagan'] },
      { start: 24, end: 30, speaker: 'Samuel', es: 'Entonces tendré que aprenderlas rápido.', zh: '那我得快点学会这些规则。', vocab: ['aprenderlas'] },
    ],
    quiz: [
      { q: '「Relájate」相当于？', options: ['快跑', '放松', '闭嘴', '回去'], answer: 1 },
      { q: 'Nadia 提醒不要混淆什么？', options: ['课程与考试', '好奇与友谊', '老师与家长', '运动与学习'], answer: 1 },
    ],
  },
  {
    id: 'elite-fiesta',
    showId: 'elite',
    title: 'La fiesta en la piscina',
    titleZh: '泳池派对',
    duration: 28,
    level: 'A2',
    lines: [
      { start: 0, end: 5, speaker: 'Guzmán', es: '¿Quién ha traído más botellas?', zh: '谁带了更多酒瓶？', vocab: ['traído', 'botellas'] },
      { start: 5, end: 10, speaker: 'Marina', es: 'Esta noche no pienso irme temprano.', zh: '今晚我不打算早走。', vocab: ['pienso', 'temprano'] },
      { start: 10, end: 16, speaker: 'Ander', es: 'Cuidado, los profesores viven a dos calles.', zh: '小心，老师们就住在两条街外。', vocab: ['cuidado', 'calles'] },
      { start: 16, end: 22, speaker: 'Omar', es: 'Si nos descubren, diremos que es un club de lectura.', zh: '要是被发现，就说这是读书俱乐部。', vocab: ['descubren', 'lectura'] },
      { start: 22, end: 28, speaker: 'Todos', es: '¡Salud!', zh: '干杯！', vocab: ['salud'] },
    ],
    quiz: [
      { q: '「¡Salud!」在派对中常表示？', options: ['祝你健康/干杯', '你生病了', '请坐', '再见'], answer: 0 },
      { q: 'temprano 的意思是？', options: ['迟到', '早', '晚', '偶尔'], answer: 1 },
    ],
  },
  {
    id: 'visavis-celda',
    showId: 'visavis',
    title: 'Primera noche en la celda',
    titleZh: '牢房第一夜',
    duration: 34,
    level: 'B2',
    lines: [
      { start: 0, end: 7, speaker: 'Maca', es: 'Aquí dentro el tiempo se vuelve pegamento.', zh: '在这里时间像胶水一样黏住。', vocab: ['dentro', 'pegamento'] },
      { start: 7, end: 14, speaker: 'Zulema', es: 'No me mires así si no quieres problemas.', zh: '不想惹事就别那样看我。', vocab: ['problemas', 'mires'] },
      { start: 14, end: 20, speaker: 'Maca', es: 'Solo busco un sitio donde dormir sin miedo.', zh: '我只想找个能不害怕睡觉的地方。', vocab: ['busco', 'miedo'] },
      { start: 20, end: 27, speaker: 'Anabel', es: 'La miedo se respeta o se paga caro.', zh: '恐惧要么被尊重，要么代价很高。', vocab: ['respeta', 'paga caro'] },
      { start: 27, end: 34, speaker: 'Maca', es: 'Entendido. Cerraré la boca y abriré los ojos.', zh: '明白了。我会闭嘴、睁大眼睛。', vocab: ['entendido', 'cerraré'] },
    ],
    quiz: [
      { q: '「paga caro」在这里指？', options: ['付很多钱', '付出代价', '买贵的', '很便宜'], answer: 1 },
      { q: 'Maca 想要什么？', options: ['打电话', '安全睡觉', '换监狱', '见法官'], answer: 1 },
    ],
  },
  {
    id: 'narcos-plata',
    showId: 'narcos',
    title: 'Plata o plomo',
    titleZh: '银弹还是铅弹',
    duration: 30,
    level: 'B2',
    lines: [
      { start: 0, end: 6, speaker: 'Pablo', es: 'En este negocio uno decide rápido o muere lento.', zh: '这行里要么快做决定，要么慢慢等死。', vocab: ['negocio', 'decide'] },
      { start: 6, end: 12, speaker: 'Pablo', es: 'Plata o plomo, esa es la oferta.', zh: '要钱还是要命，这就是条件。', vocab: ['plata', 'plomo', 'oferta'] },
      { start: 12, end: 18, speaker: 'Teniente', es: 'Usted no compra a la policía colombiana.', zh: '你买不到哥伦比亚警察。', vocab: ['compra', 'policía'] },
      { start: 18, end: 24, speaker: 'Pablo', es: 'Todo el mundo tiene un precio, patrón.', zh: '每个人都有价码，长官。', vocab: ['precio', 'patrón'] },
      { start: 24, end: 30, speaker: 'Teniente', es: 'El mío es más alto de lo que cree.', zh: '我的价比你想的更高。', vocab: ['cree'] },
    ],
    quiz: [
      { q: '「plata o plomo」在拉美俚语中？', options: ['银或铅', '贿赂或威胁', '早或晚', '进或出'], answer: 1 },
      { q: 'patrón 在这里是对谁的称呼？', options: ['老板/长官', '父亲', '医生', '司机'], answer: 0 },
    ],
  },
  {
    id: 'flores-secreto',
    showId: 'flores',
    title: 'El secreto de la familia',
    titleZh: '家族秘密',
    duration: 28,
    level: 'B1',
    lines: [
      { start: 0, end: 6, speaker: 'Paulina', es: 'En esta casa las sonrisas son decoración.', zh: '在这个家里，笑容只是装饰。', vocab: ['sonrisas', 'decoración'] },
      { start: 6, end: 12, speaker: 'Ernesto', es: 'No vuelvas a mencionar ese nombre en la cena.', zh: '晚宴上别再提那个名字。', vocab: ['mencionar', 'cena'] },
      { start: 12, end: 18, speaker: 'Julián', es: '¿Decoración o mentira? Ya no sé la diferencia.', zh: '装饰还是谎言？我已分不清。', vocab: ['mentira', 'diferencia'] },
      { start: 18, end: 24, speaker: 'Paulina', es: 'La diferencia es quién limpia el desastre.', zh: '区别在于谁来收拾烂摊子。', vocab: ['limpia', 'desastre'] },
      { start: 24, end: 28, speaker: 'Ernesto', es: 'Entonces que empiece la limpieza.', zh: '那就开始清理吧。', vocab: ['limpieza'] },
    ],
    quiz: [
      { q: '「limpiar el desastre」比喻？', options: ['打扫卫生', '收拾烂摊子', '洗衣服', '擦桌子'], answer: 1 },
    ],
  },
  {
    id: 'cable-trabajo',
    showId: 'cable',
    title: 'Primer día de trabajo',
    titleZh: '上班第一天',
    duration: 32,
    level: 'A2',
    lines: [
      { start: 0, end: 6, speaker: 'Lidia', es: 'Buenos días, soy la nueva operadora.', zh: '早上好，我是新来的接线员。', vocab: ['operadora', 'nueva'] },
      { start: 6, end: 12, speaker: 'Carlota', es: 'Conecta con calma, las líneas no se van.', zh: '慢慢接线，线路跑不了。', vocab: ['conecta', 'calma', 'líneas'] },
      { start: 12, end: 18, speaker: 'Ángeles', es: 'Si te equivocas, pide ayuda sin vergüenza.', zh: '搞错了就求助，别不好意思。', vocab: ['equivocas', 'vergüenza', 'ayuda'] },
      { start: 18, end: 24, speaker: 'Margarita', es: 'Aquí aprendemos juntas o no aprendemos.', zh: '我们要么一起学，要么学不成。', vocab: ['aprendemos', 'juntas'] },
      { start: 24, end: 32, speaker: 'Lidia', es: 'Gracias. Quiero hacerlo bien desde el principio.', zh: '谢谢。我想从一开始就做好。', vocab: ['principio', 'bien'] },
    ],
    quiz: [
      { q: 'operadora 的职业是？', options: ['接线员', '司机', '护士', '厨师'], answer: 0 },
      { q: 'sin vergüenza 表示？', options: ['不要脸', '不要害羞', '不要说话', '不要迟到'], answer: 1 },
    ],
  },
  {
    id: 'lcdp-bella',
    showId: 'lcdp',
    title: 'Bella ciao',
    titleZh: '《啊，朋友再见》',
    duration: 24,
    level: 'A2',
    lines: [
      { start: 0, end: 8, speaker: 'Todos', es: 'Una mattina mi son svegliato, o bella ciao, bella ciao, bella ciao ciao ciao.', zh: '一天早上我醒来——啊，朋友再见。（意语歌词）', vocab: ['mattina'] },
      { start: 8, end: 16, speaker: 'Berlín', es: 'Canta más fuerte, que esto es historia.', zh: '唱大声点，这可是历史。', vocab: ['canta', 'historia'] },
      { start: 16, end: 24, speaker: 'Nairobi', es: 'Hoy somos libres aunque mañana no lo seamos.', zh: '今天我们自由，哪怕明天不是。', vocab: ['libres', 'mañana'] },
    ],
    quiz: [
      { q: '「más fuerte」的意思是？', options: ['更弱', '更大声/更强', '更慢', '更远'], answer: 1 },
    ],
  },
  {
    id: 'narcos-negocio',
    showId: 'narcos',
    title: 'El negocio crece',
    titleZh: '生意扩张',
    duration: 26,
    level: 'B2',
    lines: [
      { start: 0, end: 6, speaker: 'Escobar', es: 'Medellín no es un pueblo, es un mercado.', zh: '麦德林不是小镇，是市场。', vocab: ['mercado', 'pueblo'] },
      { start: 6, end: 12, speaker: 'Cockroach', es: 'Cada avión que aterriza trae oportunidad.', zh: '每一架降落的飞机都带来机会。', vocab: ['aterriza', 'oportunidad'] },
      { start: 12, end: 18, speaker: 'Escobar', es: 'Y cada oportunidad trae enemigos.', zh: '每个机会也带来敌人。', vocab: ['enemigos'] },
      { start: 18, end: 26, speaker: 'Cockroach', es: 'Entonces expandimos antes de que nos cierren.', zh: '那就在他们封杀我们之前扩张。', vocab: ['expandimos', 'cierren'] },
    ],
    quiz: [
      { q: 'aterriza 来自动词 aterrizar，意思是？', options: ['起飞', '降落', '延误', '登机'], answer: 1 },
    ],
  },
];

/** @param {string} showId */
export function scenesForShow(showId) {
  return SCENES.filter((s) => s.showId === showId);
}

/** @param {string} id */
export function getScene(id) {
  return SCENES.find((s) => s.id === id) ?? null;
}
