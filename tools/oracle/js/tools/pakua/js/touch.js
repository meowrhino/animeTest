// ============================================================
// touch.js — Pointer events: rotación horizontal por prisma
//            + rotación vertical del artilugio entero
// Gesture discrimination: lock to one axis after initial movement
// ============================================================
import * as THREE from 'three';

const SENSITIVITY_X = 0.008;
const SENSITIVITY_Y = 0.005;
const TAP_THRESHOLD = 8;
const LOCK_THRESHOLD = 6;    // px to decide axis lock
const TILT_MIN = -1.0;
const TILT_MAX = 1.2;

export class TouchHandler {
  constructor(canvas, upperPrism, lowerPrism, { onSnap, onTap, getState, getDeviceGroup, getCamera }) {
    this.canvas = canvas;
    this.upperPrism = upperPrism;
    this.lowerPrism = lowerPrism;
    this.onSnap = onSnap;
    this.onTap = onTap;
    this.getState = getState;
    this.getDeviceGroup = getDeviceGroup;
    this.getCamera = getCamera;
    this.raycaster = new THREE.Raycaster();

    this.active = false;
    this.activePrism = null;
    this.axis = null; // 'h' | 'v' | null (undecided)
    this.originX = 0;
    this.originY = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.totalDrag = 0;

    canvas.addEventListener('pointerdown', this._onDown.bind(this));
    canvas.addEventListener('pointermove', this._onMove.bind(this));
    canvas.addEventListener('pointerup', this._onUp.bind(this));
    canvas.addEventListener('pointercancel', this._onUp.bind(this));
  }

  _onDown(e) {
    this.active = true;
    this.originX = this.prevX = e.clientX;
    this.originY = this.prevY = e.clientY;
    this.totalDrag = 0;
    this.axis = null;

    if (this.getState() === 'EXPLORE') {
      this.activePrism = this._pickPrism(e);
    } else {
      this.activePrism = null;
    }

    this.canvas.setPointerCapture(e.pointerId);
  }

  _pickPrism(e) {
    const camera = this.getCamera?.();
    if (camera) {
      const rect = this.canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, camera);

      const upperHits = this.raycaster.intersectObjects(this.upperPrism.group.children, true);
      const lowerHits = this.raycaster.intersectObjects(this.lowerPrism.group.children, true);

      const upperDist = upperHits.length ? upperHits[0].distance : Infinity;
      const lowerDist = lowerHits.length ? lowerHits[0].distance : Infinity;

      if (upperDist < lowerDist) return this.upperPrism;
      if (lowerDist < Infinity) return this.lowerPrism;
    }
    // Fallback: screen position
    const rect = this.canvas.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    return relY < 0.5 ? this.upperPrism : this.lowerPrism;
  }

  _onMove(e) {
    if (!this.active) return;
    if (this.getState() !== 'EXPLORE') return;

    const dx = e.clientX - this.prevX;
    const dy = e.clientY - this.prevY;
    this.totalDrag += Math.abs(dx) + Math.abs(dy);

    // Decide axis lock after some movement
    if (!this.axis) {
      const totalDx = Math.abs(e.clientX - this.originX);
      const totalDy = Math.abs(e.clientY - this.originY);
      if (totalDx > LOCK_THRESHOLD || totalDy > LOCK_THRESHOLD) {
        this.axis = totalDx > totalDy ? 'h' : 'v';
      } else {
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        return; // not enough movement yet
      }
    }

    if (this.axis === 'h' && this.activePrism) {
      // Horizontal: rotate prism
      this.activePrism.addRotation(dx * SENSITIVITY_X);
    } else if (this.axis === 'v') {
      // Vertical: tilt device
      const group = this.getDeviceGroup();
      if (group) {
        group.rotation.x = Math.max(TILT_MIN,
          Math.min(TILT_MAX, group.rotation.x + dy * SENSITIVITY_Y));
      }
    }

    this.prevX = e.clientX;
    this.prevY = e.clientY;
  }

  _onUp(e) {
    if (!this.active) return;
    this.active = false;

    if (this.totalDrag < TAP_THRESHOLD) {
      this.onTap?.();
    } else if (this.axis === 'h' && this.activePrism) {
      this.activePrism.snapToNearest();
      this.onSnap?.();
    }

    this.activePrism = null;
    this.axis = null;
  }
}
