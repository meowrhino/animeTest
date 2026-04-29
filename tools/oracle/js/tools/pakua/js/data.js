// ============================================================
// data.js — Trigramas, hexagramas y lookup matrix del I Ching
// ============================================================

// 8 trigramas: lines = [bottom, middle, top], 1=yang(sólido), 0=yin(partido)
export const TRIGRAMS = {
  qian: { key: 'qian', lines: [1,1,1], symbol: '☰', chinese: '乾', pinyin: 'Qián',  english: 'Heaven',   element: 'Metal'  },
  dui:  { key: 'dui',  lines: [1,1,0], symbol: '☱', chinese: '兌', pinyin: 'Duì',   english: 'Lake',     element: 'Metal'  },
  li:   { key: 'li',   lines: [1,0,1], symbol: '☲', chinese: '離', pinyin: 'Lí',    english: 'Fire',     element: 'Fire'   },
  zhen: { key: 'zhen', lines: [0,0,1], symbol: '☳', chinese: '震', pinyin: 'Zhèn',  english: 'Thunder',  element: 'Wood'   },
  xun:  { key: 'xun',  lines: [0,1,1], symbol: '☴', chinese: '巽', pinyin: 'Xùn',   english: 'Wind',     element: 'Wood'   },
  kan:  { key: 'kan',  lines: [0,1,0], symbol: '☵', chinese: '坎', pinyin: 'Kǎn',   english: 'Water',    element: 'Water'  },
  gen:  { key: 'gen',  lines: [1,0,0], symbol: '☶', chinese: '艮', pinyin: 'Gèn',   english: 'Mountain', element: 'Earth'  },
  kun:  { key: 'kun',  lines: [0,0,0], symbol: '☷', chinese: '坤', pinyin: 'Kūn',   english: 'Earth',    element: 'Earth'  },
};

// Orden de caras del prisma (índice 0 = cara frontal inicial, sentido horario)
// Pakua Anterior (Xiantian / Fu Xi) — prisma superior
export const XIANTIAN_ORDER = ['qian', 'xun', 'kan', 'gen', 'kun', 'zhen', 'li', 'dui'];

// Pakua Posterior (Houtian / Rey Wen) — prisma inferior
export const HOUTIAN_ORDER = ['li', 'kun', 'dui', 'qian', 'kan', 'gen', 'zhen', 'xun'];

// Lookup: HEXAGRAM_LOOKUP[lower][upper] = número King Wen (1-64)
export const HEXAGRAM_LOOKUP = {
  qian: { qian:1,  dui:43, li:14, zhen:34, xun:9,  kan:5,  gen:26, kun:11 },
  dui:  { qian:10, dui:58, li:38, zhen:54, xun:61, kan:60, gen:41, kun:19 },
  li:   { qian:13, dui:49, li:30, zhen:55, xun:37, kan:63, gen:22, kun:36 },
  zhen: { qian:25, dui:17, li:21, zhen:51, xun:42, kan:3,  gen:27, kun:24 },
  xun:  { qian:44, dui:28, li:50, zhen:32, xun:57, kan:48, gen:18, kun:46 },
  kan:  { qian:6,  dui:47, li:64, zhen:40, xun:59, kan:29, gen:4,  kun:7  },
  gen:  { qian:33, dui:31, li:56, zhen:62, xun:53, kan:39, gen:52, kun:15 },
  kun:  { qian:12, dui:45, li:35, zhen:16, xun:20, kan:8,  gen:23, kun:2  },
};

