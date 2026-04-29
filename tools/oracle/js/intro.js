// Section 1 — Intro hero. Calligraphy 易, staggered subtitle, ink stains, shimmer CTA.
import { animate, createTimeline, stagger, utils, spring } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';

export function initIntro() {
  const section = document.getElementById('intro');
  const glyph = section.querySelector('.intro__glyph');
  const subtitleHost = section.querySelector('.intro__subtitle [data-split]');
  const hint = section.querySelector('.intro__hint');
  const cta = section.querySelector('.intro__cta');
  const stains = section.querySelectorAll('.ink-stain');

  const chars = splitText(subtitleHost);
  let ambientStarted = false;

  function reset() {
    utils.set(glyph, { opacity: 0, scale: 0.6, translateY: 30 });
    utils.set(chars, { opacity: 0, translateY: 14, filter: 'blur(8px)' });
    utils.set(hint, { opacity: 0 });
    utils.set(cta, { opacity: 0, translateY: 12 });
    utils.set(stains, { opacity: 0, scale: 0.4 });
  }

  function play() {
    reset();

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(stains, {
      opacity: [0, 0.85],
      scale: [0.4, 1],
      duration: 2400,
      delay: stagger(280),
      ease: 'inOutSine',
    }, 0);

    tl.add(glyph, {
      opacity: [0, 1],
      scale: [0.6, 1],
      translateY: [30, 0],
      duration: 1800,
      ease: spring({ mass: 1, stiffness: 80, damping: 14 }),
    }, 350);

    tl.add(chars, {
      opacity: [0, 1],
      translateY: [14, 0],
      filter: ['blur(8px)', 'blur(0px)'],
      duration: 900,
      delay: stagger(45),
    }, '-=900');

    tl.add(hint, {
      opacity: [0, 0.75],
      duration: 800,
    }, '-=500');

    tl.add(cta, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
    }, '-=400');

    if (!ambientStarted) {
      ambientStarted = true;
      // Manchas de tinta respiran lentamente en bucle
      animate(stains, {
        scale: [
          { to: 1.05, duration: 4000 },
          { to: 1, duration: 4000 },
        ],
        loop: true,
        ease: 'inOutSine',
        delay: stagger(600, { start: 4000 }),
      });

      // Micro-respiración del glyph
      animate(glyph, {
        scale: [
          { to: 1.015, duration: 4500 },
          { to: 1, duration: 4500 },
        ],
        loop: true,
        ease: 'inOutSine',
        delay: 3500,
      });
    }

    return tl;
  }

  return { play };
}
