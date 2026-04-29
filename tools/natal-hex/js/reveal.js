// Animación de revelación del hexagrama natal: halo, líneas bottom-up, meta cascada.
// Si hay derivado, se muestra a la derecha con flecha.
import { animate, createTimeline, stagger, utils, svg, spring } from '../../../shared/js/anime-import.js';
import { createHexagram } from '../../../shared/js/svg-factory.js';

// Convierte el array de líneas [l1..l6] (1=yang, 0=yin, bottom-up) al formato
// que createHexagram espera: { yin: bool, mutable: bool }
function linesToFactory(lines, mutatingLine) {
  return lines.map((l, i) => ({
    yin: l === 0,
    mutable: mutatingLine != null && (i + 1) === mutatingLine,
  }));
}

export function initReveal({ section }) {
  const halo = section.querySelector('.reveal__halo');
  const primaryHost = section.querySelector('[data-role="natal-hexagram"]');
  const derivedHost = section.querySelector('[data-role="derived-hexagram"]');
  const arrow = section.querySelector('#natal-arrow');
  const derivedFig = section.querySelector('#natal-derived');
  const numberEl = section.querySelector('#natal-number');
  const nameCnEl = section.querySelector('#natal-name-cn');
  const namePyEl = section.querySelector('#natal-name-py');
  const meaningEl = section.querySelector('#natal-meaning');
  const trigramsEl = section.querySelector('#natal-trigrams');
  const actions = section.querySelectorAll('.reveal__actions .btn');

  function render(result) {
    primaryHost.innerHTML = '';
    derivedHost.innerHTML = '';

    const { natal, derived, mutatingLine } = result;

    // Hexagrama natal
    const natalLines = natal.lines
      ? linesToFactory(natal.lines, mutatingLine)
      : [];
    if (natalLines.length === 6) {
      primaryHost.appendChild(createHexagram(natalLines));
    } else {
      // Numerología no devuelve líneas, mostrar solo el unicode grande
      const ph = document.createElement('p');
      ph.style.cssText = 'font-family: var(--font-cn); font-size: 6rem; color: var(--ink); margin: 0;';
      ph.textContent = natal.unicode;
      primaryHost.appendChild(ph);
    }

    // Hexagrama derivado
    if (derived) {
      const derivedLines = linesToFactory(derived.lines, null);
      derivedHost.appendChild(createHexagram(derivedLines));
      derivedFig.hidden = false;
      arrow.hidden = false;
    } else {
      derivedFig.hidden = true;
      arrow.hidden = true;
    }

    // Meta
    numberEl.textContent = `Hexagrama № ${natal.number}`;
    nameCnEl.textContent = natal.chinese;
    namePyEl.textContent = natal.pinyin;
    meaningEl.textContent = natal.spanish;
    if (natal.upperTrigram && natal.lowerTrigram) {
      trigramsEl.textContent = `${natal.upperTrigram.chinese} sobre ${natal.lowerTrigram.chinese} · ${natal.upperTrigram.spanish} sobre ${natal.lowerTrigram.spanish}`;
    } else {
      trigramsEl.textContent = '';
    }
  }

  function play() {
    const primaryLines = primaryHost.querySelectorAll('.hexagram__line');
    const derivedSegments = derivedHost.querySelectorAll('.line-segment');
    const metaItems = [numberEl, nameCnEl, namePyEl, meaningEl, trigramsEl];

    utils.set(halo, { opacity: 0, scale: 0.4 });
    utils.set(primaryHost, { opacity: 0, scale: 0.85 });
    utils.set(metaItems, { opacity: 0, translateY: 12 });
    utils.set(actions, { opacity: 0, translateY: 12 });

    if (!derivedFig.hidden) {
      utils.set(derivedFig, { opacity: 0, translateX: 20 });
      utils.set(arrow, { opacity: 0 });
    }

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

    if (primaryLines.length > 0) {
      tl.add(primaryLines, {
        translateY: [{ from: 16, to: 0, duration: 800 }],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(80, { from: 'last' }),
      }, '-=900');
    }

    tl.add(metaItems, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
      delay: stagger(140),
    }, '-=400');

    if (!derivedFig.hidden) {
      tl.add(arrow, { opacity: [0, 1], duration: 600 }, '+=200');
      tl.add(derivedFig, {
        opacity: [0, 1],
        translateX: [20, 0],
        duration: 900,
      }, '-=300');
      if (derivedSegments.length) {
        const drawables = svg.createDrawable(derivedSegments);
        utils.set(drawables, { draw: '0 0' });
        tl.add(drawables, {
          draw: ['0 0', '0 1'],
          duration: 700,
          delay: stagger(70, { from: 'last' }),
          ease: 'inOutQuad',
        }, '-=400');
      }
    }

    tl.add(actions, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
      delay: stagger(120),
    }, '-=200');

    // Halo respirando en bucle
    animate(halo, {
      scale: [
        { to: 1.04, duration: 5000 },
        { to: 1,    duration: 5000 },
      ],
      loop: true,
      ease: 'inOutSine',
      delay: 2000,
    });

    return tl;
  }

  return { render, play };
}
