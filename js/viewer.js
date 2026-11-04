// Visor 3D: escena, cámara, selección, etiquetas, despiece y desmontaje.
import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { buildGPU } from './models.js';
import { COMPONENTS } from './data.js';

export class Viewer {
  constructor(canvas, labelsEl) {
    this.canvas = canvas; this.labelsEl = labelsEl;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b12);
    this.scene.fog = new THREE.Fog(0x070b12, 40, 90);
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    this.camera.position.set(14, 12, 16);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.08;
    this.controls.maxDistance = 60; this.controls.minDistance = 4;

    const key = new THREE.DirectionalLight(0xdbe8ff, 2.2);
    key.position.set(10, 20, 12); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const sc = key.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 60;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x4f8cff, 1.2); rim.position.set(-14, 6, -10); this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x0b1020, 0.5));

    this.grid = new THREE.GridHelper(60, 60, 0x1e3a5f, 0x10213a);
    this.grid.position.y = -3.4; this.grid.material.transparent = true; this.grid.material.opacity = 0.5;
    this.scene.add(this.grid);

    this.model = null; this.def = null;
    this.explode = 0; this.step = 0;
    this.selected = null; this.focusIds = null;
    this.labelsOn = true; this.spin = true; this.labelsHidden = false;
    this.camGoal = null; this.targetGoal = null;
    this.onSelect = () => {}; this.onPick = null;
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.labelEls = {};

    this._bindPointer();
    window.addEventListener('resize', () => this.resize());
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.renderer.setSize(r.width, r.height, false);
    this.camera.aspect = r.width / r.height; this.camera.updateProjectionMatrix();
    this.w = r.width; this.h = r.height;
  }

  setGPU(def) {
    if (this.model) { this.scene.remove(this.model.root); this._dispose(this.model.root); }
    this.def = def;
    this.model = buildGPU(def);
    this.scene.add(this.model.root);
    this.selected = null; this.focusIds = null; this.step = 0;
    this._buildLabels();
    this.applyVisuals();
    this.setView('iso', true);
  }

  _dispose(obj) {
    obj.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  }

  _buildLabels() {
    this.labelsEl.innerHTML = ''; this.labelEls = {};
    COMPONENTS.forEach(c => {
      const b = document.createElement('button');
      b.className = 'label'; b.textContent = c.name.split(' (')[0].split(' /')[0];
      b.addEventListener('click', () => this.select(c.id));
      this.labelsEl.appendChild(b); this.labelEls[c.id] = b;
    });
  }

  setView(name, instant = false) {
    const { L, W } = this.model.dims; const s = Math.max(L, 8);
    const views = {
      iso: [0.55 * s, 0.7 * s, 0.9 * s],
      front: [0, 1.25 * s, 0.35 * s],
      back: [0, -1.25 * s, -0.35 * s],
      side: [0, 0.15 * s, 1.6 * s]
    };
    const v = views[name] || views.iso;
    this.camGoal = new THREE.Vector3(...v);
    this.targetGoal = new THREE.Vector3(-0.8, 0.5, 0);
    this.currentView = name;
    if (instant) { this.camera.position.copy(this.camGoal); this.controls.target.copy(this.targetGoal); this.camGoal = null; }
  }

  setExplode(v) { this.explode = v; }
  setStep(n) {
    if (n !== this.step && this.model) {
      const s = Math.max(this.model.dims.L, 8);
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.targetGoal = new THREE.Vector3(-0.8, n > 0 ? 1.5 : 0.5, 0);
      this.camGoal = this.targetGoal.clone().add(dir.multiplyScalar(n > 0 ? 2.0 * s : 1.3 * s));
    }
    this.step = n;
  }
  setLabels(on) { this.labelsOn = on; }
  setSpin(on) { this.spin = on; }
  setFanStates(states) { this.model.fanRotors.forEach((f, i) => { f.on = states[i] !== false; f.speed = states.speedMul?.[i] ?? 0.35; }); }
  setFocus(ids) { this.focusIds = ids && ids.length ? new Set(ids) : null; this.applyVisuals(); }

  highlight(id) { this.selected = id; this.applyVisuals(); }
  select(id) { this.highlight(id); if (id) this.onSelect(id); }

  applyVisuals() {
    if (!this.model) return;
    Object.entries(this.model.comps).forEach(([id, c]) => {
      const dim = this.focusIds && !this.focusIds.has(id);
      const sel = this.selected === id;
      c.meshes.forEach(m => {
        const mt = m.material;
        if (mt.userData.baseOp === undefined) { mt.userData.baseOp = mt.opacity; mt.userData.baseT = mt.transparent; }
        const wantT = dim || mt.userData.baseT;
        const wantOp = dim ? 0.12 : mt.userData.baseOp;
        if (mt.transparent !== wantT) { mt.transparent = wantT; mt.needsUpdate = true; }
        mt.opacity = wantOp;
        if (mt.userData.baseEm === undefined) { mt.userData.baseEm = mt.emissive.clone(); mt.userData.baseEi = mt.emissiveIntensity; }
        if (sel) { mt.emissive.set(0x1e90ff); mt.emissiveIntensity = 0.7; }
        else { mt.emissive.copy(mt.userData.baseEm); mt.emissiveIntensity = mt.userData.baseEi; }
      });
    });
  }

  _bindPointer() {
    let down = null;
    this.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    this.canvas.addEventListener('pointerup', e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 6) return;
      const r = this.canvas.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.model.root.children, true)
        .filter(h => h.object.userData.compId && h.object.visible && (!h.object.material.transparent || h.object.material.opacity > 0.3));
      if (!hits.length) return;
      const id = hits[0].object.userData.compId;
      if (this.onPick) this.onPick(id); else this.select(id);
    });
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.model) return;
    if (this.camGoal) {
      this.camera.position.lerp(this.camGoal, 0.1);
      this.controls.target.lerp(this.targetGoal, 0.1);
      if (this.camera.position.distanceTo(this.camGoal) < 0.05) this.camGoal = null;
    }
    this.controls.update();
    // despiece / desmontaje
    this.model.parts.forEach(g => {
      const u = g.userData;
      const goal = Math.max(this.explode, u.step > 0 && this.step >= u.step ? 1 : 0);
      u.cur += (goal - u.cur) * Math.min(1, dt * 6);
      g.position.copy(u.offset).multiplyScalar(u.cur);
    });
    this.model.fanRotors.forEach(f => { if (f.on && this.spin) f.rotor.rotation.y -= f.speed * dt * 20; });
    this._updateLabels();
    this.renderer.render(this.scene, this.camera);
  }

  _updateLabels() {
    const v = new THREE.Vector3();
    COMPONENTS.forEach(c => {
      const el = this.labelEls[c.id]; const comp = this.model.comps[c.id];
      if (!el || !comp) return;
      const show = this.labelsOn && !this.labelsHidden && (!this.focusIds || this.focusIds.has(c.id));
      if (!show) { el.style.display = 'none'; return; }
      comp.anchor.getWorldPosition(v); v.y += 0.35;
      v.project(this.camera);
      if (v.z > 1) { el.style.display = 'none'; return; }
      el.style.display = 'block';
      el.style.transform = `translate(-50%,-100%) translate(${(v.x * 0.5 + 0.5) * this.w}px, ${(-v.y * 0.5 + 0.5) * this.h}px)`;
      el.classList.toggle('sel', this.selected === c.id);
    });
  }
}
