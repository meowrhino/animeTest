// portal.js — landing del proyecto.
// Reloj vivo de meridianos en el centro + cards con efecto temático ligero.
// Manchas de tinta de fondo respirando.
import { animate, createTimeline, stagger, utils, svg, spring } from './shared/js/anime-import.js';
import { splitText } from './shared/js/utils.js';
import { createBodyClock, meridianAt } from './shared/js/body-clock.js';

const ELEMENT_LABEL = {
  Fire:  'Fuego (emperador)',
  Water: 'Agua',
  Wood:  'Madera',
  Metal: 'Metal',
  Earth: 'Tierra',
};
const MFIRE_CODES = new Set(['PC', 'TE']);

async function loadMeridians() {
  try {
    const res = await fetch('./tools/meridian-clock/data/meridians.json');
    const data = await res.json();
    return data.meridians;
  } catch (err) {
    console.warn('meridians fetch failed', err);
    return [];
  }
}

function paintClockInfo(m, fromHover = false) {
  const whenEl = document.getElementById('portal-clock-when');
  const cnEl = document.getElementById('portal-clock-cn');
  const nameEl = document.getElementById('portal-clock-name');
  const elementEl = document.getElementById('portal-clock-element');
  const adviceEl = document.getElementById('portal-clock-advice');
  if (!whenEl) return;

  if (fromHover && m) {
    whenEl.textContent = `${m.timeSlot.start} — ${m.timeSlot.end}`;
  } else {
    const now = new Date();
    whenEl.textContent = `Ahora · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  if (!m) {
    cnEl.textContent = '—';
    nameEl.textContent = 'Pasa el cursor por un meridiano';
    elementEl.textContent = '';
    adviceEl.textContent = '';
    return;
  }

  cnEl.textContent = m.chinese;
  nameEl.textContent = m.spanish;
  const isMF = MFIRE_CODES.has(m.code);
  const elementName = ELEMENT_LABEL[m.element] || m.element;
  elementEl.textContent = isMF ? 'Fuego (ministerial)' : elementName;
  // Color del texto del elemento según meridiano
  const elColor = {
    Fire: '#c06858', mFire: '#c07850', Water: '#4c7b9c',
    Wood: '#5b8a5b', Metal: '#7e6e9e', Earth: '#b08f3c',
  }[isMF ? 'mFire' : m.element] || 'currentColor';
  elementEl.style.color = elColor;

  // Mostrar primera frase de la recomendación (la sentencia inicial)
  const firstSentence = m.recommendation.split('.').slice(0, 1).join('.') + '.';
  adviceEl.textContent = firstSentence;
}

async function setupHomeClock() {
  const host = document.getElementById('portal-clock-host');
  if (!host) return null;
  const meridians = await loadMeridians();
  if (!meridians.length) return null;

  const clock = createBodyClock({
    host,
    meridians,
    size: 600,
  });

  clock.onHover((m) => {
    if (m) paintClockInfo(m, true);
    else paintClockInfo(meridianAt(new Date(), meridians));
  });

  clock.onClick(() => {
    window.location.href = './tools/meridian-clock/';
  });

  paintClockInfo(meridianAt(new Date(), meridians));
  setInterval(() => paintClockInfo(meridianAt(new Date(), meridians)), 30 * 1000);

  return { meridians, clock };
}

// ─────────────────────────────────────────────────────────────────
// Per-card thematic decorations: cada card recibe un pequeño SVG en
// la esquina superior derecha que se anima al hover. La forma del
// decorativo evoca lo que la herramienta hace.
// ─────────────────────────────────────────────────────────────────

const CARD_DECORATIONS = {
  oracle:    { type: 'lines',   count: 6, label: 'hexagrama' },
  'natal-hex': { type: 'lines',  count: 6, label: 'hexagrama' },
  pakua:     { type: 'trigrams', count: 8, label: 'bagua' },
  zodiac:    { type: 'circle-dots', count: 12, label: 'animales' },
  'natal-chart': { type: 'stars', count: 5, label: 'estrellas' },
  'meridian-clock': { type: 'ticks', count: 12, label: 'horas' },
  acupuncture: { type: 'point-column', count: 7, label: 'puntos' },
};

const TRIGRAMS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

function makeSVG(viewBox, attrs = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svgEl = document.createElementNS(ns, 'svg');
  svgEl.setAttribute('viewBox', viewBox);
  for (const [k, v] of Object.entries(attrs)) svgEl.setAttribute(k, v);
  return svgEl;
}
function svgEl(tag, attrs = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const e = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function buildDecoration(type, count) {
  const W = 60, H = 60;
  const svgRoot = makeSVG(`0 0 ${W} ${H}`, { class: 'portal__deco' });

  if (type === 'lines') {
    // 6 líneas horizontales apiladas (hexagrama)
    const lineH = 4;
    const gap = 6;
    const totalH = count * lineH + (count - 1) * gap;
    const startY = (H - totalH) / 2;
    for (let i = 0; i < count; i++) {
      const y = startY + i * (lineH + gap) + lineH / 2;
      // Alternar línea entera y línea con hueco
      const broken = i % 2 === 1;
      if (broken) {
        svgRoot.appendChild(svgEl('line', { x1: 6,  y1: y, x2: 26, y2: y, class: 'portal__deco-line' }));
        svgRoot.appendChild(svgEl('line', { x1: 34, y1: y, x2: 54, y2: y, class: 'portal__deco-line' }));
      } else {
        svgRoot.appendChild(svgEl('line', { x1: 6,  y1: y, x2: 54, y2: y, class: 'portal__deco-line' }));
      }
    }
  } else if (type === 'trigrams') {
    // 8 trigramas pequeños en círculo
    const r = 22;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = W / 2 + Math.cos(a) * r;
      const y = H / 2 + Math.sin(a) * r;
      const t = svgEl('text', {
        x, y,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': '8',
        class: 'portal__deco-trigram',
      });
      t.textContent = TRIGRAMS[i];
      svgRoot.appendChild(t);
    }
  } else if (type === 'circle-dots') {
    const r = 22;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = W / 2 + Math.cos(a) * r;
      const y = H / 2 + Math.sin(a) * r;
      svgRoot.appendChild(svgEl('circle', { cx: x, cy: y, r: 1.6, class: 'portal__deco-dot' }));
    }
  } else if (type === 'stars') {
    // 5 estrellas dispuestas como constelación
    const positions = [[14, 18], [42, 14], [22, 38], [48, 36], [30, 52]];
    positions.forEach(([x, y]) => {
      svgRoot.appendChild(svgEl('circle', { cx: x, cy: y, r: 1.4, class: 'portal__deco-dot' }));
    });
    // Líneas conectando (constelación)
    const links = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]];
    links.forEach(([a, b]) => {
      svgRoot.appendChild(svgEl('line', {
        x1: positions[a][0], y1: positions[a][1],
        x2: positions[b][0], y2: positions[b][1],
        class: 'portal__deco-line',
      }));
    });
  } else if (type === 'ticks') {
    // 12 ticks de reloj
    const r = 22;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x1 = W / 2 + Math.cos(a) * (r - 3);
      const y1 = H / 2 + Math.sin(a) * (r - 3);
      const x2 = W / 2 + Math.cos(a) * r;
      const y2 = H / 2 + Math.sin(a) * r;
      svgRoot.appendChild(svgEl('line', { x1, y1, x2, y2, class: 'portal__deco-line' }));
    }
    // Aguja
    svgRoot.appendChild(svgEl('line', {
      x1: W / 2, y1: H / 2,
      x2: W / 2, y2: H / 2 - 14,
      class: 'portal__deco-line portal__deco-hand',
    }));
    svgRoot.appendChild(svgEl('circle', { cx: W / 2, cy: H / 2, r: 1.5, class: 'portal__deco-dot' }));
  } else if (type === 'point-column') {
    // 7 puntos en columna vertical (recorrido de un meridiano)
    const startY = 8, endY = 52;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const y = startY + t * (endY - startY);
      const x = W / 2 + Math.sin(t * Math.PI * 2) * 4; // pequeña ondulación
      svgRoot.appendChild(svgEl('circle', { cx: x, cy: y, r: 1.8, class: 'portal__deco-dot' }));
    }
    // Línea curva por dentro
    svgRoot.appendChild(svgEl('path', {
      d: `M ${W/2} 8 Q ${W/2 + 4} 30 ${W/2} 52`,
      class: 'portal__deco-line',
      fill: 'none',
    }));
  }

  return svgRoot;
}

function setupCardDecorations() {
  const cards = document.querySelectorAll('.portal__card');
  cards.forEach((card) => {
    const link = card.querySelector('.portal__link');
    const tool = link?.getAttribute('href')?.match(/\/tools\/([^/]+)/)?.[1];
    if (!tool) return;
    const config = CARD_DECORATIONS[tool];
    if (!config) return;

    const deco = buildDecoration(config.type, config.count);
    card.appendChild(deco);
    card.dataset.tool = tool;

    // Estado inicial: deco escondido
    utils.set(deco, { opacity: 0, scale: 0.85 });

    card.addEventListener('pointerenter', () => {
      animate(deco, {
        opacity: [0, 1],
        scale: [0.85, 1],
        duration: 500,
        ease: 'outExpo',
      });
      // Animación temática según tipo
      const lines = deco.querySelectorAll('.portal__deco-line');
      const dots = deco.querySelectorAll('.portal__deco-dot');
      const trigrams = deco.querySelectorAll('.portal__deco-trigram');

      if (lines.length) {
        const drawables = svg.createDrawable([...lines]);
        utils.set(drawables, { draw: '0 0' });
        animate(drawables, {
          draw: ['0 0', '0 1'],
          duration: 600,
          delay: stagger(50),
          ease: 'inOutQuad',
        });
      }
      if (dots.length) {
        utils.set(dots, { scale: 0, transformOrigin: 'center center' });
        animate(dots, {
          scale: [0, 1],
          duration: 400,
          delay: stagger(40),
          ease: 'outBack',
        });
      }
      if (trigrams.length) {
        utils.set(trigrams, { opacity: 0, scale: 0.5 });
        animate(trigrams, {
          opacity: [0, 1],
          scale: [0.5, 1],
          duration: 500,
          delay: stagger(40, { from: 'first' }),
          ease: 'outExpo',
        });
      }
      // El reloj de la card decorativa: aguja gira
      const hand = deco.querySelector('.portal__deco-hand');
      if (hand) {
        utils.set(hand, { transformOrigin: '30px 30px', rotate: 0 });
        animate(hand, {
          rotate: 360,
          duration: 1200,
          ease: 'inOutQuad',
        });
      }
    });

    card.addEventListener('pointerleave', () => {
      animate(deco, {
        opacity: 0,
        scale: 0.85,
        duration: 400,
        ease: 'inQuad',
      });
    });
  });
}

function init() {
  const titleCn = document.querySelector('.portal__title-cn');
  const titleText = document.querySelector('.portal__title-text');
  const subtitleHost = document.querySelector('.portal__subtitle [data-split]');
  const cards = [...document.querySelectorAll('.portal__card')];
  const credits = document.querySelector('.portal__credits');
  const blobs = [...document.querySelectorAll('.ink-blob')];
  const clockSection = document.querySelector('.portal__clock');

  const chars = splitText(subtitleHost);

  // Estado inicial
  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 24 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(cards,     { opacity: 0, translateY: 24 });
  utils.set(credits,   { opacity: 0 });
  utils.set(blobs,     { opacity: 0, scale: 0.4 });
  if (clockSection) utils.set(clockSection, { opacity: 0, translateY: 16 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });

  tl.add(blobs, {
    opacity: (_, i) => [0, [0.85, 0.7, 0.6, 0.55, 0.4][i] || 0.6],
    scale: [0.4, 1],
    duration: 2200,
    delay: stagger(180),
    ease: 'outQuad',
  }, 0);

  tl.add(titleCn, {
    opacity: [0, 1], scale: [0.7, 1], translateY: [24, 0], duration: 1400,
  }, 300);

  tl.add(titleText, {
    opacity: [0, 1], translateY: [12, 0], duration: 800,
  }, '-=900');

  tl.add(chars, {
    opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'],
    duration: 700, delay: stagger(20),
  }, '-=600');

  if (clockSection) tl.add(clockSection, {
    opacity: [0, 1], translateY: [16, 0], duration: 1100,
  }, '-=400');

  tl.add(cards, {
    opacity: [0, 1], translateY: [24, 0], duration: 900, delay: stagger(120),
  }, '-=600');

  tl.add(credits, {
    opacity: [0, 1], duration: 800,
  }, '-=300');

  // Glyph principal respirando
  animate(titleCn, {
    scale: [
      { to: 1.012, duration: 5000 },
      { to: 1,     duration: 5000 },
    ],
    loop: true,
    ease: 'inOutSine',
    delay: 2800,
  });

  // Loops ambient (manchas de tinta + glyphs de fondo) tras la entrada
  setTimeout(() => {
    blobs.forEach((blob, i) => {
      const driftX = 14 + (i * 6) % 12;
      const driftY = 18 + (i * 9) % 14;
      const period = 11000 + i * 1300;
      animate(blob, {
        translateX: [{ to:  driftX, duration: period * 0.5 }, { to: -driftX, duration: period * 0.5 }],
        translateY: [{ to: -driftY, duration: period * 0.5 }, { to:  driftY, duration: period * 0.5 }],
        scale:      [{ to: 1.05,    duration: period * 0.5 }, { to: 0.96,   duration: period * 0.5 }],
        loop: true,
        ease: 'inOutSine',
        delay: i * 300,
      });
    });

    const bgGlyphs = [...document.querySelectorAll('.portal__bg-glyph')];
    bgGlyphs.forEach((glyph, i) => {
      const period = 12000 + i * 1100;
      animate(glyph, {
        translateY: [{ to: -4, duration: period * 0.5 }, { to: 4, duration: period * 0.5 }],
        rotate:     [{ to: -1.2, duration: period * 0.5 }, { to: 1.2, duration: period * 0.5 }],
        loop: true,
        ease: 'inOutSine',
        delay: i * 250,
      });
    });
  }, 3500);

  // ── Cards: glyph reactivo en hover (scale + rotate sutil), bg-glyph estable ──
  cards.forEach((card) => {
    const glyph = card.querySelector('.portal__glyph');
    const bgGlyph = card.querySelector('.portal__bg-glyph');

    card.addEventListener('pointerenter', () => {
      if (glyph) animate(glyph, {
        scale: [1, 1.18],
        rotate: [0, 4],
        duration: 600,
        ease: spring({ mass: 1, stiffness: 90, damping: 10 }),
      });
      if (bgGlyph) animate(bgGlyph, {
        scale: [1, 1.06],
        opacity: 0.95,
        duration: 700,
        ease: 'outExpo',
      });
    });

    card.addEventListener('pointerleave', () => {
      if (glyph) animate(glyph, {
        scale: 1,
        rotate: 0,
        duration: 500,
        ease: spring({ mass: 1, stiffness: 70, damping: 14 }),
      });
      if (bgGlyph) animate(bgGlyph, {
        scale: 1,
        opacity: 0.6,
        duration: 700,
        ease: 'outExpo',
      });
    });
  });

  setupCardDecorations();

  // Page-out: al clicar una card, las demás se desvanecen y la elegida se va a fullscreen
  document.querySelectorAll('.portal__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank') return;
      e.preventDefault();
      const card = link.closest('.portal__card');

      const others = cards.filter((c) => c !== card);
      const titleEl = document.querySelector('.portal__title');
      const subtitleEl = document.querySelector('.portal__subtitle');
      const creditsEl = document.querySelector('.portal__credits');
      const otherEls = [titleEl, subtitleEl, creditsEl, clockSection].filter(Boolean);

      animate(others, {
        opacity: [1, 0],
        translateY: [0, 8],
        scale: [1, 0.96],
        duration: 360,
        delay: stagger(28),
        ease: 'inQuad',
      });
      animate(otherEls, {
        opacity: [1, 0],
        translateY: [0, 6],
        duration: 360,
        delay: stagger(20),
        ease: 'inQuad',
      });
      animate(card, {
        scale: [1, 1.04],
        duration: 700,
        ease: 'outQuad',
      });
      animate(card, {
        opacity: [1, 0],
        duration: 380,
        ease: 'inQuad',
        delay: 320,
        onComplete: () => { window.location.href = href; },
      });
    });
  });

  setupHomeClock();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
