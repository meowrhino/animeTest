// ============================================================
// trigrams.js — Canvas2D → CanvasTexture para caras del prisma
// ============================================================
import * as THREE from 'three';
import { TRIGRAMS } from './data.js';

const SIZE = 1024;
const BG_COLOR = '#12132d';
const BG_HIGHLIGHT = '#1c1e48';
const LINE_COLOR = '#e8c547';
const TEXT_COLOR = '#e8c547';
const TEXT_MUTED = '#a09882';

// ---- Side face texture (one trigram) ----
export function createTrigramTexture(trigram, highlighted = false) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = highlighted ? BG_HIGHLIGHT : BG_COLOR;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Border
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 3;
  ctx.globalAlpha = highlighted ? 0.6 : 0.15;
  ctx.strokeRect(16, 16, SIZE - 32, SIZE - 32);
  ctx.globalAlpha = 1;

  // Trigram lines (top-to-bottom = reverse of [bottom, middle, top])
  const lineWidth = 520;
  const lineHeight = 56;
  const gapWidth = 88;
  const startY = 280;
  const lineSpacing = 116;
  const x = (SIZE - lineWidth) / 2;

  ctx.fillStyle = LINE_COLOR;
  const reversed = [...trigram.lines].reverse();
  reversed.forEach((line, i) => {
    const y = startY + i * lineSpacing;
    if (line === 1) {
      roundRect(ctx, x, y, lineWidth, lineHeight, 8);
    } else {
      const segWidth = (lineWidth - gapWidth) / 2;
      roundRect(ctx, x, y, segWidth, lineHeight, 8);
      roundRect(ctx, x + segWidth + gapWidth, y, segWidth, lineHeight, 8);
    }
  });

  // Chinese character
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = '700 112px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(trigram.chinese, SIZE / 2, 720);

  // English name
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '48px "Noto Serif SC", Georgia, serif';
  ctx.fillText(trigram.english, SIZE / 2, 840);

  // Element
  ctx.font = '36px "Noto Serif SC", Georgia, serif';
  ctx.globalAlpha = 0.5;
  ctx.fillText(trigram.element, SIZE / 2, 920);
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---- Octagonal cap texture (bagua radial diagram) ----
export function createBaguaCapTexture(trigramOrder, label) {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  const cx = S / 2;
  const cy = S / 2;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, S, S);

  // Outer octagon
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.4;
  const octR = S * 0.46;
  drawOctagon(ctx, cx, cy, octR);
  ctx.globalAlpha = 1;

  // Inner octagon
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.15;
  const innerR = S * 0.22;
  drawOctagon(ctx, cx, cy, innerR);
  ctx.globalAlpha = 1;

  // Draw each trigram radially
  const FACE_ANGLE = Math.PI / 4;
  for (let i = 0; i < 8; i++) {
    const key = trigramOrder[i];
    const trigram = TRIGRAMS[key];

    // S is at bottom (PI/2), clockwise
    const angle = (Math.PI / 2) + (i * FACE_ANGLE);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const lineW = 72;
    const lineH = 10;
    const gap = 18;
    const gapBreak = 14;
    const startDist = S * 0.26;

    ctx.fillStyle = LINE_COLOR;
    for (let j = 0; j < 3; j++) {
      const dist = startDist + j * (lineH + gap);
      if (trigram.lines[j] === 1) {
        ctx.fillRect(-lineW / 2, dist, lineW, lineH);
      } else {
        const segW = (lineW - gapBreak) / 2;
        ctx.fillRect(-lineW / 2, dist, segW, lineH);
        ctx.fillRect(-lineW / 2 + segW + gapBreak, dist, segW, lineH);
      }
    }

    ctx.restore();
  }

  // Center circle + label
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Main label (large Chinese)
  ctx.fillStyle = LINE_COLOR;
  ctx.globalAlpha = 0.35;
  ctx.font = '700 56px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy - 10);

  // Subtitle
  const subtitle = label === '先天' ? 'Xiantian' : 'Houtian';
  ctx.font = '28px Georgia, serif';
  ctx.globalAlpha = 0.2;
  ctx.fillText(subtitle, cx, cy + 32);
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawOctagon(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI / 4) - Math.PI / 2 + Math.PI / 8;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
