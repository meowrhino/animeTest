// Método numerológico — suma de dígitos de fecha gregoriana.
// No requiere lunar-javascript. No produce línea mutante (el método clásico
// numerológico solo da el número del hexagrama).
import { HEXAGRAMS } from '../../../../shared/js/iching-data.js';

function sumDigits(n) {
  return String(Math.abs(n)).split('').reduce((acc, ch) => acc + Number(ch), 0);
}

export async function numerology({ year, month, day }) {
  const yearSum = sumDigits(year);
  const dateSum = sumDigits(month) + sumDigits(day);
  let personal = yearSum + dateSum;
  while (personal > 64) personal -= 64;
  if (personal < 1) personal = 64;

  const hex = HEXAGRAMS[personal];

  return {
    method: 'numerology',
    label: 'Numerológico',
    status: 'ok',
    natal: {
      number: personal,
      chinese: hex.chinese,
      pinyin: hex.pinyin,
      english: hex.english,
      spanish: hex.spanish,
      unicode: hex.unicode,
      lines: null,
      lowerTrigram: null,
      upperTrigram: null,
    },
    derived: null,
    mutatingLine: null,
    debug: {
      yearSum,
      dateSum,
      total: yearSum + dateSum,
      personalAfterReduction: personal,
    },
    notes: 'Método numerológico simple (suma de dígitos). No produce hexagrama derivado ni línea mutante.',
  };
}
