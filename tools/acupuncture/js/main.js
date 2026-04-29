// Visor de los 361 puntos canónicos de acupuntura. Dos vistas: lista y mapa corporal SVG.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';
import { createBodyMap } from './body-map.js';

const state = {
  meridians: [],
  meridianByCode: new Map(),
  points: [],
  filterMeridian: 'ALL',
  searchQuery: '',
  view: 'list', // 'list' | 'map'
  bodyMap: null,
};

async function loadData() {
  const [meridiansRes, pointsRes] = await Promise.all([
    fetch('./data/meridians.json'),
    fetch('./data/points.json'),
  ]);
  const md = await meridiansRes.json();
  const pd = await pointsRes.json();
  state.meridians = md.meridians;
  state.meridianByCode = new Map(state.meridians.map((m) => [m.code, m]));
  state.points = Object.values(pd.points);
}

function buildMeridianTabs() {
  const host = document.getElementById('meridian-tabs');
  state.meridians.forEach((m) => {
    const btn = document.createElement('button');
    btn.className = 'acu__meridian-tab';
    btn.dataset.meridian = m.code;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = `${m.code} · ${m.spanish}`;
    host.appendChild(btn);
  });

  host.addEventListener('click', (e) => {
    const tab = e.target.closest('.acu__meridian-tab');
    if (!tab) return;
    state.filterMeridian = tab.dataset.meridian;
    [...host.children].forEach((b) => b.setAttribute('aria-selected', String(b === tab)));
    renderPoints();
    // Si el mapa está activo, también filtra el mapa
    if (state.bodyMap) state.bodyMap.setFilter(state.filterMeridian);
  });
}

function buildViewToggle() {
  const buttons = document.querySelectorAll('.acu__view-btn');
  const views = document.querySelectorAll('.acu__view');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      state.view = v;
      buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      views.forEach((vw) => {
        const match = vw.dataset.view === v;
        vw.hidden = !match;
      });
      // Inicializa el mapa la primera vez que se abre
      if (v === 'map' && !state.bodyMap) {
        const host = document.getElementById('body-map-host');
        state.bodyMap = createBodyMap({
          host,
          points: state.points,
          meridians: state.meridians,
        });
        state.bodyMap.play();
        // Click en un punto del mapa abre el detalle
        host.addEventListener('click', (e) => {
          const dot = e.target.closest('.body-map__point');
          if (dot) showDetail(dot.dataset.code);
        });
        // Sincroniza con el filtro activo
        state.bodyMap.setFilter(state.filterMeridian);
      } else if (v === 'map' && state.bodyMap) {
        state.bodyMap.setFilter(state.filterMeridian);
      }
    });
  });
}

function filterPoints() {
  const q = state.searchQuery.trim().toLowerCase();
  return state.points.filter((p) => {
    if (state.filterMeridian !== 'ALL' && p.meridian !== state.filterMeridian) return false;
    if (!q) return true;
    return (
      p.code.toLowerCase().includes(q) ||
      p.chinese.includes(q) ||
      p.pinyin.toLowerCase().includes(q) ||
      p.spanish.toLowerCase().includes(q) ||
      (p.indications && p.indications.some((i) => i.toLowerCase().includes(q)))
    );
  });
}

function renderPoints() {
  const list = document.getElementById('points-list');
  const filtered = filterPoints();

  // Si veníamos con muchos elementos, salida sin animar (evita ahogar al motor)
  list.innerHTML = '';
  list.classList.toggle('acu__points-list--empty', filtered.length === 0);

  for (const p of filtered) {
    const li = document.createElement('li');
    li.className = 'acu__point';
    li.dataset.code = p.code;
    li.innerHTML = `
      <span class="acu__point__code">${p.code}</span>
      <span class="acu__point__cn">${p.chinese}</span>
      <span class="acu__point__py">${p.pinyin}</span>
      <span class="acu__point__es">${p.spanish}</span>
    `;
    list.appendChild(li);
  }

  document.getElementById('points-meta').textContent =
    `${filtered.length} ${filtered.length === 1 ? 'punto' : 'puntos'} · ${state.filterMeridian === 'ALL' ? '14 meridianos' : state.meridianByCode.get(state.filterMeridian)?.spanish || ''}`;

  // Stagger in solo si hay un subset razonable (filtrado), no para los 361 iniciales
  if (filtered.length > 0 && filtered.length <= 80) {
    utils.set([...list.children], { opacity: 0, translateY: 6 });
    animate([...list.children], {
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 380,
      delay: stagger(12),
      ease: 'outExpo',
    });
  }
}

function showDetail(code) {
  const point = state.points.find((p) => p.code === code);
  if (!point) return;
  const meridian = state.meridianByCode.get(point.meridian);

  document.getElementById('detail-code').textContent = point.code;
  document.getElementById('detail-cn').textContent = point.chinese;
  document.getElementById('detail-py').textContent = point.pinyin;
  document.getElementById('detail-spanish').textContent = point.spanish;
  document.getElementById('detail-meridian').textContent = `Meridiano de ${meridian?.spanish || point.meridian}`;
  document.getElementById('detail-category').textContent = (point.category || []).join(' · ') || '—';
  document.getElementById('detail-location').textContent = point.location || '—';

  const indList = document.getElementById('detail-indications');
  indList.innerHTML = '';
  if (point.indications && point.indications.length > 0) {
    for (const ind of point.indications) {
      const li = document.createElement('li');
      li.textContent = ind;
      indList.appendChild(li);
    }
  }

  const modal = document.getElementById('acu-detail');
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');

  const card = modal.querySelector('.acu__detail-card');
  utils.set(card, { opacity: 0, scale: 0.96, translateY: 12 });
  animate(card, {
    opacity: [0, 1],
    scale: [0.96, 1],
    translateY: [12, 0],
    duration: 500,
    ease: 'outExpo',
  });
}

function hideDetail() {
  const modal = document.getElementById('acu-detail');
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
}

function bindActions() {
  document.getElementById('points-list').addEventListener('click', (e) => {
    const point = e.target.closest('.acu__point');
    if (point) showDetail(point.dataset.code);
  });

  document.getElementById('points-search').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderPoints();
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    if (trigger.dataset.action === 'close-detail') hideDetail();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideDetail();
  });
}

function playIntro() {
  const titleCn = document.querySelector('.acu__title-cn');
  const titleText = document.querySelector('.acu__title-text');
  const subtitleHost = document.querySelector('.acu__subtitle [data-split]');
  const browser = document.querySelector('.acu__browser');

  const chars = splitText(subtitleHost);

  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 20 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(browser,   { opacity: 0, translateY: 16 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add(titleCn,   { opacity: [0, 1], scale: [0.7, 1], translateY: [20, 0], duration: 1300 }, 100);
  tl.add(titleText, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=900');
  tl.add(chars,     { opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(20) }, '-=500');
  tl.add(browser,   { opacity: [0, 1], translateY: [16, 0], duration: 800 }, '-=300');
}

async function init() {
  await loadData();
  buildMeridianTabs();
  buildViewToggle();
  renderPoints();
  bindActions();
  playIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
