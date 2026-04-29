// Método BaZi (variante C) — los troncos celestes del año y de la hora se mapean a trigramas
// del Hòutiān Bagua; la suma de las ramas determina la línea mutante.
//   upperTrigram = stemToTrigram(yearStem)
//   lowerTrigram = stemToTrigram(hourStem)
//   sumBranches  = year + month + day + hour (índices de rama)
//   mutatingLine = ((sumBranches - 1) mod 6) + 1
//
// No es canónico — fuego y agua colapsan (8 trigramas para 10 troncos).
import { composeHexagram, deriveHexagram } from '../../../../shared/js/iching-data.js';
import { toChineseData } from '../../../../shared/js/lunar-adapter.js';

const STEM_TO_TRIGRAM = {
  '甲': 'zhen', // Jiǎ — wood yang
  '乙': 'xun',  // Yǐ  — wood yin
  '丙': 'li',   // Bǐng — fire yang
  '丁': 'li',   // Dīng — fire yin
  '戊': 'gen',  // Wù  — earth yang
  '己': 'kun',  // Jǐ  — earth yin
  '庚': 'qian', // Gēng — metal yang
  '辛': 'dui',  // Xīn  — metal yin
  '壬': 'kan',  // Rén  — water yang
  '癸': 'kan',  // Guǐ  — water yin
};

function stemToTrigramKey(stemCh) {
  const key = STEM_TO_TRIGRAM[stemCh];
  if (!key) throw new Error(`Stem not mapped: ${stemCh}`);
  return key;
}

export async function bazi({ year, month, day, hour, minute = 0 }) {
  const cn = await toChineseData({ year, month, day, hour, minute });

  if (cn.status !== 'ok') {
    return {
      method: 'bazi',
      label: 'BaZi (variante C)',
      status: 'error',
      error: cn.error,
      notes: 'No se pudo cargar el calendario lunar. Prueba el método numerológico mientras tanto.',
    };
  }

  const upperKey = stemToTrigramKey(cn.pillars.year.stem);
  const lowerKey = stemToTrigramKey(cn.pillars.hour.stem);

  const sumBranches =
    cn.pillars.year.branchIdx +
    cn.pillars.month.branchIdx +
    cn.pillars.day.branchIdx +
    cn.pillars.hour.branchIdx;

  const mutatingLine = ((sumBranches - 1) % 6) + 1;

  const natal = composeHexagram(lowerKey, upperKey);
  const derived = deriveHexagram(natal, mutatingLine);

  return {
    method: 'bazi',
    label: 'BaZi (variante C)',
    status: 'ok',
    natal,
    derived,
    mutatingLine,
    debug: {
      yearPillar: cn.ganzhi.year,
      monthPillar: cn.ganzhi.month,
      dayPillar: cn.ganzhi.day,
      hourPillar: cn.ganzhi.hour,
      upperFrom: `año ${cn.pillars.year.stem} (${cn.pillars.year.stemPinyin}) → ${upperKey}`,
      lowerFrom: `hora ${cn.pillars.hour.stem} (${cn.pillars.hour.stemPinyin}) → ${lowerKey}`,
      sumBranches,
    },
    notes: 'Variante C: tronco del año → trigrama superior; tronco de la hora → trigrama inferior. Las escuelas difieren — fuego y agua colapsan a un solo trigrama por familia elemental.',
  };
}
