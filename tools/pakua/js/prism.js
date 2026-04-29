// ============================================================
// prism.js — OctagonalPrism built from individual PlaneGeometry faces
// Uses MeshBasicMaterial so textures are always visible (no lighting needed)
// ============================================================
import * as THREE from 'three';
import { TRIGRAMS } from './data.js';
import { createTrigramTexture, createBaguaCapTexture } from './trigrams.js';

const NUM_SIDES = 8;
const FACE_ANGLE = (Math.PI * 2) / NUM_SIDES; // 45°
const SNAP_EASING = 0.12;
const SNAP_THRESHOLD = 0.002;

export class OctagonalPrism {
  constructor(trigramOrder, { radius = 1.0, height = 1.0, label = '' } = {}) {
    this.trigramOrder = trigramOrder;
    this.trigrams = trigramOrder.map(key => TRIGRAMS[key]);
    this.radius = radius;
    this.height = height;
    this.label = label;

    this.currentFaceIndex = 0;
    this.targetRotationY = 0;
    this.actualRotationY = 0;
    this.isSnapping = false;

    this.group = new THREE.Group();
    this.rotatingGroup = new THREE.Group();
    this.group.add(this.rotatingGroup);

    this.textures = [];
    this.highlightTextures = [];
    this.sideMaterials = [];

    this._build();
  }

  _build() {
    // Pre-generate all textures
    for (const trigram of this.trigrams) {
      this.textures.push(createTrigramTexture(trigram, false));
      this.highlightTextures.push(createTrigramTexture(trigram, true));
    }

    // Face dimensions
    const faceWidth = 2 * this.radius * Math.sin(FACE_ANGLE / 2);
    const apothem = this.radius * Math.cos(FACE_ANGLE / 2);

    // 8 side faces as individual planes
    for (let i = 0; i < NUM_SIDES; i++) {
      const geom = new THREE.PlaneGeometry(faceWidth, this.height);
      const mat = new THREE.MeshBasicMaterial({
        map: this.textures[i],
      });
      this.sideMaterials.push(mat);

      const mesh = new THREE.Mesh(geom, mat);
      const angle = i * FACE_ANGLE;
      mesh.position.set(
        Math.sin(angle) * apothem,
        0,
        Math.cos(angle) * apothem
      );
      mesh.rotation.y = angle;
      this.rotatingGroup.add(mesh);
    }

    // Top and bottom caps (octagonal bagua texture)
    const capTexture = createBaguaCapTexture(this.trigramOrder, this.label);
    const capTexture2 = createBaguaCapTexture(this.trigramOrder, this.label);

    // Build octagonal shape for caps
    const capShape = new THREE.Shape();
    for (let i = 0; i < NUM_SIDES; i++) {
      const a = i * FACE_ANGLE + FACE_ANGLE / 2;
      const x = Math.sin(a) * this.radius;
      const z = Math.cos(a) * this.radius;
      if (i === 0) capShape.moveTo(x, z);
      else capShape.lineTo(x, z);
    }
    capShape.closePath();

    const capGeom = new THREE.ShapeGeometry(capShape);

    // Fix UVs: ShapeGeometry creates UVs from shape coords (range ~[-r, r])
    // Remap to [0, 1] centered
    const uvAttr = capGeom.getAttribute('uv');
    for (let i = 0; i < uvAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      uvAttr.setXY(i,
        (u / this.radius + 1) / 2,
        (v / this.radius + 1) / 2
      );
    }
    uvAttr.needsUpdate = true;

    // Top cap
    const topCap = new THREE.Mesh(capGeom, new THREE.MeshBasicMaterial({ map: capTexture }));
    topCap.rotation.x = -Math.PI / 2;
    topCap.position.y = this.height / 2;
    this.rotatingGroup.add(topCap);

    // Bottom cap (clone geometry so UVs are independent)
    const capGeom2 = capGeom.clone();
    const botCap = new THREE.Mesh(capGeom2, new THREE.MeshBasicMaterial({ map: capTexture2 }));
    botCap.rotation.x = Math.PI / 2;
    botCap.position.y = -this.height / 2;
    this.rotatingGroup.add(botCap);

    this._updateHighlight();
  }

  addRotation(deltaRadians) {
    this.actualRotationY += deltaRadians;
    this.rotatingGroup.rotation.y = this.actualRotationY;
    this._updateFaceFromRotation();
  }

  snapToNearest() {
    // Negate because front face = (-rotation / FACE_ANGLE) in octagon geometry
    const negRot = -this.actualRotationY;
    const norm = ((negRot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    this.currentFaceIndex = Math.round(norm / FACE_ANGLE) % NUM_SIDES;

    // Target rotation that aligns this face to front
    this.targetRotationY = -(this.currentFaceIndex * FACE_ANGLE);

    // Shortest path
    const diff = this.targetRotationY - this.actualRotationY;
    const wrapped = ((diff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    this.targetRotationY = this.actualRotationY + wrapped;
    this.isSnapping = true;
  }

  update() {
    if (!this.isSnapping) return;
    const diff = this.targetRotationY - this.actualRotationY;
    if (Math.abs(diff) < SNAP_THRESHOLD) {
      this.actualRotationY = this.targetRotationY;
      this.isSnapping = false;
    } else {
      this.actualRotationY += diff * SNAP_EASING;
    }
    this.rotatingGroup.rotation.y = this.actualRotationY;
    this._updateHighlight();
  }

  _updateFaceFromRotation() {
    const negRot = -this.actualRotationY;
    const norm = ((negRot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    this.currentFaceIndex = Math.round(norm / FACE_ANGLE) % NUM_SIDES;
    this._updateHighlight();
  }

  _updateHighlight() {
    for (let i = 0; i < NUM_SIDES; i++) {
      const mat = this.sideMaterials[i];
      if (i === this.currentFaceIndex) {
        mat.map = this.highlightTextures[i];
      } else {
        mat.map = this.textures[i];
      }
      mat.needsUpdate = true;
    }
  }

  getFrontTrigramKey() {
    return this.trigramOrder[this.currentFaceIndex];
  }

  getFrontTrigram() {
    return TRIGRAMS[this.getFrontTrigramKey()];
  }
}
