// Wrapper alrededor de lunar-javascript (6tail/lunar-javascript) cargado vía CDN.
// Convierte fecha/hora gregoriana en datos chinos: lunar, ganzhi y los 4 pilares.
// Si lunar-javascript falla, devuelve un objeto con status 'error' para que la UI lo muestre.

const STEMS_CN = '甲乙丙丁戊己庚辛壬癸';
const STEMS_PY = ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'];
const BRANCHES_CN = '子丑寅卯辰巳午未申酉戌亥';
const BRANCHES_PY = ['Zǐ', 'Chǒu', 'Yín', 'Mǎo', 'Chén', 'Sì', 'Wǔ', 'Wèi', 'Shēn', 'Yǒu', 'Xū', 'Hài'];

let LunarPkg = null;
let loadPromise = null;

async function loadLunar() {
  if (LunarPkg) return LunarPkg;
  if (loadPromise) return loadPromise;
  loadPromise = import('https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.7/+esm')
    .then((mod) => {
      LunarPkg = mod.default || mod;
      return LunarPkg;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    });
  return loadPromise;
}

function parseGanzhi(gz) {
  const stem = gz[0];
  const branch = gz[1];
  const stemIdx = STEMS_CN.indexOf(stem);
  const branchIdx = BRANCHES_CN.indexOf(branch);
  if (stemIdx < 0 || branchIdx < 0) {
    throw new Error(`Invalid GanZhi: ${gz}`);
  }
  return {
    stem,
    branch,
    stemIdx: stemIdx + 1,
    branchIdx: branchIdx + 1,
    stemPinyin: STEMS_PY[stemIdx],
    branchPinyin: BRANCHES_PY[branchIdx],
  };
}

// Devuelve datos chinos a partir de fecha gregoriana. Devuelve `{ status: 'error', error }`
// si el módulo no carga (offline, CDN caído).
export async function toChineseData({ year, month, day, hour, minute = 0, second = 0 }) {
  try {
    const pkg = await loadLunar();
    const Solar = pkg.Solar || pkg;
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, second);
    const lunar = solar.getLunar();

    const pillars = {
      year:  parseGanzhi(lunar.getYearInGanZhi()),
      month: parseGanzhi(lunar.getMonthInGanZhi()),
      day:   parseGanzhi(lunar.getDayInGanZhi()),
      hour:  parseGanzhi(lunar.getTimeInGanZhi()),
    };

    return {
      status: 'ok',
      gregorian: { year, month, day, hour, minute, second },
      lunar: {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay(),
      },
      ganzhi: {
        year:  pillars.year.stem  + pillars.year.branch,
        month: pillars.month.stem + pillars.month.branch,
        day:   pillars.day.stem   + pillars.day.branch,
        hour:  pillars.hour.stem  + pillars.hour.branch,
      },
      pillars,
      yearBranchIdx: pillars.year.branchIdx,
      hourBranchIdx: pillars.hour.branchIdx,
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message || String(err),
    };
  }
}
