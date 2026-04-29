// portal.js — animación de entrada de la landing.
// Stagger del título, subtítulo letra-por-letra, cards con cascada y glyph que respira en hover.
import { animate, createTimeline, stagger, utils } from './shared/js/anime-import.js';
import { splitText } from './shared/js/utils.js';

function init() {
  const titleCn = document.querySelector('.portal__title-cn');
  const titleText = document.querySelector('.portal__title-text');
  const subtitleHost = document.querySelector('.portal__subtitle [data-split]');
  const cards = document.querySelectorAll('.portal__card');
  const credits = document.querySelector('.portal__credits');

  const chars = splitText(subtitleHost);

  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 24 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(cards,     { opacity: 0, translateY: 24 });
  utils.set(credits,   { opacity: 0 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });

  tl.add(titleCn, {
    opacity: [0, 1],
    scale: [0.7, 1],
    translateY: [24, 0],
    duration: 1400,
  }, 200);

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

  // Loop muy sutil del glyph principal (respiración)
  animate(titleCn, {
    scale: [
      { to: 1.012, duration: 5000 },
      { to: 1, duration: 5000 },
    ],
    loop: true,
    ease: 'inOutSine',
    delay: 2400,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
