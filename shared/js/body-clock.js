// Body Clock — reloj de los 12 meridianos chinos en estilo TCM canónico.
// Un disco de 24h con cada meridiano ocupando 30° (2h). Anillo exterior con
// horas, anillo medio con sectores de meridiano coloreados por elemento,
// anillo interior con etiquetas de los 5 elementos, centro con yin-yang.
// Inspirado en patrones tradicionales de "Chinese Body Clock".
//
// Uso:
//   const clock = createBodyClock({ host, meridians, size: 700 });
//   clock.onHover((meridian) => { ... });   // null al salir
//   clock.onClick((meridian) => { ... });
//
// `meridians` es la estructura de shared/data/iching... no perdón,
// de tools/meridian-clock/data/meridians.json: array con timeSlot.startHour,
// chinese, pinyin, spanish, element, recommendation, associations.
import { animate, utils } from './anime-import.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Colores canónicos de los cinco elementos (heredados del html original).
// HT/SI usan Fire (emperador), PC/TE usan ministerial fire = mfire.
const ELEMENT_COLORS = {
  Fire:   '#c06858',
  mFire:  '#c07850',  // ministerial fire (PC, TE)
  Water:  '#4c7b9c',
  Wood:   '#5b8a5b',
  Metal:  '#7e6e9e',
  Earth:  '#b08f3c',
};

const MINISTERIAL_FIRE_CODES = new Set(['PC', 'TE']);

function colorForMeridian(m) {
  if (MINISTERIAL_FIRE_CODES.has(m.code)) return ELEMENT_COLORS.mFire;
  return ELEMENT_COLORS[m.element] || '#888';
}

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function f(n) { return Number(n).toFixed(2); }

// Coordenadas de reloj: 0° arriba (12 noon), avanzando en sentido horario.
function xy(centerX, centerY, angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: centerX + radius * Math.sin(rad),
    y: centerY - radius * Math.cos(rad),
  };
}

// Path de un sector circular (annulus) entre `a1` y `a1 + span` (en grados),
// con radios interior `ri` y exterior `ro`.
function arcPath(cx, cy, a1, span, ri, ro) {
  const a2 = (a1 + span) % 360;
  const lg = span > 180 ? 1 : 0;
  const pi = xy(cx, cy, a1, ri);
  const po = xy(cx, cy, a1, ro);
  const qi = xy(cx, cy, a2, ri);
  const qo = xy(cx, cy, a2, ro);
  return `M${f(pi.x)} ${f(pi.y)}L${f(po.x)} ${f(po.y)}A${ro} ${ro} 0 ${lg} 1 ${f(qo.x)} ${f(qo.y)}L${f(qi.x)} ${f(qi.y)}A${ri} ${ri} 0 ${lg} 0 ${f(pi.x)} ${f(pi.y)}Z`;
}

function addText(parent, text, attrs) {
  const t = el('text', attrs);
  const lines = String(text).split('\n');
  const lineH = parseFloat(attrs['data-line-h'] || '11');
  lines.forEach((line, i) => {
    const ts = document.createElementNS(SVG_NS, 'tspan');
    ts.setAttribute('x', attrs.x ?? '0');
    ts.setAttribute('dy', i === 0 ? `${-((lines.length - 1) * lineH) / 2}` : `${lineH}`);
    ts.textContent = line;
    t.appendChild(ts);
  });
  parent.appendChild(t);
  return t;
}

// startAngle (CW desde 12 noon) a partir de la hora de inicio (0-23).
// timeSlot.startHour=11 → -15° = 345°. timeSlot.startHour=23 → 165°.
function startAngleFromHour(hour) {
  return ((hour - 12) * 15 + 360) % 360;
}

// Devuelve el meridiano activo a una hora dada (Date local).
export function meridianAt(date, meridians) {
  const h = date.getHours();
  for (const m of meridians) {
    if (!m.timeSlot) continue;
    const start = m.timeSlot.startHour;
    const end = (start + 2) % 24;
    if (start < end) {
      if (h >= start && h < end) return m;
    } else if (h >= start || h < end) {
      return m;
    }
  }
  return null;
}

// 24 etiquetas de hora desde el mediodía (CW). Variante con sólo cifras + am/pm.
function buildHourLabels() {
  const out = [];
  for (let i = 0; i < 24; i++) {
    const h = (12 + i) % 24;
    let label;
    if (h === 0) label = '00';
    else if (h === 12) label = '12';
    else label = String(h).padStart(2, '0');
    out.push({ angle: i * 15, label, major: i % 3 === 0 });
  }
  return out;
}

