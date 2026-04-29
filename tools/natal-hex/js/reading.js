// Lectura natal: carga el markdown del hexagrama desde data/natal/<number>.md y lo renderiza.
// Renderer minimalista (no se incluye dependencia de marked.js para mantener el stack ligero).
import { animate, utils } from '../../../shared/js/anime-import.js';

// Markdown → HTML básico. Soporta: # headings, ** **, *italic*, ---, párrafos, listas simples.
function renderMarkdown(md) {
  // Escape HTML primero
  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Bloques: headings y reglas horizontales
  html = html
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---+$/gm, '<hr>');

  // Inline: negrita, cursiva
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

  // Párrafos: doble salto de línea = boundary
  const blocks = html.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return blocks
    .map((b) => {
      if (b.startsWith('<h') || b.startsWith('<hr')) return b;
      return `<p>${b.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');
}

export function initReading({ section }) {
  const body = section.querySelector('#reading-body');
  const titleCn = section.querySelector('#reading-name-cn');
  const titlePy = section.querySelector('#reading-name-py');
  const meaning = section.querySelector('#reading-meaning');

  async function loadAndRender(natal) {
    titleCn.textContent = natal.chinese;
    titlePy.textContent = natal.pinyin;
    meaning.textContent = natal.spanish;

    body.innerHTML = '<p class="reading__loading">Cargando interpretación…</p>';
    try {
      const res = await fetch(`./data/natal/${natal.number}.md`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();
      body.innerHTML = renderMarkdown(md);
    } catch (err) {
      body.innerHTML = `<p class="reading__loading">No se encontró interpretación para el hexagrama #${natal.number}. (${err.message})</p>`;
    }
  }

  function play() {
    utils.set(body, { opacity: 0, translateY: 12 });
    return animate(body, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 800,
      ease: 'outExpo',
    });
  }

  return { loadAndRender, play };
}
