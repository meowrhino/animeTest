// Wrapper alrededor de astronomy-engine. Calcula longitudes eclípticas
// (sol, luna, planetas) + ascendente + medio cielo a partir de fecha UTC + ubicación.
// Soporta carga vía CDN ESM con fallback explícito si falla.

let Astronomy = null;
let loadPromise = null;

const ESM_URL = 'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/+esm';

async function loadAstronomy() {
  if (Astronomy) return Astronomy;
  if (loadPromise) return loadPromise;
  loadPromise = import(ESM_URL)
    .then((mod) => {
      Astronomy = mod.default || mod;
      // Some builds expose default with all functions; others as named.
      // Normalize: if mod has direct functions, use mod itself.
      if (!Astronomy.GeoVector && mod.GeoVector) Astronomy = mod;
      return Astronomy;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    });
  return loadPromise;
}

// ─── Helpers angulares ───────────────────────────────────
const deg2rad = (d) => (d * Math.PI) / 180;
const rad2deg = (r) => (r * 180) / Math.PI;
const norm = (d) => ((d % 360) + 360) % 360;

// ─── Tiempo sideral / oblicuidad ─────────────────────────
function julianDayUTC(date) {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const dayFrac = (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let d = date.getUTCDate() + dayFrac;
  if (m <= 2) { m += 12; y -= 1; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function julianCenturies(date) {
  return (julianDayUTC(date) - 2451545) / 36525;
}

function obliquityEcliptic(date) {
  const T = julianCenturies(date);
  const arcsec = 21.448 - 46.8150 * T - 0.00059 * T ** 2 + 0.001813 * T ** 3;
  return 23 + 26 / 60 + arcsec / 3600;
}

function gmstHours(date) {
  const T = julianCenturies(date);
  let gmst =
    (67310.548 + (3155760000 + 8640184.812866) * T + 0.093104 * T ** 2 - 6.2e-6 * T ** 3) /
    3600;
  return ((gmst % 24) + 24) % 24;
}

// ─── Posiciones celestes ─────────────────────────────────
export function ascendantLongitude(dateUTC, latDeg, lonDeg) {
  const eps = deg2rad(obliquityEcliptic(dateUTC));
  const phi = deg2rad(latDeg);
  const thetaL = deg2rad(gmstHours(dateUTC) * 15 + lonDeg);
  const num = Math.cos(thetaL);
  const den = -(Math.sin(thetaL) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));
  return norm(rad2deg(Math.atan2(num, den)));
}

export function midheavenLongitude(dateUTC, lonDeg) {
  const eps = deg2rad(obliquityEcliptic(dateUTC));
  const thetaL = deg2rad(gmstHours(dateUTC) * 15 + lonDeg);
  return norm(rad2deg(Math.atan2(Math.sin(thetaL), Math.cos(thetaL) * Math.cos(eps))));
}

// Longitud eclíptica de un cuerpo
function eclipticLongitudeForBody(bodyKey, astroTime) {
  let vec;
  if (bodyKey === 'Moon') {
    vec = Astronomy.GeoMoon(astroTime);
  } else {
    vec = Astronomy.GeoVector(bodyKey, astroTime, true);
  }
  const eps = deg2rad(obliquityEcliptic(astroTime.date));
  const x = vec.x, y = vec.y, z = vec.z;
  const ye = y * Math.cos(eps) + z * Math.sin(eps);
  return norm(rad2deg(Math.atan2(ye, x)));
}

// Calcula posiciones de TODOS los planetas en una fecha UTC.
// Devuelve `{ status: 'ok' | 'error', planets, ascendant, midheaven }`
export async function computePositions({ utc, lat, lon, planets }) {
  try {
    await loadAstronomy();
    const t = new Astronomy.AstroTime(utc);

    const positions = planets.map((p) => {
      const longitude = eclipticLongitudeForBody(p.key, t);
      const sign = Math.floor(longitude / 30);
      const degInSign = longitude - sign * 30;
      return {
        key: p.key,
        spanish: p.spanish,
        glyph: p.glyph,
        longitude,
        sign,
        degInSign,
      };
    });

    return {
      status: 'ok',
      planets: positions,
      ascendant: lat != null && lon != null ? ascendantLongitude(utc, lat, lon) : null,
      midheaven: lon != null ? midheavenLongitude(utc, lon) : null,
    };
  } catch (err) {
    return { status: 'error', error: err.message || String(err) };
  }
}