export function createBodyClock({
  host,
  meridians,
  size = 700,
  innerScale = 1,
  showHours = true,
  showElements = true,
  showYinYang = true,
  paper = '#f4ede1',
  ink = '#1a1a1a',
}) {
  // Sólo los meridianos con timeSlot (los 12 principales) entran en la rueda
  const timed = meridians.filter((m) => m.timeSlot);
  if (timed.length !== 12) {
    console.warn(`Body clock expected 12 timed meridians, got ${timed.length}`);
  }

  // Ordenar por startHour para que el ciclo sea coherente
  const ordered = [...timed].sort((a, b) => {
    const offsetA = (a.timeSlot.startHour - 11 + 24) % 24;
    const offsetB = (b.timeSlot.startHour - 11 + 24) % 24;
    return offsetA - offsetB;
  });

  const cx = size / 2;
  const cy = size / 2;
  const R = {
    out:  size * 0.394 * innerScale,  // borde exterior del anillo de meridianos
    inn:  size * 0.166 * innerScale,  // borde interior del anillo de meridianos
    time: size * 0.44  * innerScale,  // anillo de horas
    elem: size * 0.223 * innerScale,  // anillo de elementos
    yy:   size * 0.074 * innerScale,  // yin-yang
  };

  host.innerHTML = '';
  const svg = el('svg', {
    viewBox: `0 0 ${size} ${size}`,
    class: 'body-clock-svg',
    'aria-label': 'Reloj de los doce meridianos chinos',
  });
  host.appendChild(svg);

  // Disco de fondo
  svg.appendChild(el('circle', { cx, cy, r: R.out + 30, fill: paper }));

  // Tick marks cada 15° (cada hora). Cada 30° es un cambio de meridiano.
  for (let i = 0; i < 24; i++) {
    const a = i * 15;
    const isMajor = i % 2 === 0;
    const p1 = xy(cx, cy, a, R.out);
    const p2 = xy(cx, cy, a, R.out + (isMajor ? 7 : 4));
    svg.appendChild(el('line', {
      x1: f(p1.x), y1: f(p1.y), x2: f(p2.x), y2: f(p2.y),
      stroke: 'rgba(28,28,28,0.25)',
      'stroke-width': isMajor ? '1' : '0.6',
    }));
  }

  // Sectores de meridiano (12 × 30°)
  const segments = {};
  ordered.forEach((m) => {
    const startAngle = startAngleFromHour(m.timeSlot.startHour);
    const color = colorForMeridian(m);
    const mid = (startAngle + 15 + 360) % 360;
    const mp = xy(cx, cy, mid, (R.inn + R.out) / 2);

    const g = el('g', { class: 'body-clock-seg', 'data-code': m.code });

    g.appendChild(el('path', {
      d: arcPath(cx, cy, startAngle, 30, R.inn, R.out),
      fill: color,
      'fill-opacity': '0.85',
      stroke: paper,
      'stroke-width': '1.5',
    }));

    // Etiqueta del meridiano: usamos su nombre español compacto
    // (el html original usa inglés con \n; replicamos esa lógica)
    let label = m.spanish;
    if (label.length > 9) {
      const words = label.split(' ');
      if (words.length > 1) {
        const half = Math.ceil(words.length / 2);
        label = words.slice(0, half).join(' ') + '\n' + words.slice(half).join(' ');
      }
    }

    addText(g, label, {
      x: f(mp.x), y: f(mp.y),
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: 'rgba(255,255,255,0.95)',
      'font-size': size < 480 ? '7' : '9',
      'font-weight': '500',
      'letter-spacing': '0.02em',
      'pointer-events': 'none',
      'data-line-h': size < 480 ? '8' : '10',
    });

    svg.appendChild(g);
    segments[m.code] = g;
  });

  // Anillo interior con etiquetas de elementos. Cada elemento tiene 2 meridianos
  // consecutivos (Fire = HT+SI, Water = BL+KI, etc.); ponemos la etiqueta en el medio.
  if (showElements) {
    const elementCenters = {};
    ordered.forEach((m, i) => {
      const groupKey = MINISTERIAL_FIRE_CODES.has(m.code) ? 'mFire' : m.element;
      if (!elementCenters[groupKey]) elementCenters[groupKey] = [];
      elementCenters[groupKey].push(startAngleFromHour(m.timeSlot.startHour) + 15); // mid
    });

    const elementSpanish = {
      Fire: 'Fuego', mFire: 'Fuego', Water: 'Agua', Wood: 'Madera', Metal: 'Metal', Earth: 'Tierra',
    };

    for (const [key, midAngles] of Object.entries(elementCenters)) {
      // Promediar los ángulos (cuidando wrap a 360°)
      const avgAngle = circularMean(midAngles);
      const p = xy(cx, cy, avgAngle, R.elem);
      const color = ELEMENT_COLORS[key];

      const g = el('g', { 'pointer-events': 'none' });
      g.appendChild(el('circle', {
        cx: f(p.x), cy: f(p.y), r: size * 0.029,
        fill: paper,
        stroke: color,
        'stroke-width': '1.5',
      }));
      addText(g, elementSpanish[key] || key, {
        x: f(p.x), y: f(p.y),
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: color,
        'font-size': size < 480 ? '7.5' : '9.5',
        'letter-spacing': '0.06em',
      });
      svg.appendChild(g);
    }
  }

  // Anillo exterior con horas
  if (showHours) {
    const hourLabels = buildHourLabels();
    hourLabels.forEach((h) => {
      const p = xy(cx, cy, h.angle, R.time);
      addText(svg, h.label, {
        x: f(p.x), y: f(p.y),
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: ink,
        'font-size': size < 480 ? '6.5' : (h.major ? '9' : '7.5'),
        'font-weight': h.major ? '500' : '300',
        opacity: h.major ? '0.6' : '0.32',
        'pointer-events': 'none',
      });
    });
  }

  // Borde exterior del anillo
  svg.appendChild(el('circle', {
    cx, cy, r: R.out, fill: 'none',
    stroke: 'rgba(28,28,28,0.12)', 'stroke-width': '1',
  }));

  // Disco interior (oculta extremos del anillo)
  svg.appendChild(el('circle', {
    cx, cy, r: R.inn, fill: paper,
    stroke: 'rgba(28,28,28,0.08)', 'stroke-width': '1',
  }));

  // Yin-yang en el centro
  if (showYinYang) {
    const r = R.yy;
    const g = el('g', { transform: `translate(${cx},${cy})`, 'pointer-events': 'none' });
    g.appendChild(el('circle', { r, fill: ink }));
    g.appendChild(el('path', {
      d: `M0,${-r} A${r/2},${r/2} 0 0,1 0,0 A${r/2},${r/2} 0 0,0 0,${r} A${r},${r} 0 0,1 0,${-r}Z`,
      fill: paper,
    }));
    g.appendChild(el('circle', { cy: -r/2, r: r/6, fill: ink }));
    g.appendChild(el('circle', { cy:  r/2, r: r/6, fill: paper }));
    g.appendChild(el('circle', { r, fill: 'none', stroke: 'rgba(28,28,28,0.18)', 'stroke-width': '0.8' }));
    svg.appendChild(g);
  }

  // ── Indicador de "ahora" ──
  const nowDot = el('circle', {
    r: size < 480 ? 3.5 : 5,
    fill: ink,
    'pointer-events': 'none',
    class: 'body-clock-now-dot',
  });
  svg.appendChild(nowDot);

  // ── API + interactividad ──
  let onHoverCb = null;
  let onClickCb = null;
  let userActive = false;
  let activeCode = null;

  function highlight(code) {
    Object.entries(segments).forEach(([c, seg]) => {
      seg.classList.toggle('is-active', c === code);
    });
    activeCode = code;
  }

  Object.values(segments).forEach((seg) => {
    seg.style.cursor = 'pointer';
    seg.addEventListener('pointerenter', () => {
      const code = seg.dataset.code;
      const m = ordered.find((x) => x.code === code);
      userActive = true;
      highlight(code);
      if (onHoverCb) onHoverCb(m);
    });
    seg.addEventListener('click', () => {
      const code = seg.dataset.code;
      const m = ordered.find((x) => x.code === code);
      if (onClickCb) onClickCb(m);
    });
  });

  svg.addEventListener('pointerleave', () => {
    userActive = false;
    if (onHoverCb) onHoverCb(null);
    tick(); // restaura highlight a la hora actual
  });

  // ── tick: actualiza posición del dot y meridiano activo si no hay hover ──
  function tick(now = new Date()) {
    const minutes = now.getHours() * 60 + now.getMinutes();
    // 0° = 12 noon, así que tras restar 720 (mediodía en minutos) y mod 1440:
    const angle = ((minutes - 720 + 1440) % 1440) / 1440 * 360;
    const pos = xy(cx, cy, angle, R.out - 14);
    nowDot.setAttribute('cx', f(pos.x));
    nowDot.setAttribute('cy', f(pos.y));

    if (!userActive) {
      const m = meridianAt(now, ordered);
      if (m) highlight(m.code);
    }
    return { angle, dot: pos };
  }

  // Animación de entrada: el dot pulsa
  utils.set(nowDot, { scale: 0, transformOrigin: '50% 50%' });
  animate(nowDot, {
    scale: [0, 1],
    duration: 1000,
    ease: 'outElastic(1, 0.6)',
    delay: 600,
  });

  // Pulsing infinito del dot mientras está visible
  setTimeout(() => {
    animate(nowDot, {
      scale: [
        { to: 1.35, duration: 1100, ease: 'inOutSine' },
        { to: 1,    duration: 1100, ease: 'inOutSine' },
      ],
      loop: true,
    });
  }, 1700);

  tick();
  setInterval(tick, 30 * 1000);

  return {
    svg,
    segments,
    nowDot,
    tick,
    onHover(cb) { onHoverCb = cb; },
    onClick(cb) { onClickCb = cb; },
    highlight,
  };
}

// Promedio circular de ángulos en grados (gestiona wrap 360°→0°).
function circularMean(angles) {
  let sx = 0, sy = 0;
  for (const a of angles) {
    const r = (a * Math.PI) / 180;
    sx += Math.cos(r);
    sy += Math.sin(r);
  }
  const mean = (Math.atan2(sy / angles.length, sx / angles.length) * 180) / Math.PI;
  return (mean + 360) % 360;
}
