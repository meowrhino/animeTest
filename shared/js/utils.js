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
