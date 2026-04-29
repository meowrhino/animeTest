// Mapa corporal SVG 2D — vista frontal estilizada con los 14 meridianos como paths.
// Cada path tiene una "longitud" cubierta por su número de puntos; los puntos se
// distribuyen uniformemente con `getPointAtLength`. Filtrar un meridiano lo dibuja
// con `svg.createDrawable`; el resto se atenúa.
import { animate, stagger, utils, svg } from '../../../shared/js/anime-import.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 320;
const H = 720;

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// ── Silueta corporal estilizada (vista frontal) ──
// Coordenadas pensadas para una figura simétrica esbelta. No es anatómica
// (ningún manual de medicina debería usarse desde aquí); es un mapa
// tipográfico para situar los puntos a vista de pájaro.
const BODY_PATHS = {
  head:    'M 160 35 Q 195 35 195 80 Q 195 125 160 130 Q 125 125 125 80 Q 125 35 160 35 Z',
  neck:    'M 145 130 L 175 130 L 175 155 L 145 155 Z',
  torso:   'M 110 165 Q 100 175 102 220 L 110 380 Q 110 410 130 415 L 190 415 Q 210 410 210 380 L 218 220 Q 220 175 210 165 Z',
  armL:    'M 110 165 Q 88 200 78 280 Q 70 360 60 460 Q 56 510 50 530',
  armR:    'M 210 165 Q 232 200 242 280 Q 250 360 260 460 Q 264 510 270 530',
  legL:    'M 132 415 Q 130 480 128 560 Q 126 640 122 700',
  legR:    'M 188 415 Q 190 480 192 560 Q 194 640 198 700',
};

// ── Trazos de los 14 meridianos (vista frontal aproximada) ──
// Cada meridiano es un path SVG; los puntos se distribuyen uniformemente.
// Para meridianos predominantemente posteriores (BL, GV) usamos su recorrido
// frontal/lateral visible; el resto va anatómicamente al frente.
const MERIDIANS = {
  // Pulmón: del pecho lateral al pulgar (interior del brazo)
  LU: 'M 116 195 Q 92 240 86 300 Q 80 380 75 460 Q 72 500 68 525',
  // Intestino Grueso: del índice subiendo por fuera del brazo hasta la nariz
  LI: 'M 285 530 Q 268 480 252 410 Q 240 340 232 260 Q 222 200 215 175 Q 200 145 175 115',
  // Estómago: bajo del ojo, costado del cuello, frente del torso, frente de la pierna, segundo dedo
  ST: 'M 175 110 Q 178 130 178 150 L 178 180 Q 145 220 140 290 L 140 380 Q 142 470 144 560 Q 144 640 140 695',
  // Bazo: desde dedo gordo, interior pierna, lateral del torso
  SP: 'M 130 700 Q 128 640 130 560 Q 132 480 134 410 Q 134 350 145 280 Q 158 220 200 195 L 215 175',
  // Corazón: de axila al meñique (interior del brazo)
  HT: 'M 122 175 Q 100 220 92 290 Q 86 365 80 450 Q 78 495 76 520',
  // Intestino Delgado: del meñique exterior brazo hasta sien
  SI: 'M 56 532 Q 64 500 70 460 Q 78 380 88 290 Q 100 220 130 175 Q 150 130 168 100',
  // Vejiga (segmento frontal sólo: desde la frente cruzando la cabeza). El resto es posterior.
  BL: 'M 130 95 Q 120 80 122 60 Q 140 35 160 30 Q 180 35 198 60 Q 200 80 190 95',
  // Riñón: de la planta del pie hasta la clavícula (interior pierna, frente torso)
  KI: 'M 145 700 Q 142 640 144 560 Q 146 480 148 410 Q 150 350 154 280 Q 160 220 168 180 L 168 170',
  // Pericardio: del pectoral al dedo medio (medio del brazo interior)
  PC: 'M 132 195 Q 110 240 100 310 Q 92 380 84 450 Q 80 495 78 525',
  // Triple Calentador: del anular al exterior brazo a la sien
  TE: 'M 270 530 Q 254 480 240 410 Q 228 340 220 260 Q 212 200 200 170 Q 192 145 184 110',
  // Vesícula Biliar: lado de cabeza, lateral cuello, lateral torso, exterior pierna, cuarto dedo
  GB: 'M 200 80 Q 215 110 215 145 L 218 175 Q 220 220 222 290 Q 220 360 215 415 L 210 460 Q 205 540 202 620 Q 200 670 195 700',
  // Hígado: del dedo gordo, interior pierna, costillas
  LV: 'M 132 700 Q 130 640 132 560 Q 134 480 136 410 Q 138 350 152 290 L 175 220',
  // Vaso Gobernador: línea media frontal alta (segmento facial visible)
  GV: 'M 160 100 Q 160 75 160 50 Q 160 35 160 30',
  // Vaso Concepción: línea media frontal completa, perineo a labio inferior
  CV: 'M 160 130 L 160 165 Q 160 200 160 260 Q 160 320 160 380 Q 160 410 160 415',
};

