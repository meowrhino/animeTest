// Método de tirada con varitas de milenrama (yarrow stalks). Versión estilizada del ritual:
// 49 varitas que se separan en dos pilas, se cuentan en grupos de 4, y los restos se acumulan.
// Por línea se hacen 3 sub-rondas. La línea resultante usa la misma distribución que las monedas
// (la ortodoxia tradicional pondera distinto, pero aquí prima la fluidez visual).
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { wait } from '../../../shared/js/utils.js';
import { throwOneLine } from './iching-logic.js';

const STALK_COUNT = 49;

export function createStalkThrow({ host }) {
  host.classList.add('throw__stalks');
  host.classList.remove('throw__coins');

  // Layout: pile arriba (todas las varitas), tres "stations" abajo (sub-rondas)
  host.innerHTML = '';

  const pile = document.createElement('div');
  pile.className = 'stalk-pile';
  host.appendChild(pile);

  const groups = document.createElement('div');
  groups.className = 'stalk-groups';
  host.appendChild(groups);

  const stalkEls = [];
  for (let i = 0; i < STALK_COUNT; i++) {
    const s = document.createElement('span');
    s.className = 'stalk';
    pile.appendChild(s);
    stalkEls.push(s);
  }

  // Tres "estaciones" donde aparece el resto de cada sub-ronda
  const stations = [];
  for (let i = 0; i < 3; i++) {
    const g = document.createElement('div');
    g.className = 'stalk-group';
    g.dataset.station = String(i);

    const label = document.createElement('span');
    label.className = 'stalk-group__label';
    label.textContent = `Ronda ${i + 1}`;
    g.appendChild(label);

    const count = document.createElement('span');
    count.className = 'stalk-group__count';
    count.textContent = '—';
    g.appendChild(count);

    groups.appendChild(g);
    stations.push({ el: g, label, count });
  }

  // Posición inicial del abanico de varitas
  function positionFan() {
    const baseY = 0;
    const radius = 110;
    stalkEls.forEach((s, i) => {
      const angle = (i - (STALK_COUNT - 1) / 2) * 1.4;
      const rad = (angle * Math.PI) / 180;
      utils.set(s, {
        translateX: Math.sin(rad) * 8,
        translateY: baseY,
        rotate: angle,
        opacity: 0,
      });
    });
  }

  function reset() {
    positionFan();
    utils.set(stations.map((s) => s.el), { opacity: 0 });
    stations.forEach((s) => { s.count.textContent = '—'; });
  }

  function destroy() {
    host.innerHTML = '';
    host.classList.remove('throw__stalks');
  }

  // Una sub-ronda: estallido visual + reveal del resto en su estación
  async function subRound(stationIdx, remainder) {
    const station = stations[stationIdx];

    // Las varitas se "agitan" — pequeño wobble
    await animate(stalkEls, {
      translateY: [
        { to: -10, duration: 200, ease: 'outQuad' },
        { to: 0, duration: 300, ease: 'inOutSine' },
      ],
      delay: stagger(8, { from: 'random' }),
    });

    // Aparece el resto
    station.count.textContent = String(remainder);
    await animate(station.el, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 500,
      ease: 'outExpo',
    });
  }

  // Genera 3 restos cuya suma da una línea válida (6, 7, 8 o 9)
  // Tradicionalmente: ronda 1 → 5 o 9 (resto 1 o 5), rondas 2-3 → 4 u 8 (resto 4 u 8)
  // Stylizado: usa el resultado de throwOneLine() para mantener distribución coherente
  function plan(line) {
    // line.sum es 6, 7, 8 o 9. Repartimos como 3 sub-rondas:
    // Stylized mapping: cada sub-ronda da 2 o 3 (yin coin = 2, yang coin = 3)
    return line.coins.slice(); // [2|3, 2|3, 2|3]
  }

  async function throwLine() {
    reset();
    const line = throwOneLine();
    const remainders = plan(line);

    // Aparición inicial del abanico
    await animate(stalkEls, {
      opacity: [0, 1],
      duration: 600,
      delay: stagger(8, { from: 'center' }),
      ease: 'outExpo',
    });

    // Tres sub-rondas
    for (let i = 0; i < 3; i++) {
      await subRound(i, remainders[i]);
      await wait(280);
    }

    return line;
  }

  async function exit() {
    await animate([...stalkEls, ...stations.map((s) => s.el)], {
      opacity: [1, 0],
      translateY: [0, -16],
      duration: 500,
      delay: stagger(8, { from: 'last' }),
      ease: 'inQuad',
    });
    await wait(220);
  }

  reset();

  return { throwLine, reset, exit, destroy };
}
