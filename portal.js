// portal.js — landing del proyecto.
// Manchas de tinta vivas (drift + parallax + breathing), cards magnéticas que se inclinan
// hacia el cursor, glyphs que respiran al hover. Page-out con fade al navegar.
import { animate, createTimeline, stagger, utils, spring } from './shared/js/anime-import.js';
import { splitText } from './shared/js/utils.js';

function init() {
  const titleCn = document.querySelector('.portal__title-cn');
  const titleText = document.querySelector('.portal__title-text');
  const subtitleHost = document.querySelector('.portal__subtitle [data-split]');
  const cards = [...document.querySelectorAll('.portal__card')];
  const credits = document.querySelector('.portal__credits');
  const blobs = [...document.querySelectorAll('.ink-blob')];
  const glyphs = [...document.querySelectorAll('.portal__glyph')];

  const chars = splitText(subtitleHost);

  // Estado inicial (todo escondido)
  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 24 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(cards,     { opacity: 0, translateY: 24 });
  utils.set(credits,   { opacity: 0 });
  utils.set(blobs,     { opacity: 0, scale: 0.4 });

  // ── Timeline de entrada ──
  const tl = createTimeline({ defaults: { ease: 'outExpo' } });

  tl.add(blobs, {
    opacity: (_, i) => [0, [0.85, 0.7, 0.6, 0.55, 0.4][i] || 0.6],
    scale: [0.4, 1],
    duration: 2200,
    delay: stagger(180),
    ease: 'outQuad',
  }, 0);

  tl.add(titleCn, {
    opacity: [0, 1],
    scale: [0.7, 1],
    translateY: [24, 0],
    duration: 1400,
  }, 300);

  tl.add(titleText, {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 800,
  }, '-=900');

  tl.add(chars, {
    opacity: [0, 1],
    translateY: [8, 0],
    filter: ['blur(6px)', 'blur(0px)'],
    duration: 700,
    delay: stagger(20),
  }, '-=600');

  tl.add(cards, {
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 900,
    delay: stagger(120),
  }, '-=400');

  tl.add(credits, {
    opacity: [0, 1],
    duration: 800,
  }, '-=300');

  // ── Loops ambient ──

  // Respiración del glyph principal
  animate(titleCn, {
    scale: [
      { to: 1.012, duration: 5000 },
      { to: 1,     duration: 5000 },
    ],
    loop: true,
    ease: 'inOutSine',
    delay: 2800,
  });

  // Loops ambient — arrancan tras la entrada para no saturar el motor.
  // Una sola animación por elemento (keyframes) en vez de tres paralelas.
  const bgGlyphs = [...document.querySelectorAll('.portal__bg-glyph')];

  setTimeout(() => {
    bgGlyphs.forEach((glyph, i) => {
      const period = 12000 + i * 1100;
      animate(glyph, {
        translateY: [
          { to: -6, duration: period * 0.5 },
          { to:  4, duration: period * 0.5 },
        ],
        rotate: [
          { to: -1.5, duration: period * 0.5 },
          { to:  1.5, duration: period * 0.5 },
        ],
        loop: true,
        ease: 'inOutSine',
        delay: i * 250,
      });
    });

    blobs.forEach((blob, i) => {
      const driftX = 14 + (i * 6) % 12;
      const driftY = 18 + (i * 9) % 14;
      const period = 11000 + i * 1300;
      animate(blob, {
        translateX: [
          { to:  driftX, duration: period * 0.5 },
          { to: -driftX, duration: period * 0.5 },
        ],
        translateY: [
          { to: -driftY, duration: period * 0.5 },
          { to:  driftY, duration: period * 0.5 },
        ],
        scale: [
          { to: 1.05, duration: period * 0.5 },
          { to: 0.96, duration: period * 0.5 },
        ],
        loop: true,
        ease: 'inOutSine',
        delay: i * 300,
      });
    });
  }, 3500); // tras el timeline de entrada

  // ── Cards magnéticas: cuando el cursor entra en una card, glyph + bg-glyph reaccionan ──
  cards.forEach((card) => {
    const glyph = card.querySelector('.portal__glyph');
    const bgGlyph = card.querySelector('.portal__bg-glyph');
    const cn = card.querySelector('.portal__cn');

    card.addEventListener('pointerenter', () => {
      animate(glyph, {
        scale: [1, 1.22],
        rotate: [0, 6],
        duration: 700,
        ease: spring({ mass: 1, stiffness: 90, damping: 10 }),
      });
      if (bgGlyph) animate(bgGlyph, {
        scale: [bgGlyph.dataset.idleScale || 1, 1.12],
        rotate: -8,
        translateX: [0, -10],
        translateY: [0, -10],
        duration: 900,
        ease: 'outExpo',
      });
      if (cn) animate(cn, {
        translateX: [0, 6],
        opacity: [0.7, 1],
        duration: 500,
        ease: 'outExpo',
      });
    });

    card.addEventListener('pointerleave', () => {
      animate(glyph, {
        scale: 1,
        rotate: 0,
        duration: 600,
        ease: spring({ mass: 1, stiffness: 70, damping: 14 }),
      });
      if (bgGlyph) animate(bgGlyph, {
        scale: 1,
        rotate: 0,
        translateX: 0,
        translateY: 0,
        duration: 800,
        ease: 'outExpo',
      });
      if (cn) animate(cn, {
        translateX: 0,
        opacity: 0.7,
        duration: 500,
        ease: 'outExpo',
      });
    });

    // Tilt magnético: la card se inclina sutilmente según dónde esté el cursor sobre ella
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5..0.5
      const py = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltMax = 4; // grados máx
      card.style.setProperty('--tilt-x', `${-py * tiltMax}deg`);
      card.style.setProperty('--tilt-y', `${ px * tiltMax}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });

  // ── Page-out: al clicar una card, las demás se desvanecen y la elegida se va a fullscreen ──
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

      animate(others, {
        opacity: [1, 0],
        translateY: [0, 8],
        scale: [1, 0.96],
        duration: 360,
        delay: stagger(28),
        ease: 'inQuad',
      });
      animate([titleEl, subtitleEl, creditsEl], {
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
