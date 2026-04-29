// main.js — orchestrator del Hexagrama de Nacimiento.
// Form → cálculo (3 métodos) → reveal animado → lectura desde markdown.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';
import { compute, METHODS } from './methods/index.js';
import { initReveal } from './reveal.js';
import { initReading } from './reading.js';

const SECTIONS = ['intro', 'reveal', 'reading'];

const state = {
  method: 'jingFang',
  birth: null,
  result: null,
  currentSection: 'intro',
};

function go(target) {
  if (!SECTIONS.includes(target)) return;
  if (target === state.currentSection) return;

  const currentEl = document.getElementById(state.currentSection);
  const targetEl = document.getElementById(target);
  if (!targetEl) return;

  if (currentEl) currentEl.classList.remove('is-active');
  targetEl.classList.add('is-active');
  state.currentSection = target;

  const handler = sectionPlay[target];
  if (handler) requestAnimationFrame(() => handler());
}

const sectionPlay = {};
let revealApi = null;
let readingApi = null;

function setupIntroAnimation() {
  const subtitleHost = document.querySelector('.natal__subtitle [data-split]');
  const titleCn = document.querySelector('.natal__title-cn');
  const titleText = document.querySelector('.natal__title-text');
  const form = document.querySelector('.natal__form');

  const chars = splitText(subtitleHost);

  function play() {
    utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 20 });
    utils.set(titleText, { opacity: 0, translateY: 12 });
    utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
    utils.set(form,      { opacity: 0, translateY: 12 });

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add(titleCn,   { opacity: [0, 1], scale: [0.7, 1], translateY: [20, 0], duration: 1300 }, 100);
    tl.add(titleText, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=800');
    tl.add(chars,     { opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(20) }, '-=500');
    tl.add(form,      { opacity: [0, 1], translateY: [12, 0], duration: 800 }, '-=400');
    return tl;
  }

  return { play };
}

function bindForm() {
  const form = document.getElementById('natal-form');
  const dateInput = document.getElementById('birth-date');
  const timeInput = document.getElementById('birth-time');
  const unknownTimeBox = document.getElementById('unknown-time');
  const tabs = document.querySelectorAll('#method-tabs .tabs__btn');
  const hint = document.getElementById('method-hint');

  function setMethod(m) {
    state.method = m;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.method === m)));
    hint.textContent = METHODS[m]?.hint || '';
  }

  tabs.forEach((t) => t.addEventListener('click', () => setMethod(t.dataset.method)));
  setMethod(state.method);

  unknownTimeBox.addEventListener('change', () => {
    if (unknownTimeBox.checked) {
      timeInput.value = '12:00';
      timeInput.disabled = true;
    } else {
      timeInput.disabled = false;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dateStr = dateInput.value;
    const timeStr = unknownTimeBox.checked ? '12:00' : (timeInput.value || '12:00');
    if (!dateStr) return;

    const [y, mo, d] = dateStr.split('-').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);

    state.birth = { year: y, month: mo, day: d, hour: h, minute: mi };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Calculando…';

    try {
      const result = await compute(state.method, state.birth);
      state.result = result;

      if (result.status !== 'ok') {
        submitBtn.querySelector('span').textContent = result.error || 'Error en el cálculo';
        submitBtn.disabled = false;
        return;
      }

      revealApi.render(result);
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Calcular mi hexagrama';
      go('reveal');
    } catch (err) {
      console.error(err);
      submitBtn.querySelector('span').textContent = `Error: ${err.message}`;
      submitBtn.disabled = false;
    }
  });
}

function wireActions() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'goto') {
      e.preventDefault();
      go(trigger.dataset.target);
    }
  });
}

function init() {
  const introApi = setupIntroAnimation();
  revealApi = initReveal({ section: document.getElementById('reveal') });
  readingApi = initReading({ section: document.getElementById('reading') });

  sectionPlay.intro = introApi.play;
  sectionPlay.reveal = () => {
    revealApi.play();
  };
  sectionPlay.reading = () => {
    if (state.result?.natal) readingApi.loadAndRender(state.result.natal);
    readingApi.play();
  };

  bindForm();
  wireActions();

  introApi.play();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
