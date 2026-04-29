// Método de tirada con monedas. 3 monedas caen, giran y aterrizan mostrando cara o cruz.
// Cada cara = yang (3), cada cruz = yin (2). Suma de las 3 = 6/7/8/9.
import { animate, createTimeline, stagger, utils } from '../../../shared/js/anime-import.js';
import { wait } from '../../../shared/js/utils.js';
import { throwOneLine } from './iching-logic.js';
import { createCoin } from '../../../shared/js/svg-factory.js';

const COIN_DROP_FROM = -280;
const COIN_FALL_MS = 1100;
const COIN_BOUNCE_MS = 480;

export function createCoinThrow({ host }) {
  host.classList.add('throw__coins');
  host.classList.remove('throw__stalks');

  const coins = [0, 1, 2].map((i) => {
    const c = createCoin(i);
    host.appendChild(c);
    return c;
  });

  function reset() {
    utils.set(coins, {
      translateY: COIN_DROP_FROM,
      translateX: (_, i) => (i - 1) * 8,
      rotateX: 0,
      rotateY: 0,
      scale: 0.95,
      opacity: 0,
    });
  }

  function destroy() {
    host.innerHTML = '';
    host.classList.remove('throw__coins');
  }

  // Anima la caída + giro de las 3 monedas. Resuelve con la línea calculada.
  async function throwLine() {
    const line = throwOneLine();

    // Pre-compute final rotations so coins land showing the right face.
    // heads (sum=3, yang) → 0deg.  tails (sum=2, yin) → 180deg.
    const targets = line.coins.map((v) => {
      const spins = 2 + Math.floor(Math.random() * 2);
      const finalRot = v === 3 ? 0 : 180;
      return {
        rotX: spins * 360 + finalRot,
        rotY: (1 + Math.floor(Math.random() * 2)) * 180 * (Math.random() < 0.5 ? -1 : 1),
        landX: (Math.random() - 0.5) * 18,
      };
    });

    reset();

    const tl = createTimeline({ defaults: { ease: 'outQuad' } });

    coins.forEach((coin, i) => {
      const t = targets[i];
      const offset = i * 110;

      tl.add(coin, { opacity: [0, 1], duration: 180 }, offset);

      tl.add(coin, {
        translateY: [
          { to: 0, duration: COIN_FALL_MS, ease: 'inQuad' },
          { to: -16, duration: 180, ease: 'outQuad' },
          { to: 0, duration: 300, ease: 'outElastic(1, 0.6)' },
        ],
        translateX: [{ to: t.landX, duration: COIN_FALL_MS, ease: 'outQuad' }],
        rotateX:    [{ to: t.rotX,  duration: COIN_FALL_MS + COIN_BOUNCE_MS, ease: 'outQuad' }],
        rotateY:    [{ to: t.rotY,  duration: COIN_FALL_MS + COIN_BOUNCE_MS, ease: 'outQuad' }],
        scale:      [{ to: 1,       duration: 200 }],
      }, offset + 100);
    });

    await tl;
    await wait(420);

    // Highlight sutil del resultado
    await animate(coins, {
      scale: [
        { to: 1.06, duration: 220, ease: 'outQuad' },
        { to: 1,    duration: 320, ease: 'inOutSine' },
      ],
      delay: stagger(60),
    });

    return line;
  }

  // Anima salida de las monedas tras dibujar la línea
  async function exit() {
    await animate(coins, {
      opacity: [1, 0],
      translateY: [0, -20],
      duration: 500,
      delay: stagger(50),
      ease: 'inQuad',
    });
    await wait(220);
  }

  reset();

  return { throwLine, reset, exit, destroy };
}
