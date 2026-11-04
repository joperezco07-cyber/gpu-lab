// Herramientas virtuales de diagnóstico. TODOS los resultados son SIMULADOS.
import { BASE } from './data.js';

export const TOOLS = [
  { id: 'visual', name: 'Inspección visual', icon: '👁️' },
  { id: 'meter', name: 'Multímetro virtual', icon: '🔌' },
  { id: 'thermal', name: 'Cámara térmica', icon: '🌡️' },
  { id: 'temps', name: 'Monitor de temperatura', icon: '📈' },
  { id: 'power', name: 'Monitor de consumo', icon: '🔋' },
  { id: 'fans', name: 'Monitor de ventiladores', icon: '🌀' },
  { id: 'mem', name: 'Prueba de memoria', icon: '🧠' },
  { id: 'stress', name: 'Prueba de estabilidad', icon: '🏁' },
  { id: 'rails', name: 'Análisis de alimentación', icon: '⚡' }
];

export function merge(base, patch) {
  if (patch === undefined) return structuredClone(base);
  if (Array.isArray(patch) || patch === null || typeof patch !== 'object') return patch;
  const out = Array.isArray(base) ? [] : { ...(base || {}) };
  Object.keys(patch).forEach(k => { out[k] = merge(base ? base[k] : undefined, patch[k]); });
  return out;
}
export const buildEvidence = (variant) => merge(BASE, variant.patch);

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const flagCls = { ok: 'ok', warn: 'warn', bad: 'bad' };
const SIM = '<div class="sim">SIMULACIÓN EDUCATIVA · valores ficticios, no son mediciones eléctricas reales</div>';

