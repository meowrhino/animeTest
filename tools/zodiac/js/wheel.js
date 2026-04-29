// Rueda zodiacal SVG con 12 segmentos (uno por animal). Gira para apuntar al animal del año.
import { animate, utils } from '../../../shared/js/anime-import.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Genera un path SVG de un sector circular (slice) entre dos ángulos.
function sectorPath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const toRad = (d) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + rOuter * Math.cos(toRad(startDeg));
  const y1 = cy + rOuter * Math.sin(toRad(startDeg));
  const x2 = cx + rOuter * Math.cos(toRad(endDeg));
  const y2 = cy + rOuter * Math.sin(toRad(endDeg));
  const x3 = cx + rInner * Math.cos(toRad(endDeg));
  const y3 = cy + rInner * Math.sin(toRad(endDeg));
  const x4 = cx + rInner * Math.cos(toRad(startDeg));
  const y4 = cy + rInner * Math.sin(toRad(startDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

// Construye y monta la rueda. Devuelve API { highlight(animalKey), spin() }
export function createZodiacWheel({ host, animals }) {
  const SIZE = 320;
  const cx = SIZE / 2, cy = SIZE / 2;
  const rOuter = 130;
  const rInner = 70;
  const segDeg = 360 / 12;

  host.innerHTML = '';
  const svg = svgEl('svg', {
    class: 'wheel-svg',
    viewBox: `0 0 ${SIZE} ${SIZE}`,
  });
  host.appendChild(svg);

  // Centro decorativo
  svg.appendChild(svgEl('circle', { cx, cy, r: rInner - 4, fill: 'none', stroke: 'var(--ink-faded)', 'stroke-width': '0.5' }));
  svg.appendChild(svgEl('circle', { cx, cy, r: rOuter, fill: 'none', stroke: 'var(--ink-faded)', 'stroke-width': '0.5' }));

  // Carácter 生 en el centro
  const center = svgEl('text', {
    x: cx, y: cy + 2,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-family': 'var(--font-cn)',
    'font-size': '32',
    fill: 'var(--accent)',
  });
  center.textContent = '生';
  svg.appendChild(center);

  const segments = {};
  const glyphs = {};

  // 12 segmentos. El primer animal (Rata) está arriba (-15deg desde top center).
  animals.forEach((animal, i) => {
    const startDeg = i * segDeg - segDeg / 2;
    const endDeg = startDeg + segDeg;

    // Segment slice
    const seg = svgEl('path', {
      class: 'wheel-segment',
      d: sectorPath(cx, cy, rOuter, rInner, startDeg, endDeg),
      'data-animal': animal.key,
    });
    svg.appendChild(seg);
    segments[animal.key] = seg;

    // Glyph (chinese char) at midpoint
    const midDeg = (startDeg + endDeg) / 2;
    const midRad = ((midDeg - 90) * Math.PI) / 180;
    const rGlyph = (rOuter + rInner) / 2;
    const gx = cx + rGlyph * Math.cos(midRad);
    const gy = cy + rGlyph * Math.sin(midRad);

    const glyph = svgEl('text', {
      x: gx, y: gy,
      class: 'wheel-glyph',
      'data-animal': animal.key,
      'font-family': 'var(--font-cn)',
    });
    glyph.textContent = animal.chinese;
    svg.appendChild(glyph);
    glyphs[animal.key] = glyph;
  });

  // Activa visualmente un segmento
  function highlight(animalKey) {
    Object.values(segments).forEach((s) => s.classList.remove('is-active'));
    Object.values(glyphs).forEach((g) => g.classList.remove('is-active'));
    if (segments[animalKey]) segments[animalKey].classList.add('is-active');
    if (glyphs[animalKey]) glyphs[animalKey].classList.add('is-active');
  }

  // Anima la rueda girando hasta que el animal indicado quede arriba
  async function spinTo(animalKey) {
    const idx = animals.findIndex((a) => a.key === animalKey);
    if (idx < 0) return;

    // Para que el segmento del animal quede arriba, rotamos -idx*segDeg
    // + ~3 vueltas completas para sensación cinemática
    const finalRotation = -idx * segDeg - 3 * 360;

    utils.set(svg, { rotate: 0 });

    await animate(svg, {
      rotate: [0, finalRotation],
      duration: 2400,
      ease: 'outExpo',
    });

    highlight(animalKey);
  }

  return { svg, highlight, spinTo };
}
