// main.js — orchestrator. Loads I-Ching data, wires sections, manages transitions.
import { initIntro } from './intro.js';
import { initQuestion } from './question.js';
import { initThrow } from './throw.js';
import { initReveal } from './hexagram.js';
import { initReading } from './reading.js';
import { initOutro } from './outro.js';

const SECTION_ORDER = ['intro', 'question', 'throw', 'reveal', 'reading', 'outro'];

const state = {
  iching: {},
  question: '',
  method: 'coins', // 'coins' | 'stalks'
  lines: [],
  primaryBinary: '',
  secondaryBinary: null,
  primary: null,
  secondary: null,
  currentSection: 'intro',
  go(target) {
    if (target === state.currentSection) return;
    if (!SECTION_ORDER.includes(target)) return;

    const currentEl = document.getElementById(state.currentSection);
    const targetEl = document.getElementById(target);
    if (!targetEl) return;

    if (currentEl) currentEl.classList.remove('is-active');
    targetEl.classList.add('is-active');
    state.currentSection = target;

    const api = sections[target];
    if (api?.play) {
      requestAnimationFrame(() => api.play());
    }
  },
  restart() {
    state.question = '';
    state.lines = [];
    state.primary = null;
    state.secondary = null;
    state.primaryBinary = '';
    state.secondaryBinary = null;

    const textarea = document.getElementById('question-input');
    if (textarea) textarea.value = '';
    const qCta = document.querySelector('.question__cta');
    if (qCta) qCta.disabled = true;

    state.go('intro');
  },
};

let sections = {};

async function loadIching() {
  try {
    const res = await fetch('../../shared/data/iching.json');
    if (!res.ok) throw new Error('failed to load iching.json');
    state.iching = await res.json();
  } catch (err) {
    console.warn('Could not load iching.json', err);
    state.iching = {};
  }
}

function wireActions() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'goto') {
      state.go(trigger.dataset.target);
    } else if (action === 'restart') {
      state.restart();
    }
  });
}

async function init() {
  await loadIching();

  sections = {
    intro: initIntro(),
    question: initQuestion(state),
    throw: initThrow(state),
    reveal: initReveal(state),
    reading: initReading(state),
    outro: initOutro(state),
  };

  wireActions();

  // Play the intro on load
  sections.intro.play();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
