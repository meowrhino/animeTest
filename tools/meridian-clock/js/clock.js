// Reloj de meridianos: 24h dispuestas en círculo, cada meridiano ocupa 2h.
// La aguja apunta a la hora actual; el sector del meridiano activo se ilumina.
import { animate, utils } from '../../../shared/js/anime-import.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 145;
const R_INNER = 90;
const R_LABEL = (R_OUTER + R_INNER) / 2;
const R_HOUR_TEXT = 50;

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Convierte hora (0-24) a ángulo SVG: 0h arriba (-90°), avanza horario.
function hourToAngle(hour) {
  return ((hour / 24) * 360 - 90) * (Math.PI / 180);
}

// Path de un sector circular entre dos ángulos
function sectorPath(startAngle, endAngle, rOuter, rInner) {
  const x1 = CX + rOuter * Math.cos(startAngle);
  const y1 = CY + rOuter * Math.sin(startAngle);
  const x2 = CX + rOuter * Math.cos(endAngle);
  const y2 = CY + rOuter * Math.sin(endAngle);
  const x3 = CX + rInner * Math.cos(endAngle);
  const y3 = CY + rInner * Math.sin(endAngle);
  const x4 = CX + rInner * Math.cos(startAngle);
  const y4 = CY + rInner * Math.sin(startAngle);
  const sweep = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${sweep} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${sweep} 0 ${x4} ${y4} Z`;
}

// Busca qué meridiano corresponde a una hora dada
export function meridianForHour(hour, meridians) {
  for (const m of meridians) {
    if (!m.timeSlot) continue;
    const start = m.timeSlot.startHour;
    const end = (start + 2) % 24;
    if (start < end) {
      if (hour >= start && hour < end) return m;
    } else {
      // wrap (e.g., 23-01)
      if (hour >= start || hour < end) return m;
    }
  }
  return null;
}

export function createMeridianClock({ host, meridians }) {
  host.innerHTML = '';

  const svg = el('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'meridian-clock-svg' });
  host.appendChild(svg);

  // Anillos
  svg.appendChild(el('circle', { cx: CX, cy: CY, r: R_OUTER, class: 'meridian-clock__sector', fill: 'none', stroke: 'rgba(26,26,26,0.15)' }));
  svg.appendChild(el('circle', { cx: CX, cy: CY, r: R_INNER, class: 'meridian-clock__sector', fill: 'none', stroke: 'rgba(26,26,26,0.15)' }));

  // 12 sectores (uno por meridiano con timeSlot, los 12 principales)
  const timed = meridians.filter((m) => m.timeSlot);
  const sectors = {};

  timed.forEach((m) => {
    const startHour = m.timeSlot.startHour;
    const endHour = (startHour + 2) % 24;
    const startA = hourToAngle(startHour);
    const endA = hourToAngle(endHour);
    // Si el sector cruza las 24h, usamos un endA adelantado
    const realEndA = endA < startA ? endA + 2 * Math.PI : endA;

    const sector = el('path', {
      d: sectorPath(startA, realEndA, R_OUTER, R_INNER),
      class: 'meridian-clock__sector',
      'data-meridian': m.code,
    });
    svg.appendChild(sector);
    sectors[m.code] = sector;

    // Divisor
    const div = el('line', {
      x1: CX + R_INNER * Math.cos(startA),
      y1: CY + R_INNER * Math.sin(startA),
      x2: CX + R_OUTER * Math.cos(startA),
      y2: CY + R_OUTER * Math.sin(startA),
      class: 'meridian-clock__sector-divider',
    });
    svg.appendChild(div);

    // Label en el medio del sector
    const midA = (startA + realEndA) / 2;
    const lx = CX + R_LABEL * Math.cos(midA);
    const ly = CY + R_LABEL * Math.sin(midA);

    const label = el('text', {
      x: lx, y: ly,
      class: 'meridian-clock__sector-label',
      'data-meridian-label': m.code,
    });
    label.textContent = m.code;
    svg.appendChild(label);
  });

  // Aguja
  const hand = el('line', {
    x1: CX, y1: CY,
    x2: CX, y2: CY - R_INNER + 6,
    class: 'meridian-clock__hand',
  });
  svg.appendChild(hand);

  // Centro
  svg.appendChild(el('circle', { cx: CX, cy: CY, r: 6, class: 'meridian-clock__center' }));

  // Carácter 時 (hora) o reloj
  const hourLabel = el('text', {
    x: CX, y: CY + 70,
    class: 'meridian-clock__hour-text',
  });
  hourLabel.textContent = '時';
  svg.appendChild(hourLabel);

  // ── API pública ──
  let currentCode = null;

  function setHour(hour) {
    // Aguja: rota la línea desde 0
    const angleDeg = (hour / 24) * 360;
    utils.set(hand, { transformOrigin: `${CX}px ${CY}px`, rotate: angleDeg });

    // Resaltar meridiano activo
    const m = meridianForHour(Math.floor(hour), meridians);
    if (m && m.code !== currentCode) {
      // Quitar highlight previo
      Object.values(sectors).forEach((s) => s.classList.remove('is-current'));
      svg.querySelectorAll('.meridian-clock__sector-label').forEach((l) => l.classList.remove('is-current'));
      // Añadir nuevo
      sectors[m.code].classList.add('is-current');
      svg.querySelector(`[data-meridian-label="${m.code}"]`)?.classList.add('is-current');
      currentCode = m.code;
    }
    return m;
  }

  return { svg, setHour, sectors };
}