function tempColor(t) { // paleta "hierro"
  const x = Math.max(0, Math.min(1, (t - 30) / 80));
  const stops = [[0, [10, 10, 60]], [0.25, [90, 20, 140]], [0.5, [200, 40, 60]], [0.75, [250, 150, 20]], [1, [255, 245, 190]]];
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [x0, c0] = stops[i - 1], [x1, c1] = stops[i]; const k = (x - x0) / (x1 - x0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return stops[4][1];
}

export function renderTool(id, el, ctx) {
  const { ev, def } = ctx;
  let cleanup = () => {};
  el.innerHTML = SIM;
  const body = document.createElement('div'); el.appendChild(body);

  if (id === 'visual') {
    const zones = Object.values(ev.visual);
    body.innerHTML = '<div class="chips" id="zc"></div><ul class="obs" id="ol"></ul>';
    const chips = body.querySelector('#zc'), ol = body.querySelector('#ol');
    const draw = (z) => { ol.innerHTML = zones.filter(o => !z || o.z === z).map(o => `<li class="${flagCls[o.s]}"><b>${esc(o.z)}:</b> ${esc(o.t)}</li>`).join(''); };
    ['Todas', ...zones.map(z => z.z)].forEach((z, i) => {
      const b = document.createElement('button'); b.className = 'chip' + (i === 0 ? ' on' : ''); b.textContent = z;
      b.onclick = () => { chips.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); b.classList.add('on'); draw(i === 0 ? null : z); };
      chips.appendChild(b);
    });
    draw(null);
  }

  if (id === 'meter') {
    const keys = Object.keys(ev.meter);
    body.innerHTML = `<label>Punto de prueba
      <select id="mp">${keys.map(k => `<option value="${k}">${esc(ev.meter[k].label)}</option>`).join('')}</select></label>
      <div class="dmm"><div class="dmm-screen" id="dv">----</div><div class="dmm-sub" id="dn">Selecciona un punto y pulsa MEDIR</div></div>
      <button class="btn" id="mb">Medir con las puntas</button>`;
    body.querySelector('#mb').onclick = () => {
      const m = ev.meter[body.querySelector('#mp').value];
      const s = body.querySelector('#dv'); s.textContent = '····';
      setTimeout(() => { s.textContent = m.v; s.className = 'dmm-screen ' + flagCls[m.flag]; body.querySelector('#dn').textContent = m.note; }, 450);
    };
  }

  if (id === 'thermal') {
    const t = ev.temps.load;
    const spots = [{ x: 0.32, y: 0.5, r: 0.09, t: t.gpu + ev.hotspotDelta }];
    [[0.2, 0.28], [0.2, 0.72], [0.44, 0.28], [0.44, 0.72]].forEach(([x, y]) => spots.push({ x, y, r: 0.07, t: t.vram }));
    [0.66, 0.74, 0.82].forEach(x => spots.push({ x, y: 0.5, r: 0.08, t: t.vrm }));
    (ev.thermalExtra || []).forEach(s => spots.push(s));
    body.innerHTML = `<canvas id="tc" width="220" height="100" class="thermal"></canvas>
      <div class="legend"><span>30 °C</span><i></i><span>110 °C</span></div>
      <div class="tt" id="tt">Pasa el cursor o toca la imagen para leer la temperatura (vista simulada del PCB, disipador retirado).</div>`;
    const cv = body.querySelector('#tc'); const g = cv.getContext('2d');
    const W = cv.width, H = cv.height; const img = g.createImageData(W, H); const grid = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let T = 34;
      for (const s of spots) { const dx = (x / W - s.x), dy = (y / H - s.y) * (H / W); T += Math.max(0, (s.t - 34)) * Math.exp(-(dx * dx + dy * dy) / (s.r * s.r)); }
      T = Math.min(T, 115); grid[y * W + x] = T;
      const c = tempColor(T); const i = (y * W + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const read = (e) => { const r = cv.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * W), y = Math.floor((e.clientY - r.top) / r.height * H); body.querySelector('#tt').textContent = `≈ ${grid[y * W + x].toFixed(1)} °C (simulado)`; };
    cv.onpointermove = read; cv.onpointerdown = read;
  }

  if (id === 'temps') {
    body.innerHTML = `<div class="row"><button class="btn" id="tl">▶ Aplicar carga</button><button class="btn ghost" id="ti">■ Reposo</button></div>
      <canvas id="tcv" width="300" height="130" class="chart"></canvas>
      <div class="grid3" id="tv"></div>`;
    const cv = body.querySelector('#tcv'), g = cv.getContext('2d');
    let load = false; const hist = { gpu: [], vram: [], vrm: [] }; const cur = { ...ev.temps.idle };
    const tick = () => {
      const goal = load ? ev.temps.load : ev.temps.idle;
      ['gpu', 'vram', 'vrm'].forEach(k => { cur[k] += (goal[k] - cur[k]) * 0.12 + (Math.random() - 0.5) * 0.8; hist[k].push(cur[k]); if (hist[k].length > 60) hist[k].shift(); });
      g.clearRect(0, 0, 300, 130);
      g.strokeStyle = '#1e3a5f'; g.lineWidth = 1;
      [30, 60, 90].forEach(v => { const y = 130 - (v - 20) / 100 * 130; g.beginPath(); g.moveTo(0, y); g.lineTo(300, y); g.stroke(); g.fillStyle = '#5b7aa3'; g.font = '9px sans-serif'; g.fillText(v + '°', 2, y - 2); });
      [['gpu', '#38bdf8'], ['vram', '#f59e0b'], ['vrm', '#a78bfa']].forEach(([k, c]) => {
        g.strokeStyle = c; g.lineWidth = 2; g.beginPath();
        hist[k].forEach((v, i) => { const x = i * 5, y = 130 - (v - 20) / 100 * 130; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      });
      body.querySelector('#tv').innerHTML = `<div><i style="background:#38bdf8"></i>GPU ${cur.gpu.toFixed(0)} °C</div><div><i style="background:#f59e0b"></i>VRAM ${cur.vram.toFixed(0)} °C</div><div><i style="background:#a78bfa"></i>VRM ${cur.vrm.toFixed(0)} °C</div>`;
    };
    body.querySelector('#tl').onclick = () => { load = true; }; body.querySelector('#ti').onclick = () => { load = false; };
    for (let i = 0; i < 30; i++) tick();
    const iv = setInterval(tick, 500); cleanup = () => clearInterval(iv);
  }

  if (id === 'power') {
    const w = Math.round(def.tdpW * ev.power.loadPct / 100);
    body.innerHTML = `<div class="bar"><span>Reposo</span><div><b style="width:${Math.round(100 * 25 / def.tdpW)}%"></b></div><em>25 W</em></div>
      <div class="bar"><span>Carga</span><div><b class="${ev.power.limit ? 'warn' : ''}" style="width:${ev.power.loadPct}%"></b></div><em>${w} W</em></div>
      <p class="${ev.power.limit ? 'warn' : 'ok'}">Límite de energía alcanzado: <b>${ev.power.limit ? 'SÍ' : 'No'}</b> (consumo = ${ev.power.loadPct} % del TBP ${def.tdpW} W)</p>`;
  }

  if (id === 'fans') {
    const n = def.model.fans; const rows = [];
    for (let i = 0; i < n; i++) {
      let rpm = 1500, pct = 45, st = 'ok', note = 'Normal';
      const s = ev.fanState;
      if (s === 'max') { rpm = 3200; pct = 100; st = 'warn'; note = 'Al máximo'; }
      if (s === 'oneStopped') { if (i === 1 % n) { rpm = 0; pct = 100; st = 'bad'; note = 'Sin giro'; } else { rpm = 2900; pct = 100; st = 'warn'; note = 'Compensando'; } }
      if (s === 'noisy') { if (i === 1 % n) { rpm = 900; pct = 80; st = 'bad'; note = 'Irregular / vibración'; } else { rpm = 2400; pct = 80; st = 'warn'; note = 'Compensando'; } }
      rows.push({ i, rpm, pct, st, note });
    }
    body.innerHTML = rows.map(r => `<div class="bar"><span>Ventilador ${r.i + 1}</span><div><b class="${r.st}" style="width:${r.pct}%"></b></div><em class="${r.st}">${r.rpm} RPM · ${r.note}</em></div>`).join('');
    if (ev.fanState === 'noisy') {
      const iv = setInterval(() => { body.querySelectorAll('em.bad').forEach(e => { e.textContent = `${700 + Math.floor(Math.random() * 450)} RPM · Irregular / vibración`; }); }, 600);
      cleanup = () => clearInterval(iv);
    }
  }

  const runTest = (btnLabel, resultFn) => {
    body.innerHTML = `<button class="btn" id="rb">${btnLabel}</button><div class="prog"><b id="pg"></b></div><div id="rs" class="result"></div>`;
    body.querySelector('#rb').onclick = () => {
      const b = body.querySelector('#pg'); const rs = body.querySelector('#rs'); rs.innerHTML = ''; let p = 0;
      const iv = setInterval(() => { p += 4; b.style.width = p + '%'; if (p >= 100) { clearInterval(iv); rs.innerHTML = resultFn(); } }, 90);
      cleanup = () => clearInterval(iv);
    };
  };
  if (id === 'mem') runTest('Iniciar prueba de memoria', () => `<p class="${ev.memtest.errors ? 'bad' : 'ok'}">Errores detectados: <b>${ev.memtest.errors}</b></p><p>${esc(ev.memtest.note)}</p>`);
  if (id === 'stress') runTest('Iniciar prueba de estabilidad', () => `<p class="${ev.stress.ok ? 'ok' : 'bad'}">Resultado: <b>${ev.stress.ok ? 'ESTABLE' : 'FALLÓ / INESTABLE'}</b></p><p>Frecuencia sostenida: ${ev.stress.clockPct} % del objetivo</p><p>${esc(ev.stress.note)}</p>`);

  if (id === 'rails') {
    const f = { ok: 'ok', warn: 'warn', bad: 'bad' };
    body.innerHTML = `<table class="tbl"><tr><th>Parámetro</th><th>Valor</th></tr>${Object.values(ev.rails).map(r => `<tr><td>${esc(r.n)}</td><td class="${f[r.f]}">${esc(r.v)}</td></tr>`).join('')}</table>
      <p class="muted">Referencia educativa: 12 V ±5 %, rizado bajo, caída transitoria pequeña.</p>`;
  }
  return () => cleanup();
}
