// Single import point for anime.js v4 (ESM via CDN).
// Re-exporting keeps the dep graph clean and lets us swap CDN versions in one place.
export {
  animate,
  createTimeline,
  stagger,
  utils,
  svg,
  text,
  spring,
  createDraggable,
  eases,
} from 'https://cdn.jsdelivr.net/npm/animejs@4/+esm';
