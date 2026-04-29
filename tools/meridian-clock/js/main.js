// Reloj de meridianos — solo el reloj 24h con franjas y recomendaciones.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';
import { createMeridianClock, meridianForHour } from './clock.js';

const state = {
  meridians: [],
  meridianByCode: new Map(),
  clockApi: null,
  currentCode: null,
};

async function loadData() {
  const res = await fetch('./data/meridians.json');
  const md = await res.json();
  state.meridians = md.meridians;
  state.meridianByCode = new Map(state.meridians.map((m) => [m.code, m]));
}

function buildList() {
  const host = document.getElementById('clock-items');
  // Ordenar por timeSlot.startHour, los 12 con timeSlot
  const timed = state.meridians.filter((m) => m.timeSlot).sort((a, b) => a.timeSlot.startHour - b.timeSlot.startHour);
  for (const m of timed) {
    const li = document.createElement('li');
    li.className = 'clock-item';
    li.dataset.meridian = m.code;
    li.innerHTML = `
      <span class="clock-item__time">${m.timeSlot.start} — ${m.timeSlot.end}</span>
      <span class="clock-item__name"><em>${m.chinese}</em>${m.spanish}</span>
      <span class="clock-item__hint">${m.recommendation.split('.').slice(0, 1).join('.')}.</span>
    `;
    host.appendChild(li);
  }
}

function tick() {
  const now = new Date();
  const fractionalHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const m = state.clockApi.setHour(fractionalHour);

  const hourEl = document.getElementById('clock-hour');
  const meridianEl = document.getElementById('clock-meridian');
  const recommendationEl = document.getElementById('clock-recommendation');
  const associationsEl = document.getElementById('clock-associations');

  hourEl.textContent = `Ahora · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (m) {
    meridianEl.innerHTML = `<em>${m.chinese}</em>${m.spanish}`;
    recommendationEl.textContent = m.recommendation;
    associationsEl.textContent = m.associations || '';

    // Resaltar el item correspondiente en la lista de las 12 franjas
    document.querySelectorAll('.clock-item').forEach((li) => {
      li.classList.toggle('is-current', li.dataset.meridian === m.code);
    });

    state.currentCode = m.code;
  }
}

function setupClock() {
  const host = document.getElementById('meridian-clock');
  state.clockApi = createMeridianClock({ host, meridians: state.meridians });
  tick();
  setInterval(tick, 30 * 1000);
}

function playIntro() {
  const titleCn = document.querySelector('.clock-page__title-cn');
  const titleText = document.querySelector('.clock-page__title-text');
  const subtitleHost = document.querySelector('.clock-page__subtitle [data-split]');
  const clock = document.getElementById('meridian-clock');
  const current = document.getElementById('clock-current');
  const list = document.querySelector('.clock-page__list');

  const chars = splitText(subtitleHost);

  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 20 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(clock,     { opacity: 0, scale: 0.85 });
  utils.set(current,   { opacity: 0, translateY: 12 });
  utils.set(list,      { opacity: 0, translateY: 16 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add(titleCn,   { opacity: [0, 1], scale: [0.7, 1], translateY: [20, 0], duration: 1300 }, 100);
  tl.add(titleText, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=900');
  tl.add(chars,     { opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(20) }, '-=500');
  tl.add(clock,     { opacity: [0, 1], scale: [0.85, 1], duration: 1100 }, '-=600');
  tl.add(current,   { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=600');
  tl.add(list,      { opacity: [0, 1], translateY: [16, 0], duration: 800 }, '-=400');
}

async function init() {
  await loadData();
  buildList();
  setupClock();
  playIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
