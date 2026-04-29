// main.js — orchestrator de la Carta natal con casas de signo entero.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';
import { computePositions } from './astro/ephemeris.js';
import { allAspects } from './astro/aspects.js';
import { dignityOf, dignityLabel } from './astro/dignities.js';
import { geocode } from './geocode.js';
import { createNatalChart } from './chart-svg.js';

const SECTIONS = ['intro', 'chart'];

const state = {
  signsData: null,
  result: null,
  geo: null,
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
}

// Convierte fecha local + tz IANA → Date UTC. Usa Intl.DateTimeFormat para iterar.
function localToUTC(tz, year, month, day, hour, minute) {
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  for (let i = 0; i < 4; i++) {
    const parts = {};
    for (const p of fmt.formatToParts(new Date(guess))) parts[p.type] = p.value;
    const got = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, 0);
    const target = Date.UTC(year, month - 1, day, hour, minute, 0);
    const diff = got - target;
    if (Math.abs(diff) < 1000) break;
    guess -= diff;
  }
  return new Date(guess);
}

function playIntro() {
  const titleCn = document.querySelector('.chart__title-cn');
  const titleText = document.querySelector('.chart__title-text');
  const subtitleHost = document.querySelector('.chart__subtitle [data-split]');
  const form = document.querySelector('.chart__form');

  const chars = splitText(subtitleHost);

  utils.set(titleCn,   { opacity: 0, scale: 0.7, translateY: 20 });
  utils.set(titleText, { opacity: 0, translateY: 12 });
  utils.set(chars,     { opacity: 0, translateY: 8, filter: 'blur(6px)' });
  utils.set(form,      { opacity: 0, translateY: 12 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add(titleCn,   { opacity: [0, 1], scale: [0.7, 1], translateY: [20, 0], duration: 1300 }, 100);
  tl.add(titleText, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, '-=900');
  tl.add(chars,     { opacity: [0, 1], translateY: [8, 0], filter: ['blur(6px)', 'blur(0px)'], duration: 700, delay: stagger(20) }, '-=500');
  tl.add(form,      { opacity: [0, 1], translateY: [12, 0], duration: 800 }, '-=400');
}

async function loadData() {
  const res = await fetch('./data/signs.json');
  state.signsData = await res.json();
}

function renderTables() {
  const r = state.result;
  if (!r) return;

  const { signsData } = state;
  const ascSign = r.ascSign;
  const planets = r.planets;

  // Planets table
  const tbody = document.querySelector('#planets-table tbody');
  tbody.innerHTML = '';
  planets.forEach((p) => {
    const sign = signsData.signs[p.sign];
    const houseNum = ((p.sign - ascSign + 12) % 12) + 1;
    const dig = dignityOf(p.key, p.sign);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="planet-glyph">${p.glyph}</span> ${p.spanish}</td>
      <td>${sign.glyph} ${sign.spanish} ${Math.floor(p.degInSign)}°</td>
      <td>${r.hasHouses ? `Casa ${houseNum}` : '—'}</td>
      <td>${dignityLabel(dig)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Houses list
  const housesList = document.getElementById('houses-list');
  housesList.innerHTML = '';
  if (r.hasHouses) {
    for (let i = 0; i < 12; i++) {
      const sign = signsData.signs[(ascSign + i) % 12];
      const li = document.createElement('li');
      li.innerHTML = `<strong>${sign.glyph} ${sign.spanish}</strong> · ${signsData.houses[i]}`;
      housesList.appendChild(li);
    }
  } else {
    const li = document.createElement('li');
    li.style.cssText = 'padding-left: 0; font-style: italic; color: var(--ink-faded);';
    li.textContent = 'Sin hora de nacimiento, las casas no se calculan.';
    li.style.setProperty('--no-counter', '1');
    housesList.appendChild(li);
  }

  // Aspects list
  const aspectsList = document.getElementById('aspects-list');
  aspectsList.innerHTML = '';
  if (r.aspects.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Sin aspectos por signo entero entre planetas.';
    aspectsList.appendChild(li);
  }
  for (const a of r.aspects) {
    const pa = planets[a.a];
    const pb = planets[a.b];
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="aspect-dot aspect-dot--${a.type}"></span>
      <strong>${pa.glyph} ${pa.spanish}</strong> <em>${a.spanish}</em> <strong>${pb.glyph} ${pb.spanish}</strong>
    `;
    aspectsList.appendChild(li);
  }
}

function bindForm() {
  const form = document.getElementById('chart-form');
  const dateInput = document.getElementById('birth-date');
  const timeInput = document.getElementById('birth-time');
  const unknownTimeBox = document.getElementById('unknown-time');
  const placeInput = document.getElementById('birth-place');
  const tzInput = document.getElementById('birth-tz');
  const placeHint = document.getElementById('place-hint');
  const nameInput = document.getElementById('birth-name');

  // Geocode al perder foco en place input
  let lastQuery = '';
  placeInput.addEventListener('blur', async () => {
    const q = placeInput.value.trim();
    if (!q || q === lastQuery) return;
    lastQuery = q;
    placeHint.textContent = 'Buscando lugar…';
    const geo = await geocode(q);
    if (geo) {
      state.geo = geo;
      placeHint.textContent = `→ ${geo.lat.toFixed(2)}°, ${geo.lon.toFixed(2)}° · ${geo.displayName}`;
    } else {
      placeHint.textContent = 'No se pudo geolocalizar. Revisa el lugar.';
    }
  });

  unknownTimeBox.addEventListener('change', () => {
    timeInput.disabled = unknownTimeBox.checked;
    if (unknownTimeBox.checked) timeInput.value = '12:00';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Calculando…';

    try {
      // Geocode si no se hizo aún
      if (!state.geo) {
        const geo = await geocode(placeInput.value.trim());
        if (geo) state.geo = geo;
      }

      const lat = state.geo?.lat ?? null;
      const lon = state.geo?.lon ?? null;

      const [y, mo, d] = dateInput.value.split('-').map(Number);
      const [h, mi] = (timeInput.value || '12:00').split(':').map(Number);
      const tz = tzInput.value.trim() || 'Europe/Madrid';

      const utc = localToUTC(tz, y, mo, d, h, mi);
      const positionsResult = await computePositions({
        utc,
        lat: unknownTimeBox.checked ? null : lat,
        lon: unknownTimeBox.checked ? null : lon,
        planets: state.signsData.planets,
      });

      if (positionsResult.status !== 'ok') {
        submitBtn.querySelector('span').textContent = positionsResult.error;
        submitBtn.disabled = false;
        return;
      }

      const planets = positionsResult.planets;
      const aspects = allAspects(planets);
      const ascDeg = positionsResult.ascendant;
      const ascSign = ascDeg != null ? Math.floor(ascDeg / 30) : 0;
      const hasHouses = !unknownTimeBox.checked && ascDeg != null;

      state.result = {
        planets,
        aspects,
        ascDeg: ascDeg ?? 0,
        ascSign,
        hasHouses,
        birth: { year: y, month: mo, day: d, hour: h, minute: mi, tz, lat, lon, name: nameInput.value.trim() },
      };

      // Render
      const host = document.getElementById('chart-svg-host');
      const chartApi = createNatalChart({
        host,
        signsData: state.signsData,
        ascSign,
        ascDeg: state.result.ascDeg,
        planets,
        aspects,
        hasHouses,
      });

      document.getElementById('view-name').textContent = nameInput.value.trim()
        ? `Carta natal de ${nameInput.value.trim()}`
        : 'Carta natal';
      document.getElementById('view-meta').textContent =
        `${dateInput.value} · ${timeInput.value || '12:00'} · ${state.geo?.displayName || placeInput.value}`;

      renderTables();

      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Calcular mi carta';

      go('chart');
      requestAnimationFrame(() => chartApi.play());
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
    if (trigger.dataset.action === 'goto') {
      e.preventDefault();
      go(trigger.dataset.target);
    }
  });
}

async function init() {
  await loadData();
  bindForm();
  wireActions();
  playIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
