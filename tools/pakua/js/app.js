// ============================================================
// app.js — Entrada principal: escena Three.js, loop, estados
// ============================================================
import * as THREE from 'three';
import { XIANTIAN_ORDER, HOUTIAN_ORDER } from './data.js';
import { OctagonalPrism } from './prism.js';
import { TouchHandler } from './touch.js';
import { initHexagramDisplay, updateHexagram, showPanel, hidePanel } from './hexagram.js';

// ---- State ----
let state = 'EXPLORE';

// ---- Responsive ----
const isMobile = window.innerWidth < 768;

// Camera stays roughly the same angle — we move the DEVICE up/down
const CAM_POS = new THREE.Vector3(0, 0.5, isMobile ? 7.0 : 5.0);
const LOOK_AT = new THREE.Vector3(0, 0, 0);

// Device Y position targets
const DEVICE_Y_EXPLORE = 0;
const DEVICE_Y_DETAIL = isMobile ? 3.0 : 2.5;

// Camera positions per state
const CAM_DETAIL = new THREE.Vector3(0, isMobile ? 3.5 : 3.0, isMobile ? 7.0 : 5.0);

let deviceTargetY = DEVICE_Y_EXPLORE;
let cameraTarget = CAM_POS.clone();
let currentLook = LOOK_AT.clone();
let lookTarget = LOOK_AT.clone();

// ---- Scene setup ----
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.copy(CAM_POS);

// ---- Build prisms ----
let upperPrism, lowerPrism, deviceGroup;

async function init() {
  await document.fonts.ready;

  upperPrism = new OctagonalPrism(XIANTIAN_ORDER, {
    radius: 1.0, height: 0.9, label: '先天'
  });
  lowerPrism = new OctagonalPrism(HOUTIAN_ORDER, {
    radius: 1.0, height: 0.9, label: '後天'
  });

  upperPrism.group.position.y = 0.55;
  lowerPrism.group.position.y = -0.55;

  deviceGroup = new THREE.Group();
  deviceGroup.add(upperPrism.group);
  deviceGroup.add(lowerPrism.group);

  // Slight tilt for 3D depth
  deviceGroup.rotation.x = 0.12;

  scene.add(deviceGroup);

  // ---- Hexagram display ----
  initHexagramDisplay();
  refreshHexagram();

  // ---- Touch ----
  new TouchHandler(renderer.domElement, upperPrism, lowerPrism, {
    onSnap: () => setTimeout(refreshHexagram, 50),
    onTap: toggleState,
    getState: () => state,
    getDeviceGroup: () => deviceGroup,
    getCamera: () => camera,
  });

  // ---- Background ----
  drawBackground();

  // ---- Hide loading ----
  const loading = document.getElementById('loading');
  loading.classList.add('hidden');
  setTimeout(() => loading.remove(), 600);

  animate();
}

function drawBackground() {
  const canvas = document.getElementById('stars');
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Shanshui mountains (ink wash style) — distant, mid, close
  // Distant range (faint, tall peaks)
  drawMountainLayer(ctx, W, H, H * 0.62, H * 0.25, 'rgba(20, 24, 55, 0.35)', 3, 0);
  // Mist
  const mist1 = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.72);
  mist1.addColorStop(0, 'rgba(14, 16, 40, 0)');
  mist1.addColorStop(0.5, 'rgba(14, 16, 40, 0.25)');
  mist1.addColorStop(1, 'rgba(14, 16, 40, 0)');
  ctx.fillStyle = mist1;
  ctx.fillRect(0, H * 0.55, W, H * 0.17);

  // Mid range
  drawMountainLayer(ctx, W, H, H * 0.72, H * 0.20, 'rgba(16, 19, 48, 0.55)', 5, 1.5);
  // Mist
  const mist2 = ctx.createLinearGradient(0, H * 0.68, 0, H * 0.82);
  mist2.addColorStop(0, 'rgba(12, 14, 38, 0)');
  mist2.addColorStop(0.4, 'rgba(12, 14, 38, 0.3)');
  mist2.addColorStop(1, 'rgba(12, 14, 38, 0)');
  ctx.fillStyle = mist2;
  ctx.fillRect(0, H * 0.68, W, H * 0.14);

  // Close range (darker, more defined)
  drawMountainLayer(ctx, W, H, H * 0.82, H * 0.14, 'rgba(10, 12, 32, 0.75)', 4, 3);
  // Foreground hills
  drawMountainLayer(ctx, W, H, H * 0.90, H * 0.08, 'rgba(8, 10, 26, 0.85)', 6, 5);

  // Stars (sparse, golden, only in sky)
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H * 0.6;
    const r = Math.random() * 1.2 + 0.2;
    const alpha = Math.random() * 0.5 + 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    ctx.fill();
  }

  // Moon (subtle glow)
  const moonX = W * 0.78;
  const moonY = H * 0.12;
  const moonGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 60);
  moonGrad.addColorStop(0, 'rgba(212, 175, 55, 0.06)');
  moonGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.02)');
  moonGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = moonGrad;
  ctx.fillRect(moonX - 60, moonY - 60, 120, 120);
  ctx.beginPath();
  ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.fill();
}

function drawMountainLayer(ctx, W, H, baseY, maxHeight, color, peaks, seed) {
  ctx.beginPath();
  ctx.moveTo(0, H);

  const step = Math.max(1, W / (peaks * 30));
  for (let x = 0; x <= W; x += step) {
    const p = x / W;
    const y = baseY
      - Math.pow(Math.sin(p * Math.PI * peaks + seed), 2) * maxHeight * 0.5
      - Math.sin(p * Math.PI * peaks * 2.1 + seed + 1.3) * maxHeight * 0.2
      - Math.max(0, Math.sin(p * Math.PI * peaks * 0.6 + seed + 4)) * maxHeight * 0.3;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function refreshHexagram() {
  const upperKey = upperPrism.getFrontTrigramKey();
  const lowerKey = lowerPrism.getFrontTrigramKey();
  updateHexagram(upperKey, lowerKey);
}

const DEFAULT_TILT = 0.12;
let targetTiltX = DEFAULT_TILT;

function toggleState() {
  if (state === 'EXPLORE') {
    state = 'DETAIL';
    deviceTargetY = DEVICE_Y_DETAIL;
    targetTiltX = DEFAULT_TILT;
    cameraTarget.copy(CAM_DETAIL);
    lookTarget.set(0, DEVICE_Y_DETAIL, 0);
    showPanel();
  } else {
    state = 'EXPLORE';
    deviceTargetY = DEVICE_Y_EXPLORE;
    targetTiltX = DEFAULT_TILT;
    cameraTarget.copy(CAM_POS);
    lookTarget.set(0, 0, 0);
    hidePanel();
  }
}

// ---- Animation loop ----
function animate() {
  requestAnimationFrame(animate);

  // Move device group smoothly
  if (deviceGroup) {
    deviceGroup.position.y += (deviceTargetY - deviceGroup.position.y) * 0.08;
    // Smooth tilt reset in DETAIL
    if (state === 'DETAIL') {
      deviceGroup.rotation.x += (targetTiltX - deviceGroup.rotation.x) * 0.06;
    }
  }

  // Smooth camera position and lookAt
  camera.position.lerp(cameraTarget, 0.06);
  currentLook.lerp(lookTarget, 0.06);
  camera.lookAt(currentLook);

  // Prism snap animation
  upperPrism.update();
  lowerPrism.update();

  if (upperPrism.isSnapping || lowerPrism.isSnapping) {
    refreshHexagram();
  }

  renderer.render(scene, camera);
}


// ---- Resize ----
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Go ----
init();
