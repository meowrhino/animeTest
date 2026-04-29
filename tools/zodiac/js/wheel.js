// Rueda zodiacal SVG con 12 segmentos (uno por animal). Gira para apuntar al animal del año
// y se puede arrastrar manualmente (snap a 30°) para consultar el animal del momento.
import { animate, utils, spring } from '../../../shared/js/anime-import.js';

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

    // 3 vueltas completas + posición final para que el segmento quede arriba
    const finalRotation = -idx * segDeg - 3 * 360;

    utils.set(svg, { rotate: 0 });
    currentRotation = 0;

    // Dos fases: primer giro rápido (outQuad) hasta cerca del destino,
    // luego asentamiento con spring (rebote sutil) para que se sienta como una rueda real.
    await animate(svg, {
      rotate: [0, finalRotation - 12], // overshoot intencional
      duration: 2200,
      ease: 'outQuad',
    });
    await animate(svg, {
      rotate: finalRotation,
      duration: 600,
      ease: spring({ mass: 1, stiffness: 80, damping: 8 }),
    });
    currentRotation = finalRotation;

    highlight(animalKey);
  }

  // ── Drag manual: arrastra la rueda con momentum y snap al animal más cercano ──
  let isDragging = false;
  let dragStartAngle = 0;
  let dragStartRotation = 0;
  let currentRotation = 0;
  let dragVelocity = 0;
  let lastDragAngle = 0;
  let lastDragTime = 0;
  let onSnapCallback = null;

  function pointerAngle(clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const cxAbs = rect.left + rect.width / 2;
    const cyAbs = rect.top + rect.height / 2;
    return Math.atan2(clientY - cyAbs, clientX - cxAbs) * 180 / Math.PI;
  }

  svg.style.cursor = 'grab';
  svg.style.touchAction = 'none';

  svg.addEventListener('pointerdown', (e) => {
    isDragging = true;
    svg.setPointerCapture(e.pointerId);
    svg.style.cursor = 'grabbing';
    dragStartAngle = pointerAngle(e.clientX, e.clientY);
    dragStartRotation = currentRotation;
    lastDragAngle = dragStartAngle;
    lastDragTime = performance.now();
    dragVelocity = 0;
  });

  svg.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const ang = pointerAngle(e.clientX, e.clientY);
    let delta = ang - dragStartAngle;
    // Normalizar entre -180 y 180 para evitar saltos al cruzar
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    currentRotation = dragStartRotation + delta;
    utils.set(svg, { rotate: currentRotation });

    // Estimar velocidad para inercia
    const now = performance.now();
    const dt = now - lastDragTime;
    if (dt > 0) {
      let frame = ang - lastDragAngle;
      if (frame > 180) frame -= 360;
      if (frame < -180) frame += 360;
      dragVelocity = frame / dt; // grados / ms
    }
    lastDragAngle = ang;
    lastDragTime = now;
  });

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    svg.style.cursor = 'grab';

    // Inercia suave + snap al múltiplo de 30° más cercano
    const inertia = dragVelocity * 240; // un par de centésimas de inercia
    const target = currentRotation + inertia;
    const snapped = Math.round(target / segDeg) * segDeg;

    animate(svg, {
      rotate: snapped,
      duration: 700,
      ease: spring({ mass: 1, stiffness: 70, damping: 9 }),
      onComplete: () => {
        currentRotation = snapped;
        // Determinar qué animal queda arriba (índice 0 = Rata, arriba)
        const stepsFromZero = ((-Math.round(snapped / segDeg)) % 12 + 12) % 12;
        const animal = animals[stepsFromZero];
        if (animal) {
          highlight(animal.key);
          if (onSnapCallback) onSnapCallback(animal);
        }
      },
    });
  }

  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  function onDragSnap(cb) { onSnapCallback = cb; }

  return { svg, highlight, spinTo, onDragSnap };
}
