// Modelos 3D procedurales (representación educativa). Unidad ≈ 2 cm.
import * as THREE from '../vendor/three.module.js';

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({
  color, metalness: o.m ?? 0.3, roughness: o.r ?? 0.6,
  emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1,
  transparent: !!o.t, opacity: o.op ?? 1
});
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

export function buildGPU(def) {
  const p = def.model;
  const root = new THREE.Group();
  const comps = {};
  const parts = [];
  const fanRotors = [];

  const addPart = (compId, step, offset) => {
    const g = new THREE.Group();
    g.userData = { compId, step, offset: new THREE.Vector3(...offset), cur: 0 };
    root.add(g); parts.push(g); return g;
  };
  const tag = (mesh, id) => {
    mesh.userData.compId = id; mesh.castShadow = true; mesh.receiveShadow = true;
    if (!comps[id]) comps[id] = { meshes: [], anchor: null };
    comps[id].meshes.push(mesh);
    if (!comps[id].anchor) comps[id].anchor = mesh;
    return mesh;
  };

  const L = p.len, W = p.wid;
  const Lc = L - 1.6, xc = -0.8;           // zona del enfriador
  const finH = 0.4 * p.slots + 0.1;
  const plateY = 0.23, finBase = 0.27;
  const topY = finBase + finH;

  // PCB
  const pcbG = addPart('pcb', 0, [0, 0, 0]);
  pcbG.add(tag(box(L, 0.1, W, mat(0x0d1b2a, { m: 0.2, r: 0.5 })), 'pcb'));
  // Soporte de puertos (bracket)
  const brH = topY + 0.3;
  const bracket = tag(box(0.05, brH, W * 0.95, mat(0x9aa4b2, { m: 0.8, r: 0.35 })), 'pcb');
  bracket.position.set(-L / 2 - 0.04, brH / 2 - 0.15, 0);
  pcbG.add(bracket);
  for (let i = 0; i < 4; i++) {
    const port = tag(box(0.08, 0.25, 0.9, mat(0x050607, { m: 0.2, r: 0.8 })), 'pcb');
    port.position.set(-L / 2 - 0.07, 0.25 + (i % 2) * 0.0, -W * 0.3 + i * (W * 0.6 / 3));
    pcbG.add(port);
  }

  // PCIe slot (contactos dorados) y conector auxiliar
  const pcieG = addPart('pcie', 0, [0, 0, 0]);
  const fingers = tag(box(3.8, 0.09, 0.45, mat(0xd4af37, { m: 0.9, r: 0.3 })), 'pcie');
  fingers.position.set(-L / 2 + 3.6, 0, W / 2 + 0.2);
  pcieG.add(fingers);
  const aux = tag(box(1.2, 0.35, 0.55, mat(0x111418, { m: 0.1, r: 0.7 })), 'pcie');
  aux.position.set(L / 2 - 0.8, 0.22, -W / 2 + 0.5);
  pcieG.add(aux);
  const auxPins = tag(box(1.0, 0.05, 0.35, mat(0xd4af37, { m: 0.9, r: 0.3 })), 'pcie');
  auxPins.position.set(L / 2 - 0.8, 0.41, -W / 2 + 0.5);
  pcieG.add(auxPins);

  // GPU Die
  const dieG = addPart('die', 0, [0, 0, 0]);
  const dieX = -L / 2 + L * 0.32;
  const sub = tag(box(p.die * 1.5, 0.06, p.die * 1.5, mat(0x1c4a3a, { m: 0.2, r: 0.6 })), 'die');
  sub.position.set(dieX, 0.08, 0); dieG.add(sub);
  const die = tag(box(p.die, 0.08, p.die, mat(0xc9ced6, { m: 0.9, r: 0.25 })), 'die');
  die.position.set(dieX, 0.15, 0); dieG.add(die);

  // VRAM en anillo
  const vramG = addPart('vram', 0, [0, 0, 0]);
  const [hw, hh] = p.ring;
  const per = 2 * (2 * hw + 2 * hh);
  const ringPos = (d) => {
    d = ((d % per) + per) % per;
    if (d < 2 * hw) return [-hw + d, -hh];
    d -= 2 * hw; if (d < 2 * hh) return [hw, -hh + d];
    d -= 2 * hh; if (d < 2 * hw) return [hw - d, hh];
    d -= 2 * hw; return [-hw, hh - d];
  };
  const vramPos = [];
  for (let i = 0; i < p.vram; i++) {
    const [x, z] = ringPos((i + 0.5) * per / p.vram);
    vramPos.push([dieX + x, z]);
    const c = tag(box(0.55, 0.09, 0.65, mat(0x151a21, { m: 0.4, r: 0.4 })), 'vram');
    c.position.set(dieX + x, 0.095, z);
    vramG.add(c);
    const mark = box(0.3, 0.005, 0.1, mat(0x7a8696, { m: 0.5, r: 0.5 }));
    mark.position.set(dieX + x, 0.143, z); vramG.add(mark);
  }

  // VRM: zona, controlador, MOSFET, inductores, capacitores
  const vx0 = dieX + hw + 1.1;
  const vxMax = L / 2 - 1.8;
  const sp = Math.min(0.55, (vxMax - vx0) / p.phases);
  const vrmG = addPart('vrm', 0, [0, 0, 0]);
  const zone = tag(box(sp * p.phases + 0.3, 0.012, W * 0.62, mat(0x16314d, { m: 0.2, r: 0.5 })), 'vrm');
  zone.position.set(vx0 + sp * p.phases / 2 - sp / 2, 0.056, 0); vrmG.add(zone);
  const ctrl = tag(box(0.5, 0.08, 0.5, mat(0x0a0d12, { m: 0.3, r: 0.4, e: 0x1d4ed8, ei: 0.35 })), 'vrm');
  ctrl.position.set(vx0 - 0.5, 0.1, W * 0.32); vrmG.add(ctrl);

  const mosG = addPart('mosfet', 0, [0, 0, 0]);
  const indG = addPart('inductors', 0, [0, 0, 0]);
  const capG = addPart('capacitors', 0, [0, 0, 0]);
  const vrmPadTargets = [];
  for (let i = 0; i < p.phases; i++) {
    const x = vx0 + i * sp;
    const m1 = tag(box(sp * 0.7, 0.07, 0.34, mat(0x0b0e13, { m: 0.3, r: 0.4 })), 'mosfet');
    m1.position.set(x, 0.09, -W * 0.18); mosG.add(m1);
    const m2 = tag(box(sp * 0.7, 0.07, 0.34, mat(0x0b0e13, { m: 0.3, r: 0.4 })), 'mosfet');
    m2.position.set(x, 0.09, -W * 0.18 + 0.4); mosG.add(m2);
    vrmPadTargets.push([x, -W * 0.18 + 0.2]);
    const ind = tag(box(sp * 0.82, 0.3, 0.55, mat(0x2b323b, { m: 0.7, r: 0.35 })), 'inductors');
    ind.position.set(x, 0.2, W * 0.08); indG.add(ind);
    const cap = tag(new THREE.Mesh(new THREE.CylinderGeometry(sp * 0.3, sp * 0.3, 0.3, 14), mat(0xaab2bd, { m: 0.8, r: 0.3 })), 'capacitors');
    cap.position.set(x, 0.2, W * 0.32); capG.add(cap);
  }
  // MLCC alrededor del die
  const mlccGeo = new THREE.BoxGeometry(0.1, 0.05, 0.07);
  const mlcc = new THREE.InstancedMesh(mlccGeo, mat(0xb08d57, { m: 0.2, r: 0.6 }), 36);
  const dm = new THREE.Matrix4();
  for (let i = 0; i < 36; i++) {
    const side = i % 4, t = (Math.floor(i / 4) / 9 - 0.5) * (p.die * 1.4);
    const off = p.die * 0.95;
    const x = side === 0 ? t : side === 1 ? t : side === 2 ? -off : off;
    const z = side === 0 ? -off : side === 1 ? off : t;
    dm.setPosition(dieX + x, 0.08, z); mlcc.setMatrixAt(i, dm);
  }
  mlcc.instanceMatrix.needsUpdate = true;
  tag(mlcc, 'capacitors'); capG.add(mlcc);

  // Thermal pads (step 4)
  const padG = addPart('pads', 4, [0, 1.0, 0]);
  const padMat = () => mat(0x6d9cff, { m: 0.0, r: 0.9, t: true, op: 0.85 });
  vramPos.forEach(([x, z]) => {
    const pad = tag(box(0.58, 0.05, 0.68, padMat()), 'pads');
    pad.position.set(x, 0.165, z); padG.add(pad);
  });
  vrmPadTargets.forEach(([x, z]) => {
    const pad = tag(box(sp * 0.9, 0.05, 0.8, padMat()), 'pads');
    pad.position.set(x, 0.145, z); padG.add(pad);
  });

  // Disipador (step 3)
  const sinkG = addPart('heatsink', 3, [0, 2.4, 0]);
  const plate = tag(box(Lc * 0.88, 0.08, W * 0.88, mat(0x8a929c, { m: 0.9, r: 0.3 })), 'heatsink');
  plate.position.set(xc, plateY, 0); sinkG.add(plate);
  const cu = tag(box(p.die * 1.5, 0.1, p.die * 1.5, mat(0xb87333, { m: 0.95, r: 0.3 })), 'heatsink');
  cu.position.set(dieX, 0.24, 0); sinkG.add(cu);
  const nF = Math.floor(Lc * 0.85 / 0.14);
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, finH, W * 0.85), mat(0xb9c0c9, { m: 0.9, r: 0.3 }), nF);
  for (let i = 0; i < nF; i++) {
    dm.setPosition(xc - Lc * 0.425 + i * 0.14, finBase + finH / 2, 0); fins.setMatrixAt(i, dm);
  }
  fins.instanceMatrix.needsUpdate = true;
  tag(fins, 'heatsink'); sinkG.add(fins);
  // Backplate (step 3, hacia abajo)
  const backG = addPart('heatsink', 3, [0, -2.6, 0]);
  const back = tag(box(Lc, 0.05, W * 0.97, mat(0x1b1f26, { m: 0.8, r: 0.4 })), 'heatsink');
  back.position.set(xc, -0.1, 0); backG.add(back);
  const stripe = box(Lc * 0.5, 0.01, 0.35, mat(p.accent, { m: 0.3, r: 0.4, e: p.accent, ei: 0.6 }));
  stripe.position.set(xc, -0.13, 0); backG.add(stripe);

  // Heatpipes (step 3)
  const hpG = addPart('heatpipes', 3, [0, 3.0, 0]);
  const nHP = Math.max(3, Math.round(W / 1.2));
  for (let i = 0; i < nHP; i++) {
    const hp = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, Lc * 0.86, 12), mat(0xc77b3a, { m: 0.95, r: 0.25 })), 'heatpipes');
    hp.rotation.z = Math.PI / 2;
    hp.position.set(xc, finBase + 0.18, -W * 0.36 + i * (W * 0.72 / (nHP - 1)));
    hpG.add(hp);
  }

  // Ventiladores (step 2)
  const fanG = addPart('fans', 2, [0, 5.0, 0]);
  const fSp = Lc / p.fans;
  const fanR = Math.min(W * 0.42, fSp * 0.46);
  for (let i = 0; i < p.fans; i++) {
    const g = new THREE.Group();
    g.position.set(xc - Lc / 2 + (i + 0.5) * fSp, topY + 0.06, 0);
    const ring = tag(new THREE.Mesh(new THREE.TorusGeometry(fanR, 0.05, 8, 40), mat(0x0f1318, { m: 0.3, r: 0.6 })), 'fans');
    ring.rotation.x = Math.PI / 2; g.add(ring);
    const rotor = new THREE.Group();
    const hub = tag(new THREE.Mesh(new THREE.CylinderGeometry(fanR * 0.24, fanR * 0.24, 0.12, 20), mat(0x12161c, { m: 0.5, r: 0.4 })), 'fans');
    rotor.add(hub);
    const cap = tag(new THREE.Mesh(new THREE.CylinderGeometry(fanR * 0.15, fanR * 0.15, 0.14, 16), mat(p.accent, { m: 0.4, r: 0.4, e: p.accent, ei: 0.35 })), 'fans');
    rotor.add(cap);
    for (let b = 0; b < 9; b++) {
      const piv = new THREE.Group(); piv.rotation.y = (b / 9) * Math.PI * 2;
      const blade = tag(box(fanR * 0.7, 0.025, fanR * 0.34, mat(0x1b2027, { m: 0.2, r: 0.7 })), 'fans');
      blade.position.x = fanR * 0.6; blade.rotation.x = 0.45; blade.rotation.y = 0.2;
      piv.add(blade); rotor.add(piv);
    }
    g.add(rotor); fanG.add(g);
    fanRotors.push({ rotor, on: true, speed: 0.35 });
  }

  // Cubierta (step 1)
  const shG = addPart('fans', 1, [0, 8.0, 0]);
  const sw = Lc * 0.97, sd = W * 0.97;
  const shape = new THREE.Shape();
  shape.moveTo(-sw / 2, -sd / 2); shape.lineTo(sw / 2, -sd / 2); shape.lineTo(sw / 2, sd / 2); shape.lineTo(-sw / 2, sd / 2); shape.closePath();
  for (let i = 0; i < p.fans; i++) {
    const h = new THREE.Path();
    h.absarc(-Lc / 2 + (i + 0.5) * fSp, 0, fanR * 1.02, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  const topGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false, curveSegments: 40 });
  const shTop = tag(new THREE.Mesh(topGeo, mat(p.shroud, { m: 0.5, r: 0.45 })), 'fans');
  shTop.rotation.x = -Math.PI / 2; shTop.position.set(xc, topY - 0.02, 0); shG.add(shTop);
  const skirt = tag(box(sw, 0.38, 0.05, mat(p.shroud, { m: 0.5, r: 0.45 })), 'fans');
  skirt.position.set(xc, topY - 0.2, sd / 2); shG.add(skirt);
  const skirt2 = tag(box(sw, 0.38, 0.05, mat(p.shroud, { m: 0.5, r: 0.45 })), 'fans');
  skirt2.position.set(xc, topY - 0.2, -sd / 2); shG.add(skirt2);
  const accent = tag(box(sw * 0.5, 0.012, 0.12, mat(p.accent, { m: 0.3, r: 0.4, e: p.accent, ei: 0.8 })), 'fans');
  accent.position.set(xc, topY + 0.045, sd / 2 - 0.2); shG.add(accent);

  root.position.y = 0;
  return { root, comps, parts, fanRotors, dims: { L, W, topY } };
}
