// Renderer SVG de la rueda natal con casas de signo entero.
// La rueda gira para que la Casa I quede a la izquierda (Este).
// Anillos:
//   - Exterior: 12 sectores de signo (con glyph)
//   - Medio:   12 casas (con número romano)
//   - Interior: planetas como nodos circulares conectados por líneas de aspecto
import { animate, stagger, utils, svg } from '../../../shared/js/anime-import.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// Coords en sistema astrológico: 0° está a la izquierda (Este) y los grados
// avanzan en sentido antihorario. Lo convertimos a SVG (Y invertida).
const SIZE = 720;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 340;
const R_SIGN = 320;
const R_HOUSE = 280;
const R_HOUSE_NUM = 250;
const R_PLANET = 200;
const R_INNER = 80;

function angleFromRel(relDeg) {
  // relDeg = grados desde el ascendente, en sentido antihorario
  // SVG: 0° apunta a la derecha; queremos que el ascendente esté a la izquierda
  return Math.PI - (relDeg * Math.PI) / 180;
}

function pointAt(rel, r) {
  const ang = angleFromRel(rel);
  return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
}

export function createNatalChart({ host, signsData, ascSign, ascDeg, planets, aspects, hasHouses }) {
  host.innerHTML = '';

  const root = el('svg', {
    class: 'chart-svg',
    viewBox: `0 0 ${SIZE} ${SIZE}`,
  });
  host.appendChild(root);

  // ─── Anillos base ─────────────────────────────────────
  const ringsGroup = el('g', { class: 'chart__rings' });
  root.appendChild(ringsGroup);

  ringsGroup.appendChild(el('circle', { cx: CX, cy: CY, r: R_OUTER, class: 'chart__ring' }));
  ringsGroup.appendChild(el('circle', { cx: CX, cy: CY, r: R_SIGN,  class: 'chart__ring chart__ring--soft' }));
  ringsGroup.appendChild(el('circle', { cx: CX, cy: CY, r: R_HOUSE, class: 'chart__ring chart__ring--soft' }));
  ringsGroup.appendChild(el('circle', { cx: CX, cy: CY, r: R_INNER, class: 'chart__ring chart__ring--soft' }));

  // ─── 12 sectores de signo ─────────────────────────────
  const signsGroup = el('g', { class: 'chart__signs' });
  root.appendChild(signsGroup);

  for (let i = 0; i < 12; i++) {
    const startRel = i * 30;
    const endRel = (i + 1) * 30;
    const a1 = angleFromRel(startRel);
    const a2 = angleFromRel(endRel);
    const path = el('line', {
      x1: CX + R_HOUSE * Math.cos(a1),
      y1: CY + R_HOUSE * Math.sin(a1),
      x2: CX + R_OUTER * Math.cos(a1),
      y2: CY + R_OUTER * Math.sin(a1),
      class: 'chart__sign-divider',
    });
    signsGroup.appendChild(path);

    // Glyph del signo (en sentido del zodíaco — primer sector empieza en ascSign)
    const signIdx = (ascSign + i) % 12;
    const sign = signsData.signs[signIdx];
    const midRel = (startRel + endRel) / 2;
    const [tx, ty] = pointAt(midRel, (R_OUTER + R_HOUSE) / 2);
    const glyph = el('text', {
      x: tx, y: ty + 4,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      class: 'chart__sign-glyph',
    });
    glyph.textContent = sign.glyph;
    signsGroup.appendChild(glyph);
  }

  // ─── Casas (números romanos) ─────────────────────────
  if (hasHouses) {
    const housesGroup = el('g', { class: 'chart__houses' });
    root.appendChild(housesGroup);
    for (let i = 0; i < 12; i++) {
      const midRel = i * 30 + 15;
      const [tx, ty] = pointAt(midRel, R_HOUSE_NUM);
      const num = el('text', {
        x: tx, y: ty,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        class: 'chart__house-num',
      });
      num.textContent = ROMAN[i + 1];
      housesGroup.appendChild(num);

      // Divisor de casas
      const a = angleFromRel(i * 30);
      housesGroup.appendChild(el('line', {
        x1: CX + R_INNER * Math.cos(a),
        y1: CY + R_INNER * Math.sin(a),
        x2: CX + R_HOUSE * Math.cos(a),
        y2: CY + R_HOUSE * Math.sin(a),
        class: 'chart__house-divider',
      }));
    }

    // Eje I/VII (ascendente / descendente) destacado
    const ascA = angleFromRel(0);
    const descA = angleFromRel(180);
    const axis1 = el('line', {
      x1: CX + R_INNER * Math.cos(ascA),
      y1: CY + R_INNER * Math.sin(ascA),
      x2: CX + R_OUTER * Math.cos(ascA),
      y2: CY + R_OUTER * Math.sin(ascA),
      class: 'chart__axis chart__axis--asc',
    });
    const axis7 = el('line', {
      x1: CX + R_INNER * Math.cos(descA),
      y1: CY + R_INNER * Math.sin(descA),
      x2: CX + R_OUTER * Math.cos(descA),
      y2: CY + R_OUTER * Math.sin(descA),
      class: 'chart__axis',
    });
    root.appendChild(axis1);
    root.appendChild(axis7);
  }

  // ─── Aspectos ─────────────────────────────────────────
  const aspectsGroup = el('g', { class: 'chart__aspects' });
  root.appendChild(aspectsGroup);

  // Calcular posiciones de cada planeta en el círculo R_PLANET
  // (basado en la longitud relativa al ascendente)
  const planetNodes = planets.map((p) => {
    const relDeg = ((p.longitude - ascDeg) + 360) % 360;
    const [x, y] = pointAt(relDeg, R_PLANET);
    return { ...p, x, y };
  });

  for (const asp of aspects) {
    const a = planetNodes[asp.a];
    const b = planetNodes[asp.b];
    const line = el('line', {
      x1: a.x, y1: a.y,
      x2: b.x, y2: b.y,
      class: `chart__aspect chart__aspect--${asp.type}`,
      'data-type': asp.type,
    });
    aspectsGroup.appendChild(line);
  }

  // ─── Planetas ─────────────────────────────────────────
  const planetsGroup = el('g', { class: 'chart__planets' });
  root.appendChild(planetsGroup);

  // Cada planeta es un <g> outer (translate fijo) + <g> inner (scale animable).
  // Separarlos evita que anime.js pise el translate al animar el scale.
  planetNodes.forEach((p) => {
    const outer = el('g', {
      class: 'chart__planet',
      'data-planet': p.key,
      transform: `translate(${p.x}, ${p.y})`,
    });
    const inner = el('g', { class: 'chart__planet-inner' });
    inner.appendChild(el('circle', { r: 16, class: 'chart__planet-bg' }));
    const text = el('text', {
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      class: 'chart__planet-glyph',
    });
    text.textContent = p.glyph;
    inner.appendChild(text);
    outer.appendChild(inner);
    planetsGroup.appendChild(outer);
  });

  // ─── Ascendente label ────────────────────────────────
  if (hasHouses) {
    const [ascX, ascY] = pointAt(-8, R_OUTER + 18);
    const ascLabel = el('text', {
      x: ascX, y: ascY,
      'text-anchor': 'middle',
      class: 'chart__asc-label',
    });
    ascLabel.textContent = 'ASC';
    root.appendChild(ascLabel);
  }

  return {
    root,
    rings: ringsGroup,
    signs: signsGroup,
    aspectsGroup,
    planets: planetsGroup,
    async play() {
      // Anim entrada: rings → signs → houses → aspects → planets
      utils.set(root, { opacity: 0, scale: 0.92 });
      utils.set([...ringsGroup.children], { opacity: 0 });
      utils.set([...signsGroup.children], { opacity: 0, scale: 0.85 });
      utils.set([...aspectsGroup.children], { opacity: 0 });
      // El scale va en .chart__planet-inner para no pisar el translate del outer
      utils.set([...planetsGroup.children], { opacity: 0 });
      utils.set([...planetsGroup.querySelectorAll('.chart__planet-inner')], { scale: 0.4 });

      animate(root, {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 1200,
        ease: 'outExpo',
      });

      animate([...ringsGroup.children], {
        opacity: [0, 1],
        duration: 700,
        delay: stagger(80, { start: 200 }),
      });

      animate([...signsGroup.children], {
        opacity: [0, 1],
        scale: [0.85, 1],
        duration: 700,
        delay: stagger(20, { start: 700 }),
      });

      const aspectLines = [...aspectsGroup.children];
      if (aspectLines.length) {
        const draw = svg.createDrawable(aspectLines);
        utils.set(draw, { draw: '0 0' });
        animate(draw, {
          draw: ['0 0', '0 1'],
          opacity: [0, 0.6],
          duration: 900,
          delay: stagger(30, { start: 1500 }),
          ease: 'inOutQuad',
        });
      }

      // Animamos opacity en el outer (no afecta transform) y scale en el inner
      // (transform-origin del <g> está implícitamente en (0,0) del sistema local del outer)
      const outers = [...planetsGroup.children];
      const inners = outers.map((g) => g.querySelector('.chart__planet-inner'));
      animate(outers, {
        opacity: [0, 1],
        duration: 700,
        delay: stagger(60, { start: 2100 }),
        ease: 'outExpo',
      });
      animate(inners, {
        scale: [0.4, 1],
        duration: 700,
        delay: stagger(60, { start: 2100 }),
        ease: 'outExpo',
      });
    },
  };
}
