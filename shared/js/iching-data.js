// Datos canónicos compartidos entre todas las tools que tocan el I-Ching.
// 8 trigramas + 64 hexagramas + lookup. Una sola fuente de verdad.

// ─── TRIGRAMAS ─────────────────────────────────────────────
// lines = [bottom, middle, top], 1 = yang sólido, 0 = yin partido
export const TRIGRAMS = {
  qian: { key: 'qian', lines: [1, 1, 1], symbol: '☰', chinese: '乾', pinyin: 'Qián', english: 'Heaven',   spanish: 'Cielo',    element: 'Metal' },
  dui:  { key: 'dui',  lines: [1, 1, 0], symbol: '☱', chinese: '兌', pinyin: 'Duì',  english: 'Lake',     spanish: 'Lago',     element: 'Metal' },
  li:   { key: 'li',   lines: [1, 0, 1], symbol: '☲', chinese: '離', pinyin: 'Lí',   english: 'Fire',     spanish: 'Fuego',    element: 'Fire'  },
  zhen: { key: 'zhen', lines: [0, 0, 1], symbol: '☳', chinese: '震', pinyin: 'Zhèn', english: 'Thunder',  spanish: 'Trueno',   element: 'Wood'  },
  xun:  { key: 'xun',  lines: [0, 1, 1], symbol: '☴', chinese: '巽', pinyin: 'Xùn',  english: 'Wind',     spanish: 'Viento',   element: 'Wood'  },
  kan:  { key: 'kan',  lines: [0, 1, 0], symbol: '☵', chinese: '坎', pinyin: 'Kǎn',  english: 'Water',    spanish: 'Agua',     element: 'Water' },
  gen:  { key: 'gen',  lines: [1, 0, 0], symbol: '☶', chinese: '艮', pinyin: 'Gèn',  english: 'Mountain', spanish: 'Montaña',  element: 'Earth' },
  kun:  { key: 'kun',  lines: [0, 0, 0], symbol: '☷', chinese: '坤', pinyin: 'Kūn',  english: 'Earth',    spanish: 'Tierra',   element: 'Earth' },
};

// Orden Xiāntiān (先天 / Fu Xi). Índice 1..8 (la posición 0 queda vacía para indexar 1-based).
export const XIANTIAN_ORDER = [null, 'qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

export function trigramFromXiantianIndex(idx) {
  const key = XIANTIAN_ORDER[idx];
  if (!key) throw new Error(`Xiantian index out of range: ${idx}`);
  return TRIGRAMS[key];
}

// Devuelve la clave de un trigrama dado su array de 3 líneas [bottom, middle, top]
export function trigramKeyFromLines(lines) {
  for (const [key, t] of Object.entries(TRIGRAMS)) {
    if (t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]) {
      return key;
    }
  }
  throw new Error(`No trigram for lines: ${lines}`);
}

