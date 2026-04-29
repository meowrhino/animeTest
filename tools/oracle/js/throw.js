// Section 3 — orchestrator. Selects coins or stalks method based on state.method,
// runs 6 throws, and draws each resulting line into the hexagram bottom-up.
import { animate, createTimeline, stagger, utils, svg, spring } from '../../../shared/js/anime-import.js';
import { wait } from '../../../shared/js/utils.js';
import { createCoinThrow } from './throw-coins.js';
import { createStalkThrow } from './throw-stalks.js';
import { createEmptyHexagram, fillLineSlot } from '../../../shared/js/svg-factory.js';

const TOTAL_LINES = 6;

export function initThrow(state) {
  const section = document.getElementById('throw');
  const visualHost = section.querySelector('#throw-visual');
  const hexHost = section.querySelector('#throw-hexagram');
  const counterEl = section.querySelector('#throw-current');
  const cta = section.querySelector('#throw-cta');
  const questionEcho = section.querySelector('#throw-question-echo');

  let methodApi = null;
  let hexagramEl = null;
  let currentLine = 0;
  let isThrowing = false;

  function buildMethod() {
    if (methodApi?.destroy) methodApi.destroy();
    visualHost.innerHTML = '';
    methodApi = state.method === 'stalks'
      ? createStalkThrow({ host: visualHost })
      : createCoinThrow({ host: visualHost });
  }

  function setup() {
    buildMethod();

    hexHost.innerHTML = '';
    hexagramEl = createEmptyHexagram();
    hexHost.appendChild(hexagramEl);

    state.lines = [];
    currentLine = 0;
    counterEl.textContent = '1';
    questionEcho.textContent = state.question || '';

    cta.textContent = labelForState();
    cta.disabled = false;
  }

  function labelForState() {
    if (currentLine >= TOTAL_LINES) return 'Ver hexagrama';
    return state.method === 'stalks' ? 'Iniciar ronda' : 'Lanzar';
  }

  // Anima una línea recién tirada en su slot del hexagrama (bottom-up).
  async function drawLineIntoHexagram(line, index) {
    const slot = fillLineSlot(hexagramEl, index, line);
    if (!slot) return;

    const svgEl = slot.querySelector('svg');
    const segments = svgEl.querySelectorAll('.line-segment');
    const drawables = svg.createDrawable(segments);

    utils.set(slot, { opacity: 0, translateY: -8 });
    utils.set(drawables, { draw: '0 0' });

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(slot, {
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: 500,
    });

    tl.add(drawables, {
      draw: ['0 0', '0 1'],
      duration: 760,
      delay: stagger(80),
      ease: 'inOutQuad',
    }, '-=320');

    if (line.mutable) {
      const mark = svgEl.querySelector('.line-mutable-mark');
      if (mark) {
        utils.set(mark, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
        tl.add(mark, {
          scale: [0, 1],
          opacity: [0, 1],
          duration: 600,
          ease: spring({ mass: 1, stiffness: 120, damping: 9 }),
        }, '-=200');
      }
    }

    await tl;
  }

  async function throwOneLineUI() {
    if (isThrowing || currentLine >= TOTAL_LINES) return;
    isThrowing = true;
    cta.disabled = true;

    const line = await methodApi.throwLine();
    state.lines.push(line);

    await drawLineIntoHexagram(line, currentLine);

    currentLine++;
    if (currentLine < TOTAL_LINES) {
      counterEl.textContent = String(currentLine + 1);
    }

    await methodApi.exit();
    if (currentLine < TOTAL_LINES) methodApi.reset();

    isThrowing = false;
    cta.textContent = labelForState();
    cta.disabled = false;
  }

  cta.addEventListener('click', () => {
    if (isThrowing) return;
    if (currentLine >= TOTAL_LINES) {
      state.go('reveal');
      return;
    }
    throwOneLineUI();
  });

  function play() {
    setup();
    const header = section.querySelector('.throw__header');
    const stage = section.querySelector('.throw__stage');
    utils.set([header, stage, cta], { opacity: 0, translateY: 12 });
    return createTimeline({ defaults: { ease: 'outExpo' } })
      .add(header, { opacity: [0, 1], translateY: [12, 0], duration: 800 })
      .add(stage,  { opacity: [0, 1], translateY: [12, 0], duration: 800 }, '-=500')
      .add(cta,    { opacity: [0, 1], translateY: [12, 0], duration: 600 }, '-=400');
  }

  return { play, setup };
}
