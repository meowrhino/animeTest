// Small DOM helpers shared across sections.

// Split a text node's content into per-letter spans wrapped in per-word containers.
// Words wrap as a unit (no mid-word breaks); spaces stay as real text nodes.
export function splitText(el) {
  if (!el || el.dataset.split === 'done') return [];
  const original = el.textContent;
  el.textContent = '';
  const chars = [];
  const words = original.split(' ');
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'split-word';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'split-letter';
      span.textContent = ch;
      wordSpan.appendChild(span);
      chars.push(span);
    }
    el.appendChild(wordSpan);
    if (wi < words.length - 1) {
      el.appendChild(document.createTextNode(' '));
    }
  });
  el.dataset.split = 'done';
  return chars;
}

// Wait helper that resolves after `ms` milliseconds.
export const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Wait for the next animation frame.
export const nextFrame = () =>
  new Promise((res) => requestAnimationFrame(() => res()));

// Scramble text effect: el contenido del elemento se descifra letra a letra
// hasta llegar a `finalText`. Útil para reveals "tipo oráculo" o feedbacks de cálculo.
// Devuelve una función `cancel()` por si quieres parar antes (e.g., el cálculo terminó).
const SCRAMBLE_CHARS = '0123456789子丑寅卯辰巳午未申酉戌亥甲乙丙丁戊己庚辛壬癸天地人易';
export function scrambleText(el, finalText, opts = {}) {
  const { duration = 1500, settleRate = 0.65 } = opts;
  if (!el) return () => {};
  const len = finalText.length;
  const start = performance.now();
  let cancelled = false;

  function frame(now) {
    if (cancelled) return;
    const elapsed = now - start;
    // settleRate < 1 hace que la cabecera se asiente antes que el final
    const progress = Math.min(elapsed / duration, 1);
    const settledLen = Math.floor(Math.pow(progress, settleRate) * len);
    let out = finalText.slice(0, settledLen);
    for (let i = settledLen; i < len; i++) {
      const ch = finalText[i];
      if (/\s/.test(ch)) out += ch;
      else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }

  requestAnimationFrame(frame);
  return () => { cancelled = true; el.textContent = finalText; };
}