// ─── HEXAGRAMAS ─────────────────────────────────────────────
// Metadatos básicos de los 64 hexagramas (King Wen). Indexado 1..64.
export const HEXAGRAMS = {
  1:  { chinese: '乾',   pinyin: 'Qián',     english: 'The Creative',                 spanish: 'Lo Creativo',                          unicode: '䷀' },
  2:  { chinese: '坤',   pinyin: 'Kūn',      english: 'The Receptive',                spanish: 'Lo Receptivo',                          unicode: '䷁' },
  3:  { chinese: '屯',   pinyin: 'Zhūn',     english: 'Difficulty at the Beginning',  spanish: 'La Dificultad Inicial',                 unicode: '䷂' },
  4:  { chinese: '蒙',   pinyin: 'Méng',     english: 'Youthful Folly',               spanish: 'La Necedad Juvenil',                    unicode: '䷃' },
  5:  { chinese: '需',   pinyin: 'Xū',       english: 'Waiting',                      spanish: 'La Espera',                             unicode: '䷄' },
  6:  { chinese: '訟',   pinyin: 'Sòng',     english: 'Conflict',                     spanish: 'El Conflicto',                          unicode: '䷅' },
  7:  { chinese: '師',   pinyin: 'Shī',      english: 'The Army',                     spanish: 'El Ejército',                           unicode: '䷆' },
  8:  { chinese: '比',   pinyin: 'Bǐ',       english: 'Holding Together',             spanish: 'La Solidaridad',                        unicode: '䷇' },
  9:  { chinese: '小畜', pinyin: 'Xiǎo Xù',  english: 'Small Taming',                 spanish: 'La Fuerza Domesticadora de lo Pequeño', unicode: '䷈' },
  10: { chinese: '履',   pinyin: 'Lǚ',       english: 'Treading',                     spanish: 'El Andar',                              unicode: '䷉' },
  11: { chinese: '泰',   pinyin: 'Tài',      english: 'Peace',                        spanish: 'La Paz',                                unicode: '䷊' },
  12: { chinese: '否',   pinyin: 'Pǐ',       english: 'Standstill',                   spanish: 'El Estancamiento',                      unicode: '䷋' },
  13: { chinese: '同人', pinyin: 'Tóng Rén', english: 'Fellowship',                   spanish: 'La Comunidad',                          unicode: '䷌' },
  14: { chinese: '大有', pinyin: 'Dà Yǒu',   english: 'Great Possession',             spanish: 'La Posesión en Gran Medida',            unicode: '䷍' },
  15: { chinese: '謙',   pinyin: 'Qiān',     english: 'Modesty',                      spanish: 'La Modestia',                           unicode: '䷎' },
  16: { chinese: '豫',   pinyin: 'Yù',       english: 'Enthusiasm',                   spanish: 'El Entusiasmo',                         unicode: '䷏' },
  17: { chinese: '隨',   pinyin: 'Suí',      english: 'Following',                    spanish: 'El Seguimiento',                        unicode: '䷐' },
  18: { chinese: '蠱',   pinyin: 'Gǔ',       english: 'Work on the Decayed',          spanish: 'El Trabajo sobre lo Echado a Perder',   unicode: '䷑' },
  19: { chinese: '臨',   pinyin: 'Lín',      english: 'Approach',                     spanish: 'El Acercamiento',                       unicode: '䷒' },
  20: { chinese: '觀',   pinyin: 'Guān',     english: 'Contemplation',                spanish: 'La Contemplación',                      unicode: '䷓' },
  21: { chinese: '噬嗑', pinyin: 'Shì Kè',   english: 'Biting Through',               spanish: 'La Mordedura Tajante',                  unicode: '䷔' },
  22: { chinese: '賁',   pinyin: 'Bì',       english: 'Grace',                        spanish: 'La Gracia',                             unicode: '䷕' },
  23: { chinese: '剝',   pinyin: 'Bō',       english: 'Splitting Apart',              spanish: 'La Desintegración',                     unicode: '䷖' },
  24: { chinese: '復',   pinyin: 'Fù',       english: 'Return',                       spanish: 'El Retorno',                            unicode: '䷗' },
  25: { chinese: '無妄', pinyin: 'Wú Wàng',  english: 'Innocence',                    spanish: 'La Inocencia',                          unicode: '䷘' },
  26: { chinese: '大畜', pinyin: 'Dà Xù',    english: 'Great Taming',                 spanish: 'La Fuerza Domesticadora de lo Grande',  unicode: '䷙' },
  27: { chinese: '頤',   pinyin: 'Yí',       english: 'Nourishment',                  spanish: 'Las Comisuras de la Boca',              unicode: '䷚' },
  28: { chinese: '大過', pinyin: 'Dà Guò',   english: 'Great Excess',                 spanish: 'La Preponderancia de lo Grande',        unicode: '䷛' },
  29: { chinese: '坎',   pinyin: 'Kǎn',      english: 'The Abysmal',                  spanish: 'Lo Insondable, el Agua',                unicode: '䷜' },
  30: { chinese: '離',   pinyin: 'Lí',       english: 'The Clinging',                 spanish: 'Lo Adherente, el Fuego',                unicode: '䷝' },
  31: { chinese: '咸',   pinyin: 'Xián',     english: 'Influence',                    spanish: 'El Influjo',                            unicode: '䷞' },
  32: { chinese: '恆',   pinyin: 'Héng',     english: 'Duration',                     spanish: 'La Duración',                           unicode: '䷟' },
  33: { chinese: '遯',   pinyin: 'Dùn',      english: 'Retreat',                      spanish: 'La Retirada',                           unicode: '䷠' },
  34: { chinese: '大壯', pinyin: 'Dà Zhuàng', english: 'Great Power',                 spanish: 'El Poder de lo Grande',                 unicode: '䷡' },
  35: { chinese: '晉',   pinyin: 'Jìn',      english: 'Progress',                     spanish: 'El Progreso',                           unicode: '䷢' },
  36: { chinese: '明夷', pinyin: 'Míng Yí',  english: 'Darkening of the Light',       spanish: 'El Oscurecimiento de la Luz',           unicode: '䷣' },
  37: { chinese: '家人', pinyin: 'Jiā Rén',  english: 'The Family',                   spanish: 'La Familia',                            unicode: '䷤' },
  38: { chinese: '睽',   pinyin: 'Kuí',      english: 'Opposition',                   spanish: 'El Antagonismo',                        unicode: '䷥' },
  39: { chinese: '蹇',   pinyin: 'Jiǎn',     english: 'Obstruction',                  spanish: 'El Impedimento',                        unicode: '䷦' },
  40: { chinese: '解',   pinyin: 'Xiè',      english: 'Deliverance',                  spanish: 'La Liberación',                         unicode: '䷧' },
  41: { chinese: '損',   pinyin: 'Sǔn',      english: 'Decrease',                     spanish: 'La Merma',                              unicode: '䷨' },
  42: { chinese: '益',   pinyin: 'Yì',       english: 'Increase',                     spanish: 'El Aumento',                            unicode: '䷩' },
  43: { chinese: '夬',   pinyin: 'Guài',     english: 'Breakthrough',                 spanish: 'El Desbordamiento',                     unicode: '䷪' },
  44: { chinese: '姤',   pinyin: 'Gòu',      english: 'Coming to Meet',               spanish: 'El Ir al Encuentro',                    unicode: '䷫' },
  45: { chinese: '萃',   pinyin: 'Cuì',      english: 'Gathering Together',           spanish: 'La Reunión',                            unicode: '䷬' },
  46: { chinese: '升',   pinyin: 'Shēng',    english: 'Pushing Upward',               spanish: 'La Subida',                             unicode: '䷭' },
  47: { chinese: '困',   pinyin: 'Kùn',      english: 'Oppression',                   spanish: 'La Desazón',                            unicode: '䷮' },
  48: { chinese: '井',   pinyin: 'Jǐng',     english: 'The Well',                     spanish: 'El Pozo',                               unicode: '䷯' },
  49: { chinese: '革',   pinyin: 'Gé',       english: 'Revolution',                   spanish: 'La Revolución',                         unicode: '䷰' },
  50: { chinese: '鼎',   pinyin: 'Dǐng',     english: 'The Cauldron',                 spanish: 'El Caldero',                            unicode: '䷱' },
  51: { chinese: '震',   pinyin: 'Zhèn',     english: 'The Arousing',                 spanish: 'Lo Suscitativo',                        unicode: '䷲' },
  52: { chinese: '艮',   pinyin: 'Gèn',      english: 'Keeping Still',                spanish: 'El Aquietamiento',                      unicode: '䷳' },
  53: { chinese: '漸',   pinyin: 'Jiàn',     english: 'Development',                  spanish: 'El Desarrollo',                         unicode: '䷴' },
  54: { chinese: '歸妹', pinyin: 'Guī Mèi',  english: 'The Marrying Maiden',          spanish: 'La Muchacha que se Casa',               unicode: '䷵' },
  55: { chinese: '豐',   pinyin: 'Fēng',     english: 'Abundance',                    spanish: 'La Plenitud',                           unicode: '䷶' },
  56: { chinese: '旅',   pinyin: 'Lǚ',       english: 'The Wanderer',                 spanish: 'El Andariego',                          unicode: '䷷' },
  57: { chinese: '巽',   pinyin: 'Xùn',      english: 'The Gentle',                   spanish: 'Lo Suave',                              unicode: '䷸' },
  58: { chinese: '兌',   pinyin: 'Duì',      english: 'The Joyous',                   spanish: 'Lo Sereno',                             unicode: '䷹' },
  59: { chinese: '渙',   pinyin: 'Huàn',     english: 'Dispersion',                   spanish: 'La Disolución',                         unicode: '䷺' },
  60: { chinese: '節',   pinyin: 'Jié',      english: 'Limitation',                   spanish: 'La Restricción',                        unicode: '䷻' },
  61: { chinese: '中孚', pinyin: 'Zhōng Fú', english: 'Inner Truth',                  spanish: 'La Verdad Interior',                    unicode: '䷼' },
  62: { chinese: '小過', pinyin: 'Xiǎo Guò', english: 'Small Excess',                 spanish: 'La Preponderancia de lo Pequeño',       unicode: '䷽' },
  63: { chinese: '既濟', pinyin: 'Jì Jì',    english: 'After Completion',             spanish: 'Después de la Consumación',             unicode: '䷾' },
  64: { chinese: '未濟', pinyin: 'Wèi Jì',   english: 'Before Completion',            spanish: 'Antes de la Consumación',               unicode: '䷿' },
};

