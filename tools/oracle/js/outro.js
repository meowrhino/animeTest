// Section 6 — Outro. Hexagram dissolves into particles, farewell, restart CTA.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { createHexagram } from '../../../shared/js/svg-factory.js';
import { splitText } from '../../../shared/js/utils.js';

const PARTICLE_COUNT = 80;

export function initOutro(state) {
  const section = document.getElementById('outro');
  const hexHost = section.querySelector('#outro-hexagram');
  const particlesHost = section.querySelector('#outro-particles');
  const farewellHost = section.querySelector('.outro__farewell [data-split]');
  const cta = section.querySelector('.outro__cta');

  function buildParticles() {
    particlesHost.innerHTML = '';
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'outro__particle';
      if (i % 7 === 0) p.classList.add('outro__particle--gold');
      else if (i % 11 === 0) p.classList.add('outro__particle--jade');
      // Random initial position around the hexagram center
      p.style.left = `${50 + (Math.random() - 0.5) * 30}%`;
      p.style.top = `${50 + (Math.random() - 0.5) * 30}%`;
      particlesHost.appendChild(p);
      particles.push(p);
    }
    return particles;
  }

  function buildHexagram() {
    hexHost.innerHTML = '';
    const lines = state.lines.map((l) => ({ yin: l.yin, mutable: l.mutable }));
    hexHost.appendChild(createHexagram(lines));
  }

  function play() {
    buildHexagram();
    const particles = buildParticles();
    const chars = splitText(farewellHost);

    const hexLines = hexHost.querySelectorAll('.hexagram__line');
    const lineSegments = hexHost.querySelectorAll('.line-segment');

    utils.set(particles, { opacity: 0, scale: 0 });
    utils.set(chars, { opacity: 0, translateY: 14, filter: 'blur(6px)' });
    utils.set(cta, { opacity: 0, translateY: 12 });
    utils.set(hexHost, { opacity: 1, scale: 1 });

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    // Pause: el hexagrama vibra ligeramente antes de disolverse
    tl.add(hexHost, {
      scale: [
        { to: 1.05, duration: 600, ease: 'inOutSine' },
        { to: 0.98, duration: 400, ease: 'inOutSine' },
      ],
    }, 200);

    // Disolverse: hexagrama desaparece, partículas explotan hacia fuera
    tl.add(hexLines, {
      opacity: [1, 0],
      scale: [1, 1.2],
      filter: ['blur(0px)', 'blur(6px)'],
      duration: 1200,
      delay: stagger(60, { from: 'center' }),
      ease: 'outQuad',
    }, '+=200');

    tl.add(particles, {
      opacity: [
        { to: 1, duration: 200 },
        { to: 0, duration: 1400 },
      ],
      scale: [
        { to: 1, duration: 200 },
        { to: 0.4, duration: 1400 },
      ],
      translateX: () => `${(Math.random() - 0.5) * 600}px`,
      translateY: () => `${(Math.random() - 0.5) * 600}px`,
      duration: 1600,
      delay: stagger(8, { from: 'center' }),
      ease: 'outQuad',
    }, '-=1100');

    tl.add(chars, {
      opacity: [0, 1],
      translateY: [14, 0],
      filter: ['blur(6px)', 'blur(0px)'],
      duration: 800,
      delay: stagger(40),
    }, '-=600');

    tl.add(cta, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
    }, '-=200');

    return tl;
  }

  cta.addEventListener('click', () => {
    state.restart();
  });

  return { play };
}
