// Método Jīng Fáng — reconstrucción Plum Blossom (Shíjiān Qǐguà / 時間起卦) de Shào Yōng.
// Usa datos del calendario lunar chino: rama del año, mes lunar, día lunar y rama de la hora.
//   S1 = Y + M + D
//   upperIdx = ((S1 - 1) mod 8) + 1   (orden Xiāntiān 1..8)
//   S2 = Y + M + D + H
//   lowerIdx = ((S2 - 1) mod 8) + 1
//   mutatingLine = ((S2 - 1) mod 6) + 1
import { trigramFromXiantianIndex, composeHexagram, deriveHexagram } from '../../../../shared/js/iching-data.js';
import { toChineseData } from '../../../../shared/js/lunar-adapter.js';

const mod = (n, m) => ((n - 1) % m) + 1;

export async function jingFang({ year, month, day, hour, minute = 0 }) {
  const cn = await toChineseData({ year, month, day, hour, minute });

  if (cn.status !== 'ok') {
    return {
      method: 'jingFang',
      label: 'Jīng Fáng (Plum Blossom)',
      status: 'error',
      error: cn.error,
      notes: 'No se pudo cargar el calendario lunar. Prueba el método numerológico mientras tanto.',
    };
  }

  const Y = cn.yearBranchIdx;
  const M = Math.abs(cn.lunar.month);
  const D = cn.lunar.day;
  const H = cn.hourBranchIdx;

  const S1 = Y + M + D;
  const S2 = Y + M + D + H;

  const upperIdx = mod(S1, 8);
  const lowerIdx = mod(S2, 8);
  const mutatingLine = mod(S2, 6);

  const upper = trigramFromXiantianIndex(upperIdx);
  const lower = trigramFromXiantianIndex(lowerIdx);

  const natal = composeHexagram(lower.key, upper.key);
  const derived = deriveHexagram(natal, mutatingLine);

  return {
    method: 'jingFang',
    label: 'Jīng Fáng (Plum Blossom)',
    status: 'ok',
    natal,
    derived,
    mutatingLine,
    debug: {
      lunarYear: cn.lunar.year,
      lunarMonth: cn.lunar.month,
      lunarDay: cn.lunar.day,
      yearGanZhi: cn.ganzhi.year,
      hourGanZhi: cn.ganzhi.hour,
      Y, M, D, H,
      S1, S2,
      upperIdx, lowerIdx,
    },
    notes: 'Plum Blossom (Shíjiān Qǐguà) de Shào Yōng. La línea mutante deriva un segundo hexagrama hacia el que tiendes.',
  };
}