// Lookup: trigrama inferior + superior → número King Wen.
export const HEXAGRAM_LOOKUP = {
  qian: { qian: 1,  dui: 43, li: 14, zhen: 34, xun: 9,  kan: 5,  gen: 26, kun: 11 },
  dui:  { qian: 10, dui: 58, li: 38, zhen: 54, xun: 61, kan: 60, gen: 41, kun: 19 },
  li:   { qian: 13, dui: 49, li: 30, zhen: 55, xun: 37, kan: 63, gen: 22, kun: 36 },
  zhen: { qian: 25, dui: 17, li: 21, zhen: 51, xun: 42, kan: 3,  gen: 27, kun: 24 },
  xun:  { qian: 44, dui: 28, li: 50, zhen: 32, xun: 57, kan: 48, gen: 18, kun: 46 },
  kan:  { qian: 6,  dui: 47, li: 64, zhen: 40, xun: 59, kan: 29, gen: 4,  kun: 7  },
  gen:  { qian: 33, dui: 31, li: 56, zhen: 62, xun: 53, kan: 39, gen: 52, kun: 15 },
  kun:  { qian: 12, dui: 45, li: 35, zhen: 16, xun: 20, kan: 8,  gen: 23, kun: 2  },
};

export function hexagramNumberFromTrigrams(lowerKey, upperKey) {
  const row = HEXAGRAM_LOOKUP[lowerKey];
  if (!row) throw new Error(`Unknown lower trigram: ${lowerKey}`);
  const num = row[upperKey];
  if (!num) throw new Error(`Unknown upper trigram: ${upperKey}`);
  return num;
}

