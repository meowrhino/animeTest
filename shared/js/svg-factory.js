// DOM/SVG builders for coins, hexagram lines, and hexagrams.
// Uses <line> stroke shapes so anime.js svg.createDrawable() can animate them.

const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

// ---------- Coin ----------

const COIN_CHARS = ['平', '安', '通', '寶']; // top, bottom, right, left

function coinFaceSvg(heads) {
  const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'coin__svg' });
  svg.appendChild(svgEl('circle', { cx: 50, cy: 50, r: 47, class: 'coin__rim' }));
  svg.appendChild(svgEl('circle', { cx: 50, cy: 50, r: 41, class: 'coin__inner' }));
  svg.appendChild(svgEl('rect', { x: 40, y: 40, width: 20, height: 20, class: 'coin__hole' }));

  if (heads) {
    const positions = [
      { x: 50, y: 26 },
      { x: 50, y: 84 },
      { x: 80, y: 56 },
      { x: 20, y: 56 },
    ];
    COIN_CHARS.forEach((c, i) => {
      const t = svgEl('text', {
        x: positions[i].x,
        y: positions[i].y,
        class: 'coin__char',
        'text-anchor': 'middle',
      });
      t.textContent = c;
      svg.appendChild(t);
    });
  } else {
    [
      { cx: 50, cy: 22 }, { cx: 50, cy: 78 },
      { cx: 78, cy: 50 }, { cx: 22, cy: 50 },
    ].forEach((p) => {
      svg.appendChild(svgEl('circle', { ...p, r: 2.5, class: 'coin__dot' }));
    });
  }
  return svg;
}

export function createCoin(index = 0) {
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.dataset.index = String(index);

  const front = document.createElement('div');
  front.className = 'coin__face coin__face--heads';
  front.appendChild(coinFaceSvg(true));

  const back = document.createElement('div');
  back.className = 'coin__face coin__face--tails';
  back.appendChild(coinFaceSvg(false));

  coin.appendChild(front);
  coin.appendChild(back);
  return coin;
}

// ---------- Hexagram lines ----------

const LINE_WIDTH = 220;
const LINE_HEIGHT = 28;
const LINE_Y = 14;
const LINE_GAP = 36;

export function createLineSvg(line) {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${LINE_WIDTH} ${LINE_HEIGHT}`,
    class: 'iching-line',
    preserveAspectRatio: 'xMidYMid meet',
  });

  if (line.yin) {
    const segW = (LINE_WIDTH - LINE_GAP) / 2;
    svg.appendChild(svgEl('line', {
      x1: 0, y1: LINE_Y, x2: segW, y2: LINE_Y,
      class: 'line-segment',
      'data-side': 'left',
    }));
    svg.appendChild(svgEl('line', {
      x1: LINE_WIDTH - segW, y1: LINE_Y, x2: LINE_WIDTH, y2: LINE_Y,
      class: 'line-segment',
      'data-side': 'right',
    }));
  } else {
    svg.appendChild(svgEl('line', {
      x1: 0, y1: LINE_Y, x2: LINE_WIDTH, y2: LINE_Y,
      class: 'line-segment',
    }));
  }

  if (line.mutable) {
    const mark = svgEl('circle', {
      cx: LINE_WIDTH + 14, cy: LINE_Y, r: 4,
      class: 'line-mutable-mark',
    });
    svg.setAttribute('viewBox', `0 0 ${LINE_WIDTH + 28} ${LINE_HEIGHT}`);
    svg.appendChild(mark);
  }

  return svg;
}

export function createLineWrapper(line, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'hexagram__line';
  wrapper.dataset.lineIndex = String(index);
  wrapper.dataset.position = String(index + 1);
  if (line) {
    wrapper.dataset.yin = line.yin ? '1' : '0';
    if (line.mutable) wrapper.dataset.mutable = '1';
    wrapper.appendChild(createLineSvg(line));
  } else {
    wrapper.classList.add('hexagram__line--empty');
  }
  return wrapper;
}

// ---------- Hexagram ----------

// lines: bottom-to-top array. DOM is rendered top-to-bottom so we reverse.
export function createHexagram(lines, opts = {}) {
  const { withSlots = false } = opts;
  const container = document.createElement('div');
  container.className = 'hexagram';

  for (let i = lines.length - 1; i >= 0; i--) {
    container.appendChild(createLineWrapper(lines[i], i));
  }
  if (withSlots && lines.length === 0) {
    for (let i = 5; i >= 0; i--) {
      container.appendChild(createLineWrapper(null, i));
    }
  }
  return container;
}

// Empty hexagram with 6 placeholder slots (used during the throw ritual).
export function createEmptyHexagram() {
  const container = document.createElement('div');
  container.className = 'hexagram hexagram--building';
  for (let i = 5; i >= 0; i--) {
    container.appendChild(createLineWrapper(null, i));
  }
  return container;
}

// Replace the slot for a given line index with the actual rendered line.
export function fillLineSlot(hexagramEl, index, line) {
  const slot = hexagramEl.querySelector(`.hexagram__line[data-line-index="${index}"]`);
  if (!slot) return null;
  slot.classList.remove('hexagram__line--empty');
  slot.dataset.yin = line.yin ? '1' : '0';
  if (line.mutable) slot.dataset.mutable = '1';
  slot.innerHTML = '';
  slot.appendChild(createLineSvg(line));
  return slot;
}
