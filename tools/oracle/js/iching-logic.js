// Pure logic of the I-Ching consultation: coin throws, lines, hexagrams.
// Lines are stored bottom-to-top (line 1 = bottom).

const HEADS = 3; // yang
const TAILS = 2; // yin

function flip() {
  return Math.random() < 0.5 ? TAILS : HEADS;
}

export function throwOneLine() {
  const coins = [flip(), flip(), flip()];
  const sum = coins[0] + coins[1] + coins[2];
  const yin = sum === 6 || sum === 8;
  const mutable = sum === 6 || sum === 9;
  return {
    coins,
    sum,
    yin,
    mutable,
    type: ({ 6: 'old-yin', 7: 'young-yang', 8: 'young-yin', 9: 'old-yang' })[sum],
  };
}

export function throwHexagram() {
  return Array.from({ length: 6 }, throwOneLine);
}

// Bottom-to-top binary string. '1' = yang, '0' = yin.
export function primaryBinary(lines) {
  return lines.map((l) => (l.yin ? '0' : '1')).join('');
}

// Apply mutables to derive the secondary hexagram.
export function secondaryBinary(lines) {
  return lines
    .map((l) => {
      const current = l.yin ? '0' : '1';
      if (!l.mutable) return current;
      return current === '1' ? '0' : '1';
    })
    .join('');
}

export function hasMutables(lines) {
  return lines.some((l) => l.mutable);
}

export function mutableIndices(lines) {
  return lines.flatMap((l, i) => (l.mutable ? [i] : []));
}

// The 8 trigrams keyed by bottom-to-top binary.
export const TRIGRAMS = {
  '111': { glyph: '☰', name: '乾', pinyin: 'Qián', meaning: 'Cielo', element: 'cielo' },
  '110': { glyph: '☱', name: '兌', pinyin: 'Duì', meaning: 'Lago', element: 'lago' },
  '101': { glyph: '☲', name: '離', pinyin: 'Lí', meaning: 'Fuego', element: 'fuego' },
  '100': { glyph: '☳', name: '震', pinyin: 'Zhèn', meaning: 'Trueno', element: 'trueno' },
  '011': { glyph: '☴', name: '巽', pinyin: 'Xùn', meaning: 'Viento', element: 'viento' },
  '010': { glyph: '☵', name: '坎', pinyin: 'Kǎn', meaning: 'Agua', element: 'agua' },
  '001': { glyph: '☶', name: '艮', pinyin: 'Gèn', meaning: 'Montaña', element: 'montaña' },
  '000': { glyph: '☷', name: '坤', pinyin: 'Kūn', meaning: 'Tierra', element: 'tierra' },
};

// binary is bottom-to-top; first 3 chars = lower trigram.
export function getTrigrams(binary) {
  return {
    lower: TRIGRAMS[binary.slice(0, 3)],
    upper: TRIGRAMS[binary.slice(3, 6)],
  };
}

export function lookupHexagram(binary, hexagramData) {
  return hexagramData[binary] || null;
}

// Helper for tests/debugging — pretty-print a hexagram in the console.
export function asciiHexagram(lines) {
  return [...lines]
    .reverse()
    .map((l) => {
      const mark = l.mutable ? ' ●' : '  ';
      return l.yin ? `━━  ━━${mark}` : `━━━━━━${mark}`;
    })
    .join('\n');
}
