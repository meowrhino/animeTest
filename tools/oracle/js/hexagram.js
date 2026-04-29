// Section 4 — Reveal. Float the hexagram, halo, name typewriter, primary→secondary morph.
import { animate, createTimeline, stagger, utils, svg, spring } from '../../../shared/js/anime-import.js';
import {
  primaryBinary,
  secondaryBinary,
  hasMutables,
  getTrigrams,
  lookupHexagram,
} from './iching-logic.js';
import { createHexagram } from '../../../shared/js/svg-factory.js';

export function initReveal(state) {
  const section = document.getElementById('reveal');
  const halo = section.querySelector('.reveal__halo');
  const primaryHost = section.querySelector('[data-role="primary-hexagram"]');
  const secondaryHost = section.querySelector('[data-role="secondary-hexagram"]');
  const arrow = section.querySelector('#reveal-arrow');
  const secondaryFig = section.querySelector('#reveal-secondary');
  const numberEl = section.querySelector('#reveal-number');
  const nameCnEl = section.querySelector('#reveal-name-cn');
  const namePyEl = section.querySelector('#reveal-name-py');
  const meaningEl = section.querySelector('#reveal-meaning');
  const trigramsEl = section.querySelector('#reveal-trigrams');
  const cta = section.querySelector('.reveal__cta');

  function buildHexagrams() {
    primaryHost.innerHTML = '';
    secondaryHost.innerHTML = '';

    const primaryLines = state.lines.map((l) => ({
      yin: l.yin,
      mutable: l.mutable,
    }));
    primaryHost.appendChild(createHexagram(primaryLines));

    if (hasMutables(state.lines)) {
      // Secondary: mutables flipped, no mutable marks
      const secondaryLines = state.lines.map((l) => ({
        yin: l.mutable ? !l.yin : l.yin,
        mutable: false,
      }));
      secondaryHost.appendChild(createHexagram(secondaryLines));
      secondaryFig.hidden = false;
      arrow.hidden = false;
    } else {
      secondaryFig.hidden = true;
      arrow.hidden = true;
    }
  }

  function fillMeta() {
    const primaryBin = primaryBinary(state.lines);
    const data = lookupHexagram(primaryBin, state.iching);

    state.primaryBinary = primaryBin;
    state.secondaryBinary = hasMutables(state.lines) ? secondaryBinary(state.lines) : null;
    state.primary = data;
    state.secondary = state.secondaryBinary
      ? lookupHexagram(state.secondaryBinary, state.iching)
      : null;

    if (data) {
      numberEl.textContent = `Hexagrama № ${data.number}`;
      nameCnEl.textContent = data.name;
      namePyEl.textContent = data.pinyin;
      meaningEl.textContent = data.meaning;
      trigramsEl.textContent = data.trigrams;
    } else {
      numberEl.textContent = `Hexagrama ${primaryBin}`;
      nameCnEl.textContent = '—';
      namePyEl.textContent = '';
      const tris = getTrigrams(primaryBin);
      meaningEl.textContent = `${tris.upper.glyph} sobre ${tris.lower.glyph}`;
      trigramsEl.textContent = `${tris.upper.meaning} sobre ${tris.lower.meaning}`;
    }
  }

  function play() {
    buildHexagrams();
    fillMeta();

    const primaryLines = primaryHost.querySelectorAll('.hexagram__line');
    const secondaryLines = secondaryHost.querySelectorAll('.hexagram__line');
    const primarySegments = primaryHost.querySelectorAll('.line-segment');

    const metaItems = [numberEl, nameCnEl, namePyEl, meaningEl, trigramsEl];

    utils.set(halo, { opacity: 0, scale: 0.4 });
    utils.set(primaryHost, { opacity: 0, scale: 0.85 });
    utils.set(secondaryHost.parentElement, { opacity: 0, translateX: 20 });
    utils.set(arrow, { opacity: 0 });
    utils.set(metaItems, { opacity: 0, translateY: 12 });
    utils.set(cta, { opacity: 0, translateY: 12 });

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(halo, {
      opacity: [0, 1],
      scale: [0.4, 1],
      duration: 1800,
      ease: 'outQuad',
    }, 0);

    tl.add(primaryHost, {
      opacity: [0, 1],
      scale: [0.85, 1],
      duration: 1200,
      ease: spring({ mass: 1, stiffness: 80, damping: 14 }),
    }, 200);

    // Líneas del primario aparecen con stagger ritual desde abajo. El ease 'steps(6)'
    // discretiza la entrada en seis tiempos: cada línea se asienta con un beat de
    // tambor en lugar de una curva continua. Eco de la cuenta de tirada.
    tl.add(primaryLines, {
      translateY: [
        { from: 16, to: 0, duration: 800, ease: 'outExpo' },
      ],
      opacity: [0, 1],
      duration: 800,
      delay: stagger(110, { from: 'last' }), // bottom-up: 'last' del DOM = línea inferior real
      ease: 'steps(6)',
    }, '-=900');

    // Meta typewriter en cascada
    tl.add(metaItems, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
      delay: stagger(150),
    }, '-=400');

    // Si hay secundario: mostrar flecha y hexagrama secundario con efecto de transformación
    if (hasMutables(state.lines)) {
      tl.add(arrow, {
        opacity: [0, 1],
        duration: 600,
      }, '+=200');

      tl.add(secondaryHost.parentElement, {
        opacity: [0, 1],
        translateX: [20, 0],
        duration: 900,
      }, '-=300');

      // Las líneas mutables del primario "pulsan" para indicar el cambio
      const mutableLines = primaryHost.querySelectorAll('.hexagram__line[data-mutable="1"]');
      tl.add(mutableLines, {
        opacity: [
          { to: 0.4, duration: 400 },
          { to: 1, duration: 400 },
        ],
        loop: 2,
        ease: 'inOutSine',
      }, '-=600');

      // Líneas del secundario: aparecen con drawable (se dibujan)
      const secondarySegments = secondaryHost.querySelectorAll('.line-segment');
      const drawables = svg.createDrawable(secondarySegments);
      utils.set(drawables, { draw: '0 0' });
      utils.set(secondaryLines, { opacity: 1, translateY: 0 });

      tl.add(drawables, {
        draw: ['0 0', '0 1'],
        duration: 700,
        delay: stagger(70, { from: 'last' }),
        ease: 'inOutQuad',
      }, '-=400');
    }

    tl.add(cta, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
    });

    // Halo respirando suavemente en bucle
    animate(halo, {
      scale: [
        { to: 1.04, duration: 5000 },
        { to: 1, duration: 5000 },
      ],
      opacity: [
        { to: 0.7, duration: 5000 },
        { to: 1, duration: 5000 },
      ],
      loop: true,
      ease: 'inOutSine',
      delay: 2000,
    });

    return tl;
  }

  return { play };
}
