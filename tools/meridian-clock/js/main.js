// Reloj de meridianos — usa el componente body-clock compartido (estilo TCM).
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';
import { createBodyClock, meridianAt } from '../../../shared/js/body-clock.js';

const state = {
  meridians: [],
  meridianByCode: new Map(),
  clock: null,
};

async function loadData() {
  const res = await fetch('./data/meridians.json');
  const md = await res.json();
  state.meridians = md.meridians;
  state.meridianByCode = new Map(state.meridians.map((m) => [m.code, m]));
}

function buildList() {
  const host = document.getElementById('clock-items');
  const timed = state.meridians.filter((m) => m.timeSlot)
    .sort((a, b) => {
      const offA = (a.timeSlot.startHour - 11 + 24) % 24;
      const offB = (b.timeSlot.startHour - 11 + 24) % 24;
      return offA - offB;
    });
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

function paintCurrent(m, opts = {}) {
  const { fromHover = false } = opts;
  const hourEl = document.getElementById('clock-hour');
  const meridianEl = document.getElementById('clock-meridian');
  const recommendationEl = document.getElementById('clock-recommendation');
  const associationsEl = document.getElementById('clock-associations');

  if (!fromHover) {
    const now = new Date();
    hourEl.textContent = `Ahora · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  } else {
    hourEl.textContent = m ? `${m.timeSlot.start} — ${m.timeSlot.end}` : '—';
  }

  if (m) {
    meridianEl.innerHTML = `<em>${m.chinese}</em>${m.spanish}`;
    recommendationEl.textContent = m.recommendation;
    associationsEl.textContent = m.associations || '';

    document.querySelectorAll('.clock-item').forEach((li) => {
      li.classList.toggle('is-current', li.dataset.meridian === m.code);
    });
  }
}

function setupClock() {
  const host = document.getElementById('meridian-clock');
  state.clock = createBodyClock({
    host,
    meridians: state.meridians,
    size: 700,
  });

  state.clock.onHover((m) => {
    if (m) paintCurrent(m, { fromHover: true });
    else paintCurrent(meridianAt(new Date(), state.meridians));
  });

  paintCurrent(meridianAt(new Date(), state.meridians));
  setInterval(() => paintCurrent(meridianAt(new Date(), state.meridians)), 30 * 1000);
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
  utils.set(clock,     { opacity: 0, scale: 0.9 });
  utils.set(current,   { opacity: 0, translateY: 12 });
  utils.set(list,      { opacity: 0, translateY: 16 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add(titleCn,   { opacity: [0, 1], scale: [0.7, 1], translateY: [20, 0], duration: 1300 }, 100);
  tl.add(titleText, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=900');
  tl.add(chars,     { opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(20) }, '-=500');
  tl.add(clock,     { opacity: [0, 1], scale: [0.9, 1], duration: 1100 }, '-=600');
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
