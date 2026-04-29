// Aspectos en sistema de signo entero: comparan los signos de dos cuerpos,
// no sus grados. Los aspectos clásicos por distancia de signos:
//   1 signo  → conjunción (mismo signo)
//   2 signos → sextil
//   3 signos → cuadratura
//   4 signos → trígono
//   6 signos → oposición

const ASPECTS_BY_DISTANCE = {
  2: { type: 'sextile',    spanish: 'sextil',     harmony: 'armónico' },
  3: { type: 'square',     spanish: 'cuadratura', harmony: 'tenso' },
  4: { type: 'trine',      spanish: 'trígono',    harmony: 'armónico' },
  6: { type: 'opposition', spanish: 'oposición',  harmony: 'polar' },
};

export function aspectBySigns(signA, signB) {
  if (signA == null || signB == null) return null;
  const d = ((signB - signA) % 12 + 12) % 12;
  const md = Math.min(d, 12 - d);
  return ASPECTS_BY_DISTANCE[md] || null;
}

// Calcula todos los aspectos entre planetas. Devuelve un array de
// `{ a, b, type, spanish, harmony }` con índices `a < b` en el array de planetas.
export function allAspects(planets) {
  const out = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const asp = aspectBySigns(planets[i].sign, planets[j].sign);
      if (asp) out.push({ a: i, b: j, ...asp });
    }
  }
  return out;
}