const COLORS = {
  LU: 'var(--accent)',
  LI: '#b8943f',
  ST: '#a37a3f',
  SP: 'var(--jade)',
  HT: '#8a3a2e',
  SI: '#a64a3e',
  BL: '#5b4a7a',
  KI: '#2a3552',
  PC: '#c95846',
  TE: '#a86c5a',
  GB: '#7a9b6a',
  LV: '#5d7e6c',
  GV: '#1a1a1a',
  CV: '#3a3a3a',
};

export function createBodyMap({ host, points, meridians }) {
  host.innerHTML = '';

  const root = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'body-map',
    'aria-label': 'Mapa corporal con los 14 meridianos',
  });
  host.appendChild(root);

  // ── Silueta del cuerpo (sin fill, solo línea suave) ──
  const bodyGroup = el('g', { class: 'body-map__body' });
  for (const [key, d] of Object.entries(BODY_PATHS)) {
    bodyGroup.appendChild(el('path', { d, class: 'body-map__body-part', 'data-part': key }));
  }
  root.appendChild(bodyGroup);

  // ── 14 meridianos ──
  const meridianGroup = el('g', { class: 'body-map__meridians' });
  const meridianPaths = {};
  const meridianPoints = {}; // pointCode → {circle, x, y, meridianCode}

  for (const [code, d] of Object.entries(MERIDIANS)) {
    const g = el('g', { class: 'body-map__meridian', 'data-meridian': code });
    const path = el('path', {
      d,
      class: 'body-map__line',
      'data-meridian': code,
      stroke: COLORS[code] || 'var(--ink)',
    });
    g.appendChild(path);
    meridianGroup.appendChild(g);
    meridianPaths[code] = { path, group: g };
  }
  root.appendChild(meridianGroup);

  // ── Puntos ──
  // Distribuir uniformemente los puntos del meridiano a lo largo de su path.
  // Para BL y GV usamos solo el segmento facial visible (los puntos quedan
  // amontonados; aceptable como "los demás están detrás").
  const meridianPointCount = {};
  for (const m of meridians) meridianPointCount[m.code] = m.pointCount;

  const pointsByMeridian = {};
  for (const p of points) {
    if (!pointsByMeridian[p.meridian]) pointsByMeridian[p.meridian] = [];
    pointsByMeridian[p.meridian].push(p);
  }
  // Ordenar por número de código (LU1, LU2…)
  for (const code of Object.keys(pointsByMeridian)) {
    pointsByMeridian[code].sort((a, b) => {
      const na = parseInt(a.code.replace(/^[A-Z]+/, ''), 10);
      const nb = parseInt(b.code.replace(/^[A-Z]+/, ''), 10);
      return na - nb;
    });
  }

  const pointsLayer = el('g', { class: 'body-map__points' });
  root.appendChild(pointsLayer);

  for (const [code, pts] of Object.entries(pointsByMeridian)) {
    const pathInfo = meridianPaths[code];
    if (!pathInfo) continue;
    const length = pathInfo.path.getTotalLength();
    const n = pts.length;
    pts.forEach((p, i) => {
      // Distribuir entre 0 y length (inclusive). Avoid stacking at exactly 0.
      const t = (i + 0.5) / n;
      const pt = pathInfo.path.getPointAtLength(t * length);
      const dot = el('circle', {
        cx: pt.x, cy: pt.y, r: 2.5,
        class: 'body-map__point',
        'data-code': p.code,
        'data-meridian': code,
        fill: COLORS[code] || 'var(--ink)',
      });
      pointsLayer.appendChild(dot);
      meridianPoints[p.code] = { circle: dot, x: pt.x, y: pt.y, meridianCode: code };
    });
  }

  // ── API ──

  function setFilter(meridianCode) {
    // 'ALL' o un código específico
    const all = meridianCode === 'ALL';
    Object.entries(meridianPaths).forEach(([code, info]) => {
      info.group.classList.toggle('is-dim', !all && code !== meridianCode);
      info.group.classList.toggle('is-active', !all && code === meridianCode);
    });
    pointsLayer.querySelectorAll('.body-map__point').forEach((dot) => {
      const code = dot.dataset.meridian;
      dot.classList.toggle('is-dim', !all && code !== meridianCode);
      dot.classList.toggle('is-active', !all && code === meridianCode);
    });

    // Cuando filtras un meridiano, dibujamos su path con drawable (efecto tinta)
    if (!all) {
      const path = meridianPaths[meridianCode]?.path;
      if (path) {
        const drawable = svg.createDrawable(path);
        utils.set(drawable, { draw: '0 0' });
        animate(drawable, {
          draw: ['0 0', '0 1'],
          duration: 1200,
          ease: 'inOutQuad',
        });
        // Stagger fade-in de los puntos del meridiano activo
        const dots = [...pointsLayer.querySelectorAll(`.body-map__point[data-meridian="${meridianCode}"]`)];
        utils.set(dots, { scale: 0, opacity: 0, transformOrigin: 'center center' });
        animate(dots, {
          scale: [0, 1],
          opacity: [0, 1],
          duration: 500,
          delay: stagger(30),
          ease: 'outBack',
        });
      }
    }
  }

  function highlightPoint(code) {
    pointsLayer.querySelectorAll('.body-map__point').forEach((d) => d.classList.remove('is-hover'));
    const dot = meridianPoints[code]?.circle;
    if (dot) dot.classList.add('is-hover');
  }

  function getPointEl(code) {
    return meridianPoints[code]?.circle || null;
  }

  // Animación de entrada inicial
  function play() {
    utils.set(root, { opacity: 0, scale: 0.95 });
    animate(root, {
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 1200,
      ease: 'outExpo',
    });

    // Dibujar la silueta con stagger
    const bodyParts = [...bodyGroup.querySelectorAll('.body-map__body-part')];
    const drawables = svg.createDrawable(bodyParts);
    utils.set(drawables, { draw: '0 0' });
    animate(drawables, {
      draw: ['0 0', '0 1'],
      duration: 1500,
      delay: stagger(80),
      ease: 'inOutQuad',
    });

    // Líneas de meridiano: drawable también
    const merLines = [...meridianGroup.querySelectorAll('.body-map__line')];
    const merDrawables = svg.createDrawable(merLines);
    utils.set(merDrawables, { draw: '0 0' });
    animate(merDrawables, {
      draw: ['0 0', '0 1'],
      duration: 1100,
      delay: stagger(60, { start: 800 }),
      ease: 'inOutQuad',
    });

    // Puntos aparecen al final con stagger random
    const allDots = [...pointsLayer.querySelectorAll('.body-map__point')];
    utils.set(allDots, { scale: 0, opacity: 0, transformOrigin: 'center center' });
    animate(allDots, {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 380,
      delay: stagger(3, { from: 'random', start: 1800 }),
      ease: 'outQuad',
    });
  }

  return { svg: root, setFilter, highlightPoint, getPointEl, play };
}
