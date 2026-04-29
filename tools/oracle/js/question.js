// Section 2 — Question. Meditative input + method toggle (coins/stalks).
import { animate, createTimeline, stagger, utils, spring } from '../../../shared/js/anime-import.js';
import { splitText } from '../../../shared/js/utils.js';

const METHOD_LABEL = {
  coins: 'Lanzar las monedas',
  stalks: 'Tomar las varitas',
};

export function initQuestion(state) {
  const section = document.getElementById('question');
  const promptHost = section.querySelector('.question__prompt [data-split]');
  const breath = section.querySelector('.question__breath');
  const field = section.querySelector('.question__field');
  const methodEl = section.querySelector('.question__method');
  const methodOptions = section.querySelectorAll('.method-option');
  const textarea = section.querySelector('#question-input');
  const cta = section.querySelector('.question__cta');
  const ctaLabel = section.querySelector('.question__cta-label');

  const chars = splitText(promptHost);

  function setMethod(method) {
    state.method = method;
    methodOptions.forEach((opt) => {
      opt.setAttribute('aria-selected', String(opt.dataset.method === method));
    });
    if (ctaLabel) ctaLabel.textContent = METHOD_LABEL[method] || METHOD_LABEL.coins;
  }

  function reset() {
    utils.set(promptHost.parentElement, { opacity: 1 });
    utils.set(chars, { opacity: 0, translateY: 12, filter: 'blur(6px)' });
    utils.set(breath, { opacity: 0, scale: 0.7 });
    utils.set(field, { opacity: 0, translateY: 10 });
    utils.set(methodEl, { opacity: 0, translateY: 8 });
    utils.set(cta, { opacity: 0, translateY: 8 });
  }

  function play() {
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });
    tl.add(chars, {
      opacity: [0, 1],
      translateY: [12, 0],
      filter: ['blur(6px)', 'blur(0px)'],
      duration: 800,
      delay: stagger(35),
    }, 200);
    tl.add(breath, {
      opacity: [0, 1],
      scale: [0.7, 1],
      duration: 1000,
      ease: spring({ mass: 1, stiffness: 70, damping: 12 }),
    }, '-=400');
    tl.add(field, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 700,
    }, '-=600');
    tl.add(methodEl, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 700,
    }, '-=500');
    tl.add(cta, {
      opacity: [0, 0.4],
      translateY: [8, 0],
      duration: 600,
    }, '-=400');
    return tl;
  }

  // Toggle del método
  methodOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      setMethod(opt.dataset.method);
    });
  });

  // CTA se habilita cuando hay texto suficiente
  textarea.addEventListener('input', () => {
    const hasText = textarea.value.trim().length > 5;
    cta.disabled = !hasText;
    animate(cta, {
      opacity: hasText ? 1 : 0.4,
      duration: 400,
      ease: 'outQuad',
    });
  });

  cta.addEventListener('click', () => {
    const q = textarea.value.trim();
    if (q.length < 5) return;
    state.question = q;
    state.go('throw');
  });

  // Default method
  setMethod(state.method || 'coins');
  reset();

  return { play, reset };
}
