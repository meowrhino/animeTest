// main.js — orchestrator del Horóscopo Chino.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';
import { createZodiacWheel } from './wheel.js';
import { computeZodiac } from './compute.js';

const SECTIONS = ['intro', 'reveal'];

const state = {
  zodiacData: null,
  wheel: null,
  result: null,
  currentSection: 'intro',
};

function go(target) {
  if (!SECTIONS.includes(target)) return;
  if (target === state.currentSection) return;
  const cur = document.getElementById(state.currentSection);
  const tar = document.getElementById(target);
  if (!tar) return;
  if (cur) cur.classList.remove('is-active');
  tar.classList.add('is-active');
  state.currentSection = target;
  if (target === 'reveal') playReveal();
}

function playIntro() {
  const titleCn = document.querySelector('.zodiac__title-cn');
  const titleText = document.querySelector('.zodiac__title-text');
  const subtitleHost = document.querySelector('.zodiac__subtitle [data-split]');
  const wheelHost = document.getElementById('wheel-host');
  const form = document.getElementById('zodiac-form');

  const chars = splitText(subtitleHost);

  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 20 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(wheelHost, { opacity: 0, scale: 0.85 });
  utils.set(form,      { opacity: 0, translateY: 12 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add(titleCn,   { opacity: [0, 1], scale: [0.7, 1], translateY: [20, 0], duration: 1400 }, 100);
  tl.add(titleText, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=900');
  tl.add(chars,     { opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(20) }, '-=500');
  tl.add(wheelHost, { opacity: [0, 1], scale: [0.85, 1], duration: 1100 }, '-=600');
  tl.add(form,      { opacity: [0, 1], translateY: [12, 0], duration: 800 }, '-=600');
  return tl;
}

function renderReveal() {
  const r = state.result;
  if (!r) return;

  const animal = r.primary;
  const element = r.primaryElement;

  document.getElementById('animal-cn').textContent = animal.chinese;
  document.getElementById('animal-py').textContent = animal.branchPinyin;
  document.getElementById('animal-name').textContent = animal.name;
  document.getElementById('animal-element').textContent = `${element.spanish} ${r.primaryPolarity || ''}`.trim();
  document.getElementById('personality-text').textContent = animal.personality;

  // Compatibility
  const compatNames = animal.compatibility.map((key) => {
    const a = state.zodiacData.animals.find((x) => x.key === key);
    return `${a.chinese} ${a.name}`;
  });
  document.getElementById('compat-text').textContent =
    `Tu animal se entiende especialmente bien con: ${compatNames.join(' · ')}.`;

  // Pillars grid
  const grid = document.getElementById('pillars-grid');
  grid.innerHTML = '';
  const labels = { year: 'Año', month: 'Mes', day: 'Día', hour: 'Hora' };
  for (const [key, pillar] of Object.entries(r.pillars)) {
    const cell = document.createElement('div');
    cell.className = 'pillar';
    cell.innerHTML = `
      <span class="pillar__label">${labels[key]}</span>
      <span class="pillar__cn">${pillar.animal.chinese}</span>
      <span class="pillar__animal">${pillar.animal.name}</span>
      <span class="pillar__element">${pillar.element.spanish}</span>
    `;
    grid.appendChild(cell);
  }
}

function playReveal() {
  renderReveal();

  // Spin the wheel (in intro) before fading out — but the user already navigated
  // to reveal. Instead, animate the reveal content in.
  const reveal = document.querySelector('.zodiac__reveal');
  const items = reveal.querySelectorAll(':scope > *');
  utils.set(items, { opacity: 0, translateY: 12 });
  animate(items, {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 800,
    delay: stagger(80),
    ease: 'outExpo',
  });
}

async function loadData() {
  const res = await fetch('./data/zodiac.json');
  state.zodiacData = await res.json();
}

function bindForm() {
  const form = document.getElementById('zodiac-form');
  const dateInput = document.getElementById('birth-date');
  const timeInput = document.getElementById('birth-time');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.zodiacData) return;

    const dateStr = dateInput.value;
    const timeStr = timeInput.value || '12:00';
    if (!dateStr) return;

    const [y, mo, d] = dateStr.split('-').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Calculando…';

    const result = await computeZodiac({ year: y, month: mo, day: d, hour: h, minute: mi }, state.zodiacData);
    if (result.status !== 'ok') {
      submitBtn.querySelector('span').textContent = result.error || 'Error en el cálculo';
      submitBtn.disabled = false;
      return;
    }

    state.result = result;

    // Spin the wheel to land on the year animal
    if (state.wheel) {
      await state.wheel.spinTo(result.primary.key);
    }

    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Consultar mi animal';

    setTimeout(() => go('reveal'), 700);
  });
}

function wireActions() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    if (trigger.dataset.action === 'goto') {
      e.preventDefault();
      go(trigger.dataset.target);
    }
  });
}

async function init() {
  await loadData();

  state.wheel = createZodiacWheel({
    host: document.getElementById('wheel-host'),
    animals: state.zodiacData.animals,
  });

  bindForm();
  wireActions();
  playIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
