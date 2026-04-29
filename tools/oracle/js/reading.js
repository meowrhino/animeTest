// Section 5 — Reading. Long interpretation with scroll-triggered reveals.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { mutableIndices } from './iching-logic.js';
import { createHexagram } from '../../../shared/js/svg-factory.js';

export function initReading(state) {
  const section = document.getElementById('reading');
  const progressBar = section.querySelector('#reading-progress-bar');
  const questionEcho = section.querySelector('#reading-question-echo');
  const hexMini = section.querySelector('#reading-hex-mini');
  const nameCnEl = section.querySelector('#reading-name-cn');
  const namePyEl = section.querySelector('#reading-name-py');
  const meaningEl = section.querySelector('#reading-meaning');
  const judgmentEl = section.querySelector('#reading-judgment');
  const imageEl = section.querySelector('#reading-image');
  const textEl = section.querySelector('#reading-text');
  const mutBlock = section.querySelector('#reading-mutating-block');
  const mutList = section.querySelector('#reading-mutating-list');
  const secBlock = section.querySelector('#reading-secondary-block');
  const secNameEl = section.querySelector('#reading-secondary-name');
  const secTextEl = section.querySelector('#reading-secondary-text');

  let observer = null;

  function fillContent() {
    const data = state.primary;

    questionEcho.textContent = state.question || '';
    hexMini.innerHTML = '';
    const miniLines = state.lines.map((l) => ({ yin: l.yin, mutable: l.mutable }));
    hexMini.appendChild(createHexagram(miniLines));

    if (data) {
      nameCnEl.textContent = data.name;
      namePyEl.textContent = data.pinyin;
      meaningEl.textContent = data.meaning;
      judgmentEl.textContent = data.judgment;
      imageEl.textContent = data.image;
      textEl.textContent = data.reading;
    } else {
      nameCnEl.textContent = '—';
      namePyEl.textContent = '';
      meaningEl.textContent = 'Hexagrama no incluido en el stub inicial';
      judgmentEl.textContent = 'El texto del dictamen completaría aquí.';
      imageEl.textContent = 'La imagen aparecería aquí.';
      textEl.textContent =
        'Este hexagrama todavía no está en data/iching.json. Añade su entrada usando el binario correspondiente como clave.';
    }

    // Líneas mutables. Numerar con la posición real (1..6), no con el orden en que aparecen.
    const mutIdx = mutableIndices(state.lines);
    if (mutIdx.length > 0 && data?.lines) {
      mutBlock.hidden = false;
      mutList.innerHTML = '';
      mutIdx.forEach((idx) => {
        const li = document.createElement('li');
        li.dataset.lineNum = String(idx + 1); // CSS lo lee con attr() para mostrar el número
        li.textContent = data.lines[idx] ?? `Línea ${idx + 1}`;
        mutList.appendChild(li);
      });
    } else {
      mutBlock.hidden = true;
    }

    // Hexagrama secundario
    if (state.secondary) {
      secBlock.hidden = false;
      secNameEl.textContent = `${state.secondary.name} · ${state.secondary.pinyin} — ${state.secondary.meaning}`;
      secTextEl.textContent = state.secondary.reading;
    } else if (state.secondaryBinary) {
      secBlock.hidden = false;
      secNameEl.textContent = `Hexagrama ${state.secondaryBinary}`;
      secTextEl.textContent =
        'Este hexagrama secundario todavía no está en el stub.';
    } else {
      secBlock.hidden = true;
    }
  }

  function setupScrollObserver() {
    if (observer) observer.disconnect();
    const blocks = section.querySelectorAll('[data-block]:not([hidden])');

    utils.set(blocks, { opacity: 0, translateY: 24, clipPath: 'inset(0 0 100% 0)' });

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target, {
              opacity: [0, 1],
              translateY: [24, 0],
              clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
              duration: 1100,
              ease: 'outExpo',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { root: section, threshold: 0.15 }
    );
    blocks.forEach((b) => observer.observe(b));
  }

  function trackProgress() {
    section.addEventListener('scroll', () => {
      const max = section.scrollHeight - section.clientHeight;
      const pct = max > 0 ? (section.scrollTop / max) * 100 : 0;
      progressBar.style.height = `${pct}%`;
    });
  }

  function play() {
    fillContent();

    // Scroll al inicio
    section.scrollTop = 0;

    // Animación de entrada del header
    const header = section.querySelector('.reading__header');
    utils.set(header, { opacity: 0, translateY: 16 });
    animate(header, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 1000,
      ease: 'outExpo',
    });

    // Scroll observer para los bloques
    requestAnimationFrame(() => setupScrollObserver());
  }

  trackProgress();

  return { play };
}
