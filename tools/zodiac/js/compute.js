// Calcula los 4 pilares (year, month, day, hour) a partir de fecha+hora gregorianas.
// Usa lunar-javascript via CDN. Devuelve animal + elemento por pilar.
import { toChineseData } from '../../../shared/js/lunar-adapter.js';

// Mapeo branch → animal key (orden 子=Rata...亥=Cerdo)
const BRANCH_TO_ANIMAL = {
  '子': 'rat',     '丑': 'ox',      '寅': 'tiger',
  '卯': 'rabbit',  '辰': 'dragon',  '巳': 'snake',
  '午': 'horse',   '未': 'sheep',   '申': 'monkey',
  '酉': 'rooster', '戌': 'dog',     '亥': 'pig',
};

export async function computeZodiac({ year, month, day, hour, minute = 0 }, zodiacData) {
  const cn = await toChineseData({ year, month, day, hour, minute });
  if (cn.status !== 'ok') {
    return { status: 'error', error: cn.error };
  }

  const stemToElement = zodiacData.stem_to_element;
  const animals = zodiacData.animals;
  const elements = zodiacData.elements;

  function pillarFromGanzhi(stem, branch) {
    const animalKey = BRANCH_TO_ANIMAL[branch];
    const animal = animals.find((a) => a.key === animalKey);
    const elementInfo = stemToElement[stem];
    return {
      stem, branch,
      animal,
      elementKey: elementInfo?.element || 'Earth',
      element: elementInfo ? elements[elementInfo.element] : elements.Earth,
      polarity: elementInfo?.polarity,
    };
  }

  const pillars = {
    year:  pillarFromGanzhi(cn.pillars.year.stem,  cn.pillars.year.branch),
    month: pillarFromGanzhi(cn.pillars.month.stem, cn.pillars.month.branch),
    day:   pillarFromGanzhi(cn.pillars.day.stem,   cn.pillars.day.branch),
    hour:  pillarFromGanzhi(cn.pillars.hour.stem,  cn.pillars.hour.branch),
  };

  return {
    status: 'ok',
    primary: pillars.year.animal,
    primaryElement: pillars.year.element,
    primaryPolarity: pillars.year.polarity,
    pillars,
    debug: cn,
  };
}
