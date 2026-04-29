// Registro central de métodos de cálculo de hexagrama natal.
import { jingFang } from './jing-fang.js';
import { numerology } from './numerology.js';
import { bazi } from './bazi.js';

export const METHODS = {
  jingFang: {
    fn: jingFang,
    label: 'Jīng Fáng',
    hint: 'Reconstrucción Plum Blossom de Shào Yōng. Usa el calendario lunar y produce hexagrama derivado.',
  },
  numerology: {
    fn: numerology,
    label: 'Numerológico',
    hint: 'Suma de dígitos de la fecha gregoriana. Solo número, sin línea mutante.',
  },
  bazi: {
    fn: bazi,
    label: 'BaZi',
    hint: 'Tronco del año y de la hora → trigramas. Necesita la hora de nacimiento.',
  },
};

export async function compute(methodKey, input) {
  const method = METHODS[methodKey];
  if (!method) throw new Error(`Unknown method: ${methodKey}`);
  return method.fn(input);
}