// 64 hexagramas: número → datos
export const HEXAGRAMS = {
  1:  { chinese: '乾', pinyin: 'Qián',     english: 'The Creative',              unicode: '䷀' },
  2:  { chinese: '坤', pinyin: 'Kūn',      english: 'The Receptive',             unicode: '䷁' },
  3:  { chinese: '屯', pinyin: 'Zhūn',     english: 'Difficulty at the Beginning', unicode: '䷂' },
  4:  { chinese: '蒙', pinyin: 'Méng',     english: 'Youthful Folly',            unicode: '䷃' },
  5:  { chinese: '需', pinyin: 'Xū',       english: 'Waiting',                   unicode: '䷄' },
  6:  { chinese: '訟', pinyin: 'Sòng',     english: 'Conflict',                  unicode: '䷅' },
  7:  { chinese: '師', pinyin: 'Shī',      english: 'The Army',                  unicode: '䷆' },
  8:  { chinese: '比', pinyin: 'Bǐ',       english: 'Holding Together',          unicode: '䷇' },
  9:  { chinese: '小畜', pinyin: 'Xiǎo Xù', english: 'Small Taming',            unicode: '䷈' },
  10: { chinese: '履', pinyin: 'Lǚ',       english: 'Treading',                  unicode: '䷉' },
  11: { chinese: '泰', pinyin: 'Tài',      english: 'Peace',                     unicode: '䷊' },
  12: { chinese: '否', pinyin: 'Pǐ',       english: 'Standstill',               unicode: '䷋' },
  13: { chinese: '同人', pinyin: 'Tóng Rén', english: 'Fellowship',              unicode: '䷌' },
  14: { chinese: '大有', pinyin: 'Dà Yǒu',  english: 'Great Possession',         unicode: '䷍' },
  15: { chinese: '謙', pinyin: 'Qiān',     english: 'Modesty',                   unicode: '䷎' },
  16: { chinese: '豫', pinyin: 'Yù',       english: 'Enthusiasm',                unicode: '䷏' },
  17: { chinese: '隨', pinyin: 'Suí',      english: 'Following',                 unicode: '䷐' },
  18: { chinese: '蠱', pinyin: 'Gǔ',       english: 'Work on the Decayed',       unicode: '䷑' },
  19: { chinese: '臨', pinyin: 'Lín',      english: 'Approach',                  unicode: '䷒' },
  20: { chinese: '觀', pinyin: 'Guān',     english: 'Contemplation',             unicode: '䷓' },
  21: { chinese: '噬嗑', pinyin: 'Shì Kè',  english: 'Biting Through',           unicode: '䷔' },
  22: { chinese: '賁', pinyin: 'Bì',       english: 'Grace',                     unicode: '䷕' },
  23: { chinese: '剝', pinyin: 'Bō',       english: 'Splitting Apart',           unicode: '䷖' },
  24: { chinese: '復', pinyin: 'Fù',       english: 'Return',                    unicode: '䷗' },
  25: { chinese: '無妄', pinyin: 'Wú Wàng', english: 'Innocence',                unicode: '䷘' },
  26: { chinese: '大畜', pinyin: 'Dà Xù',   english: 'Great Taming',             unicode: '䷙' },
  27: { chinese: '頤', pinyin: 'Yí',       english: 'Nourishment',               unicode: '䷚' },
  28: { chinese: '大過', pinyin: 'Dà Guò',  english: 'Great Excess',             unicode: '䷛' },
  29: { chinese: '坎', pinyin: 'Kǎn',      english: 'The Abysmal',              unicode: '䷜' },
  30: { chinese: '離', pinyin: 'Lí',       english: 'The Clinging',              unicode: '䷝' },
  31: { chinese: '咸', pinyin: 'Xián',     english: 'Influence',                 unicode: '䷞' },
  32: { chinese: '恆', pinyin: 'Héng',     english: 'Duration',                  unicode: '䷟' },
  33: { chinese: '遯', pinyin: 'Dùn',      english: 'Retreat',                   unicode: '䷠' },
  34: { chinese: '大壯', pinyin: 'Dà Zhuàng', english: 'Great Power',            unicode: '䷡' },
  35: { chinese: '晉', pinyin: 'Jìn',      english: 'Progress',                  unicode: '䷢' },
  36: { chinese: '明夷', pinyin: 'Míng Yí',  english: 'Darkening of the Light',   unicode: '䷣' },
  37: { chinese: '家人', pinyin: 'Jiā Rén',  english: 'The Family',               unicode: '䷤' },
  38: { chinese: '睽', pinyin: 'Kuí',      english: 'Opposition',                unicode: '䷥' },
  39: { chinese: '蹇', pinyin: 'Jiǎn',     english: 'Obstruction',               unicode: '䷦' },
  40: { chinese: '解', pinyin: 'Xiè',      english: 'Deliverance',               unicode: '䷧' },
  41: { chinese: '損', pinyin: 'Sǔn',      english: 'Decrease',                  unicode: '䷨' },
  42: { chinese: '益', pinyin: 'Yì',       english: 'Increase',                  unicode: '䷩' },
  43: { chinese: '夬', pinyin: 'Guài',     english: 'Breakthrough',              unicode: '䷪' },
  44: { chinese: '姤', pinyin: 'Gòu',      english: 'Coming to Meet',            unicode: '䷫' },
  45: { chinese: '萃', pinyin: 'Cuì',      english: 'Gathering Together',        unicode: '䷬' },
  46: { chinese: '升', pinyin: 'Shēng',    english: 'Pushing Upward',            unicode: '䷭' },
  47: { chinese: '困', pinyin: 'Kùn',      english: 'Oppression',                unicode: '䷮' },
  48: { chinese: '井', pinyin: 'Jǐng',     english: 'The Well',                  unicode: '䷯' },
  49: { chinese: '革', pinyin: 'Gé',       english: 'Revolution',                unicode: '䷰' },
  50: { chinese: '鼎', pinyin: 'Dǐng',     english: 'The Cauldron',              unicode: '䷱' },
  51: { chinese: '震', pinyin: 'Zhèn',     english: 'The Arousing',              unicode: '䷲' },
  52: { chinese: '艮', pinyin: 'Gèn',      english: 'Keeping Still',             unicode: '䷳' },
  53: { chinese: '漸', pinyin: 'Jiàn',     english: 'Development',               unicode: '䷴' },
  54: { chinese: '歸妹', pinyin: 'Guī Mèi', english: 'The Marrying Maiden',      unicode: '䷵' },
  55: { chinese: '豐', pinyin: 'Fēng',     english: 'Abundance',                 unicode: '䷶' },
  56: { chinese: '旅', pinyin: 'Lǚ',       english: 'The Wanderer',              unicode: '䷷' },
  57: { chinese: '巽', pinyin: 'Xùn',      english: 'The Gentle',                unicode: '䷸' },
  58: { chinese: '兌', pinyin: 'Duì',      english: 'The Joyous',                unicode: '䷹' },
  59: { chinese: '渙', pinyin: 'Huàn',     english: 'Dispersion',                unicode: '䷺' },
  60: { chinese: '節', pinyin: 'Jié',      english: 'Limitation',                unicode: '䷻' },
  61: { chinese: '中孚', pinyin: 'Zhōng Fú', english: 'Inner Truth',             unicode: '䷼' },
  62: { chinese: '小過', pinyin: 'Xiǎo Guò', english: 'Small Excess',            unicode: '䷽' },
  63: { chinese: '既濟', pinyin: 'Jì Jì',    english: 'After Completion',         unicode: '䷾' },
  64: { chinese: '未濟', pinyin: 'Wèi Jì',   english: 'Before Completion',        unicode: '䷿' },
};
