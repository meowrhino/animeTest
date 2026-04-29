// ============================================================
// hexagram.js — Lookup + display DOM del hexagrama resultante
// ============================================================
import { TRIGRAMS, HEXAGRAM_LOOKUP, HEXAGRAMS } from './data.js';

const els = {};

export function initHexagramDisplay() {
  els.panel = document.getElementById('result-panel');
  els.number = document.getElementById('hex-number');
  els.chinese = document.getElementById('hex-chinese');
  els.pinyin = document.getElementById('hex-pinyin');
  els.english = document.getElementById('hex-english');
  els.lines = document.getElementById('hex-lines');
  els.upperSymbol = document.getElementById('upper-symbol');
  els.upperName = document.getElementById('upper-name');
  els.lowerSymbol = document.getElementById('lower-symbol');
  els.lowerName = document.getElementById('lower-name');
}

export function showPanel() {
  els.panel.classList.add('visible');
}

export function hidePanel() {
  els.panel.classList.remove('visible');
}

export function updateHexagram(upperTrigramKey, lowerTrigramKey) {
  const upper = TRIGRAMS[upperTrigramKey];
  const lower = TRIGRAMS[lowerTrigramKey];
  const hexNum = HEXAGRAM_LOOKUP[lowerTrigramKey][upperTrigramKey];
  const hex = HEXAGRAMS[hexNum];

  if (!hex) return;

  // Header
  els.number.textContent = `Hexagrama ${hexNum}`;
  els.chinese.textContent = hex.chinese;
  els.pinyin.textContent = hex.pinyin;
  els.english.textContent = hex.english;

  // 6 lines: upper trigram (top 3 lines) + lower trigram (bottom 3 lines)
  // Draw top-to-bottom: upper[top], upper[mid], upper[bot], lower[top], lower[mid], lower[bot]
  const upperLines = [...upper.lines].reverse(); // [top, mid, bot]
  const lowerLines = [...lower.lines].reverse();
  const allLines = [...upperLines, ...lowerLines];

  els.lines.innerHTML = '';
  allLines.forEach((line, i) => {
    const div = document.createElement('div');
    div.className = `hex-line ${line === 1 ? 'yang' : 'yin'}`;
    els.lines.appendChild(div);

    // Separator between upper and lower trigramas
    if (i === 2) {
      const sep = document.createElement('div');
      sep.style.height = '4px';
      els.lines.appendChild(sep);
    }
  });

  // Trigram info
  els.upperSymbol.textContent = upper.symbol;
  els.upperName.textContent = `${upper.chinese} ${upper.english}`;
  els.lowerSymbol.textContent = lower.symbol;
  els.lowerName.textContent = `${lower.chinese} ${lower.english}`;
}
