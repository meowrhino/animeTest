// Dignidades clásicas: domicilio, exaltación, detrimento, caída, peregrino.
// Solo aplican a los 7 cuerpos tradicionales. Los planetas modernos = 'pe' (peregrino).

const RULERS = {
  // index = sign (aries=0..pisces=11)
  0: 'Mars',     // aries
  1: 'Venus',    // tauro
  2: 'Mercury',  // géminis
  3: 'Moon',     // cáncer
  4: 'Sun',      // leo
  5: 'Mercury',  // virgo
  6: 'Venus',    // libra
  7: 'Mars',     // escorpio
  8: 'Jupiter',  // sagitario
  9: 'Saturn',   // capricornio
  10: 'Saturn',  // acuario
  11: 'Jupiter', // piscis
};

const EXALTATIONS = {
  0: 'Sun',       // aries
  1: 'Moon',      // tauro
  5: 'Mercury',   // virgo
  9: 'Mars',      // capricornio
  3: 'Jupiter',   // cáncer
  11: 'Venus',    // piscis
  6: 'Saturn',    // libra
};

const TRADITIONAL = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

const DIGNITY_LABEL = {
  dom: 'domicilio',
  ex: 'exaltación',
  det: 'detrimento',
  fall: 'caída',
  pe: 'peregrino',
};

export function dignityOf(planet, sign) {
  if (!TRADITIONAL.includes(planet)) return 'pe';
  if (RULERS[sign] === planet) return 'dom';
  if (EXALTATIONS[sign] === planet) return 'ex';
  const opposite = (sign + 6) % 12;
  if (RULERS[opposite] === planet) return 'det';
  if (EXALTATIONS[opposite] === planet) return 'fall';
  return 'pe';
}

export function dignityLabel(key) {
  return DIGNITY_LABEL[key] || key;
}