// Compone un hexagrama a partir de las claves de trigrama. Devuelve líneas [l1..l6] bottom-up.
export function composeHexagram(lowerKey, upperKey) {
  const lower = TRIGRAMS[lowerKey];
  const upper = TRIGRAMS[upperKey];
  if (!lower) throw new Error(`Unknown lower trigram key: ${lowerKey}`);
  if (!upper) throw new Error(`Unknown upper trigram key: ${upperKey}`);

  const number = hexagramNumberFromTrigrams(lowerKey, upperKey);
  const data = HEXAGRAMS[number];
  const lines = [...lower.lines, ...upper.lines]; // [l1, l2, l3, l4, l5, l6] bottom-up

  return {
    number,
    chinese: data.chinese,
    pinyin: data.pinyin,
    english: data.english,
    spanish: data.spanish,
    unicode: data.unicode,
    upperTrigram: upper,
    lowerTrigram: lower,
    lines,
  };
}

// Hexagrama derivado: cambia (yin↔yang) la línea `lineIndex` (1..6) del natal.
export function deriveHexagram(natal, lineIndex) {
  if (lineIndex < 1 || lineIndex > 6) {
    throw new Error(`Line index out of range: ${lineIndex}`);
  }
  const flipped = [...natal.lines];
  flipped[lineIndex - 1] = flipped[lineIndex - 1] === 1 ? 0 : 1;

  const newLowerLines = flipped.slice(0, 3);
  const newUpperLines = flipped.slice(3, 6);
  const newLowerKey = trigramKeyFromLines(newLowerLines);
  const newUpperKey = trigramKeyFromLines(newUpperLines);

  return composeHexagram(newLowerKey, newUpperKey);
}

// Convierte las líneas [l1..l6] bottom-up a un binary string '1'/'0' para indexar
// el JSON de interpretaciones (también bottom-up).
export function linesToBinary(lines) {
  return lines.map((l) => (l === 1 ? '1' : '0')).join('');
}
