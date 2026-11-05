// GPU LAB 1.0 – interfaz, laboratorio de diagnóstico, quiz y progreso.
import { GPUS, COMPONENTS, DISASSEMBLY, SCENARIOS, REPAIRS, QUIZ } from './data.js';
import { TOOLS, buildEvidence, renderTool } from './tools.js';
import { store } from './store.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const COMP = Object.fromEntries(COMPONENTS.map(c => [c.id, c]));

let viewer = null, gpu = GPUS[0], tab = 'dis', selectedComp = null, step = 0;
let level = 'basic';
let kase = null, toolCleanup = null, quizState = null, identState = null;

const TABS = [['dis', 'Desmontaje'], ['lab', 'Diagnóstico'], ['learn', 'Aprender'], ['prog', 'Progreso']];

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); }

/* ---------- Arranque ---------- */
async function boot() {
  const sel = $('#gpuSel'); fillSelector();
  sel.onchange = () => { gpu = GPUS.find(g => g.id === sel.value); viewer?.setGPU(gpu); step = 0; selectedComp = null; $('#pop').hidden = true; specLine(); applyCaseVisuals(); render(); };
  $('#tabs').innerHTML = TABS.map(([id, n]) => `<button data-tab="${id}">${n}</button>`).join('');
  $('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); };
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => viewer?.setView(b.dataset.view));
  $('#tgLabels').onchange = (e) => viewer?.setLabels(e.target.checked);
  $('#tgSpin').onchange = (e) => viewer?.setSpin(e.target.checked);
  $('#explode').oninput = (e) => viewer?.setExplode(+e.target.value / 100);

  try {
    const { Viewer } = await import('./viewer.js');
    viewer = new Viewer($('#cv'), $('#labels'));
    viewer.onSelect = (id) => { selectedComp = id; showPop(id); };
    viewer.setGPU(gpu);
    $('#loading').remove();
  } catch (err) {
    console.error(err);
    $('#loading').innerHTML = '<b>No se pudo iniciar el visor 3D.</b><br>Tu navegador o dispositivo podría no tener WebGL activado. Puedes seguir usando los módulos de texto (componentes, quiz y diagnóstico).';
  }
  specLine(); setTab('dis');
}

function setTab(t) {
  if (tab === 'learn' && t !== 'learn') stopIdentify();
  tab = t; render();
}

function render() {
  $('#tabs').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  disposeTool();
  const c = $('#content');
  ({ dis: renderDis, lab: renderLab, learn: renderLearn, prog: renderProg })[tab](c);
  c.scrollTop = 0;
  if (tab !== 'dis' && tab !== 'lab' && tab !== 'learn') viewer?.setFocus(null);
}
function disposeTool() { if (toolCleanup) { toolCleanup(); toolCleanup = null; } }

/* ---------- Tarjeta (selector) y ficha de pieza ---------- */
function fillSelector() {
  const sel = $('#gpuSel');
  const groups = {};
  GPUS.forEach(g => (groups[g.vendor] ||= []).push(g));
  sel.innerHTML = Object.entries(groups).map(([v, a]) => `<optgroup label="${esc(v)}">${a.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</optgroup>`).join('');
  sel.value = gpu.id;
}
function specLine() { $('#spec').textContent = `${gpu.arch} · ${gpu.mem} · bus ${gpu.bus} · ${gpu.tdp}`; }
function showPop(id) {
  const comp = COMP[id]; const p = $('#pop');
  if (!comp) { p.hidden = true; return; }
  p.innerHTML = `<button class="x" aria-label="Cerrar">×</button><h4>${esc(comp.name)}</h4><p>${esc(comp.func)}</p><p class="muted"><b>Fallas comunes:</b> ${comp.failures.map(esc).join(' · ')}</p><p class="muted"><b>Ubicación:</b> ${esc(comp.location)}</p>`;
  p.hidden = false; p.querySelector('.x').onclick = () => { p.hidden = true; viewer?.highlight(null); };
}

/* ---------- Desmontaje ---------- */
function renderDis(c) {
  const cur = DISASSEMBLY[step - 1];
  c.innerHTML = `<h2>Laboratorio de desmontaje</h2>
    <p class="note">Representación educativa: el orden refleja un desmontaje típico, pero cada modelo real puede variar (tornillos ocultos, cables, sellos de garantía).</p>
    <ol class="steps">${DISASSEMBLY.map(s => `<li class="${s.n === step ? 'on' : s.n < step ? 'done' : ''}" data-s="${s.n}"><b>${s.n}. ${esc(s.title)}</b></li>`).join('')}</ol>
    ${cur ? `<div class="card"><h4>${esc(cur.title)}</h4><p>${esc(cur.text)}</p><p class="muted"><b>Explicación técnica:</b> ${esc(cur.tech)}</p></div>` : `<div class="card"><p>${step === 0 ? 'La tarjeta está montada. Pulsa «Siguiente» para comenzar.' : ''}</p></div>`}
    <div class="row"><button class="btn ghost" id="prev" ${step <= 0 ? 'disabled' : ''}>◀ Anterior</button><button class="btn" id="next" ${step >= DISASSEMBLY.length ? 'disabled' : ''}>Siguiente ▶</button><button class="btn ghost" id="rebuild">🔧 Volver a montar</button></div>`;
  const go = (n) => { step = n; const cu = DISASSEMBLY[step - 1]; viewer?.setStep(step); viewer?.setFocus(cu ? cu.focus : null); renderDis(c); };
  $('#prev').onclick = () => go(Math.max(0, step - 1));
  $('#next').onclick = () => go(Math.min(DISASSEMBLY.length, step + 1));
  $('#rebuild').onclick = () => { step = 0; viewer?.setStep(0); viewer?.setFocus(null); viewer?.setExplode(0); $('#explode').value = 0; renderDis(c); toast('Tarjeta montada de nuevo'); };
  c.querySelectorAll('[data-s]').forEach(li => li.onclick = () => go(+li.dataset.s));
}

/* ---------- Diagnóstico ---------- */
function levelToggle(c, onChange) {
  const d = document.createElement('div'); d.className = 'seg';
  d.innerHTML = `<button data-l="basic" class="${level === 'basic' ? 'on' : ''}">Básico</button><button data-l="adv" class="${level === 'adv' ? 'on' : ''}">Avanzado</button>`;
  d.onclick = (e) => { const b = e.target.closest('button'); if (b) { level = b.dataset.l; onChange(); } };
  return d;
}

function applyCaseVisuals() {
  if (!viewer) return;
  const n = gpu.model.fans; const st = Array(n).fill(true); st.speedMul = {};
  if (kase && kase.stage !== 'done') {
    const s = kase.ev.fanState; const i = 1 % n;
    if (s === 'oneStopped') st[i] = false;
    if (s === 'noisy') st.speedMul[i] = 0.08;
  }
  viewer.setFanStates(st);
}

function renderLab(c) {
  if (!kase) {
    c.innerHTML = `<h2>Laboratorio de diagnóstico</h2>
      <p class="muted">Recibe una tarjeta con síntomas, usa herramientas virtuales y emite un diagnóstico razonado. Todas las mediciones son <b>simuladas</b>.</p><div id="lt"></div>
      <p class="muted">${level === 'basic' ? 'Básico: guiado, 3 opciones, pista disponible, sin selección de reparación.' : 'Avanzado: todas las causas posibles, selección de componente y procedimiento de reparación, sin pistas. Recomendado tras el nivel básico.'}</p>
      <div class="cases">${SCENARIOS.map(s => { const b = store.get().scenarios[s.id] || {}; return `<button class="case" data-sc="${s.id}"><span class="ico">${s.icon}</span><b>${esc(s.title)}</b><small>Mejor: básico ${b.basic ?? '–'} · avanzado ${b.adv ?? '–'}</small></button>`; }).join('')}</div>`;
    $('#lt', c).replaceWith(levelToggle(c, () => renderLab(c)));
    c.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => startCase(b.dataset.sc));
    return;
  }
  renderCase(c);
}

function startCase(id) {
  const scn = SCENARIOS.find(s => s.id === id);
  const variant = shuffle(scn.variants)[0];
  const ev = buildEvidence(variant);
  const correct = scn.causes.find(x => x.id === variant.cause);
  const others = shuffle(scn.causes.filter(x => x.id !== variant.cause));
  const opts = level === 'basic' ? shuffle([correct, ...others.slice(0, 2)]) : shuffle(scn.causes);
  kase = { scn, variant, ev, correct, opts, level, used: new Set(), hint: false, stage: 'work', picks: {}, tool: null, result: null };
  step = 0; viewer?.setStep(0); viewer?.setFocus(null); viewer?.setExplode(0); $('#explode').value = 0;
  applyCaseVisuals(); render();
}

function endCase() { kase = null; viewer?.setFocus(null); viewer?.highlight(null); applyCaseVisuals(); render(); }

function renderCase(c) {
  const k = kase;
  c.innerHTML = `<button class="link" id="back">◀ Casos</button><h2>${esc(k.scn.title)} <span class="tag">${k.level === 'basic' ? 'Básico' : 'Avanzado'}</span></h2>
    <div class="card"><p>${esc(k.scn.brief)}</p><h4>Síntomas reportados</h4><ul>${k.scn.symptoms.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <p class="muted">Tarjeta en el banco: <b>${esc(gpu.short)}</b>. Cambiar de tarjeta con el selector no altera la causa del caso.</p></div>
    ${k.stage === 'work' ? `
      <h3>Herramientas</h3>
      <div class="tools">${TOOLS.map(t => `<button class="tool ${k.tool === t.id ? 'on' : ''} ${k.used.has(t.id) ? 'used' : ''}" data-t="${t.id}"><span>${t.icon}</span>${esc(t.name)}</button>`).join('')}</div>
      <p class="muted">Herramientas usadas: <b>${k.used.size}</b> (menos pruebas innecesarias = más puntos de eficiencia).</p>
      <div id="tool" class="toolbox"></div>
      ${k.level === 'basic' ? `<button class="btn ghost" id="hint">💡 Pista (−10 pts)</button><p id="hintTxt" class="note" ${k.hint ? '' : 'hidden'}>${esc(hintFor(k))}</p>` : ''}
      <h3>Diagnóstico</h3>
      <form id="dx">
        <fieldset><legend>Causa más probable</legend>${k.opts.map(o => `<label class="opt"><input type="radio" name="cause" value="${o.id}"> ${esc(o.text)}</label>`).join('')}</fieldset>
        ${k.level === 'adv' ? `<fieldset><legend>Componente afectado</legend>${COMPONENTS.map(o => `<label class="opt"><input type="radio" name="comp" value="${o.id}"> ${esc(o.name)}</label>`).join('')}<label class="opt"><input type="radio" name="comp" value="none"> Ninguno (software / configuración / externo)</label></fieldset>
        <fieldset><legend>Procedimiento de reparación</legend>${shuffle([...new Set(k.scn.causes.map(x => x.fix))]).map(f => `<label class="opt"><input type="radio" name="fix" value="${f}"> ${esc(REPAIRS[f])}</label>`).join('')}</fieldset>` : ''}
        <button class="btn" type="submit">Emitir diagnóstico</button>
      </form>` : resultHTML(k)}`;
  $('#back', c).onclick = endCase;
  if (k.stage === 'work') {
    c.querySelectorAll('[data-t]').forEach(b => b.onclick = () => openTool(b.dataset.t, c));
    if (k.tool) mountTool(c);
    $('#hint', c)?.addEventListener('click', () => { k.hint = true; $('#hintTxt', c).hidden = false; $('#hintTxt', c).textContent = hintFor(k); });
    $('#dx', c).onsubmit = (e) => { e.preventDefault(); submitCase(c); };
  } else {
    $('#again', c)?.addEventListener('click', () => startCase(k.scn.id));
    $('#show', c)?.addEventListener('click', () => { if (k.correct.comp) { selectedComp = k.correct.comp; viewer?.highlight(k.correct.comp); viewer?.setFocus([k.correct.comp]); } });
    $('#list', c)?.addEventListener('click', endCase);
  }
}

function hintFor(k) {
  const used = [...k.used];
  if (!used.length) return 'Empieza revisando varias herramientas: ¿qué zona se calienta más? ¿Se comporta igual el núcleo que la memoria?';
  return `Compara lo medido con los valores normales: busca qué zona o parámetro se aparta. Causas posibles a revisar: ${k.opts.map(o => o.text.toLowerCase()).join(' · ')}.`;
}

function openTool(id, c) { kase.tool = id; kase.used.add(id); renderCase(c); }
function mountTool(c) {
  const host = $('#tool', c); disposeTool();
  const t = TOOLS.find(x => x.id === kase.tool);
  host.innerHTML = `<h4>${t.icon} ${esc(t.name)}</h4><div id="tb"></div>`;
  toolCleanup = renderTool(kase.tool, $('#tb', host), { ev: kase.ev, def: gpu });
}

function submitCase(c) {
  const k = kase; const f = new FormData($('#dx', c));
  const cause = f.get('cause');
  if (!cause) { toast('Elige una causa probable'); return; }
  if (k.level === 'adv' && (!f.get('comp') || !f.get('fix'))) { toast('En avanzado completa causa, componente y reparación'); return; }
  const ok = cause === k.correct.id;
  const compOk = k.level === 'adv' ? (f.get('comp') === (k.correct.comp || 'none')) : null;
  const fixOk = k.level === 'adv' ? (f.get('fix') === k.correct.fix) : null;
  const effMax = k.level === 'basic' ? 30 : 20;
  const eff = ok && k.used.size >= 1 ? Math.max(0, effMax - 5 * Math.max(0, k.used.size - 3)) : 0;
  const b = { cause: ok ? (k.level === 'basic' ? 70 : 40) : 0, comp: compOk ? 20 : 0, fix: fixOk ? 20 : 0, eff, hint: k.hint ? -10 : 0 };
  const total = Math.max(0, b.cause + b.comp + b.fix + b.eff + b.hint);
  k.result = { ok, compOk, fixOk, b, total, chosen: k.opts.find(o => o.id === cause) };
  k.stage = 'done'; disposeTool(); applyCaseVisuals();
  const st = store.get(); const rec = st.scenarios[k.scn.id] || (st.scenarios[k.scn.id] = {});
  rec[k.level] = Math.max(rec[k.level] || 0, total);
  st.answered++; if (ok) st.correct++; store.save();
  renderCase(c);
}

function resultHTML(k) {
  const r = k.result;
  const line = (n, p, show = true) => show ? `<li>${n}: <b>${p >= 0 ? '+' : ''}${p}</b></li>` : '';
  return `<div class="card ${r.ok ? 'okc' : 'badc'}"><h3>${r.ok ? '✅ Diagnóstico correcto' : '❌ Diagnóstico incorrecto'} · ${r.total} pts</h3>
    <ul>${line('Causa', r.b.cause)}${line('Componente', r.b.comp, k.level === 'adv')}${line('Reparación', r.b.fix, k.level === 'adv')}${line('Eficiencia (' + k.used.size + ' herramientas)', r.b.eff)}${line('Pista usada', r.b.hint, k.hint)}</ul></div>
    <div class="card"><h4>Diagnóstico razonado</h4><p><b>Causa real:</b> ${esc(k.correct.text)}.</p><p>${esc(k.variant.why)}</p>
    <p><b>Componente:</b> ${k.correct.comp ? esc(COMP[k.correct.comp].name) : 'Ninguno (software / configuración / externo)'}</p>
    <p><b>Reparación recomendada:</b> ${esc(REPAIRS[k.correct.fix])}</p>
    ${!r.ok ? `<p class="muted">Elegiste: ${esc(r.chosen?.text || '')}.</p>` : ''}</div>
    <div class="row">${k.correct.comp ? '<button class="btn ghost" id="show">Ver en 3D</button>' : ''}<button class="btn" id="again">Otro intento</button><button class="btn ghost" id="list">Más casos</button></div>`;
}

/* ---------- Aprender (quiz + identificar) ---------- */
function renderLearn(c) {
  if (quizState) { renderQuiz(c); return; }
  if (identState) { renderIdent(c); return; }
  const s = store.get();
  c.innerHTML = `<h2>Aprendizaje</h2><div id="lt"></div>
    <p class="muted">${level === 'basic' ? 'Básico: identificación de componentes, funciones y reconocimiento de síntomas.' : 'Avanzado: interpretación de mediciones, selección de herramientas y procedimientos.'}</p>
    <div class="cases">
      <button class="case" id="qz"><span class="ico">📝</span><b>Quiz de selección múltiple</b><small>Mejor: ${s.quiz[level].best} pts</small></button>
      ${level === 'basic' ? `<button class="case" id="idt"><span class="ico">🎯</span><b>Identifica el componente en 3D</b><small>Mejor: ${s.identify.best} pts</small></button>` : ''}
    </div>`;
  $('#lt', c).replaceWith(levelToggle(c, () => renderLearn(c)));
  $('#qz', c).onclick = () => { quizState = { lvl: level, qs: shuffle(QUIZ.filter(q => q.lvl === level)).slice(0, 8), i: 0, score: 0, ans: null }; renderLearn(c); };
  $('#idt', c)?.addEventListener('click', () => startIdentify(c));
}

function renderQuiz(c) {
  const q = quizState; const per = q.lvl === 'basic' ? 10 : 15;
  if (q.i >= q.qs.length) {
    const rec = store.get().quiz[q.lvl]; rec.runs++; rec.best = Math.max(rec.best, q.score); store.save();
    c.innerHTML = `<h2>Resultado</h2><div class="card okc"><h3>${q.score} / ${q.qs.length * per} pts</h3><p>${q.score >= q.qs.length * per * 0.6 ? 'Buen trabajo.' : 'Repasa el desmontaje (toca las piezas en 3D para ver su ficha) y vuelve a intentarlo.'}</p></div><button class="btn" id="ok">Volver</button>`;
    $('#ok', c).onclick = () => { quizState = null; renderLearn(c); }; return;
  }
  const cur = q.qs[q.i];
  c.innerHTML = `<p class="muted">Pregunta ${q.i + 1} de ${q.qs.length} · ${q.score} pts</p><h3>${esc(cur.q)}</h3>
    <div class="opts">${cur.o.map((o, i) => `<button class="optb" data-i="${i}">${esc(o)}</button>`).join('')}</div><div id="fb"></div>`;
  c.querySelectorAll('.optb').forEach(b => b.onclick = () => {
    if (q.ans !== null) return; q.ans = +b.dataset.i; const ok = q.ans === cur.a;
    const st = store.get(); st.answered++; if (ok) { st.correct++; q.score += per; } store.save();
    c.querySelectorAll('.optb').forEach((x, i) => { x.classList.toggle('right', i === cur.a); x.classList.toggle('wrong', i === q.ans && !ok); });
    $('#fb', c).innerHTML = `<p class="${ok ? 'ok' : 'bad'}">${ok ? '✅ Correcto.' : '❌ Incorrecto.'} ${esc(cur.e)}</p><button class="btn" id="nx">Siguiente</button>`;
    $('#nx', c).onclick = () => { q.i++; q.ans = null; renderQuiz(c); };
  });
}

function startIdentify(c) {
  if (!viewer) { toast('El visor 3D no está disponible'); return; }
  viewer.setStep(0); viewer.setExplode(0); $('#explode').value = 0; viewer.highlight(null); viewer.labelsHidden = true;
  identState = { qs: shuffle(COMPONENTS).slice(0, 8), i: 0, score: 0, lock: false };
  viewer.onPick = (id) => pickIdent(id, c);
  renderLearn(c);
}
function renderIdent(c) {
  const s = identState;
  if (s.i >= s.qs.length) {
    const rec = store.get().identify; rec.runs++; rec.best = Math.max(rec.best, s.score); store.save();
    const sc = s.score; stopIdentify();
    c.innerHTML = `<h2>Resultado</h2><div class="card okc"><h3>${sc} / 80 pts</h3></div><button class="btn" id="ok">Volver</button>`;
    $('#ok', c).onclick = () => renderLearn(c); return;
  }
  c.innerHTML = `<p class="muted">Ronda ${s.i + 1} de ${s.qs.length} · ${s.score} pts</p><h3>🎯 Toca en el visor 3D: <span class="hl">${esc(s.qs[s.i].name)}</span></h3><p class="muted">Las etiquetas están ocultas durante el juego. Rota y acerca el modelo si lo necesitas.</p><button class="btn ghost" id="stop">Salir</button>`;
  $('#stop', c).onclick = () => { stopIdentify(); renderLearn(c); };
}
function pickIdent(id, c) {
  const s = identState; if (!s || s.lock) return;
  const target = s.qs[s.i]; const ok = id === target.id; s.lock = true;
  if (ok) s.score += 10;
  viewer.highlight(target.id); toast(ok ? '✅ Correcto' : `❌ Era: ${target.name.split(' (')[0]}`);
  setTimeout(() => { if (!identState) return; viewer.highlight(null); s.i++; s.lock = false; renderIdent(c); }, 1100);
}
function stopIdentify() { identState = null; quizState = null; if (viewer) { viewer.onPick = null; viewer.labelsHidden = false; viewer.highlight(null); } }

/* ---------- Progreso ---------- */
function renderProg(c) {
  const s = store.get(); const acc = s.answered ? Math.round(100 * s.correct / s.answered) : 0;
  c.innerHTML = `<h2>Mis resultados</h2>
    <label>Tu nombre o apodo (opcional, solo se guarda en este navegador)<input id="nick" maxlength="24" value="${esc(s.name)}" placeholder="Ej.: Ana"></label>
    <div class="score"><div><b>${store.total()}</b><span>puntos totales</span></div><div><b>${acc}%</b><span>aciertos (${s.correct}/${s.answered})</span></div></div>
    <table class="tbl"><tr><th>Actividad</th><th>Básico</th><th>Avanzado</th></tr>
    ${SCENARIOS.map(x => { const b = s.scenarios[x.id] || {}; return `<tr><td>${x.icon} ${esc(x.title)}</td><td>${b.basic ?? '–'}</td><td>${b.adv ?? '–'}</td></tr>`; }).join('')}
    <tr><td>📝 Quiz</td><td>${s.quiz.basic.best || '–'}</td><td>${s.quiz.adv.best || '–'}</td></tr>
    <tr><td>🎯 Identificar en 3D</td><td>${s.identify.best || '–'}</td><td>–</td></tr></table>
    <p class="muted">Se muestra la mejor puntuación de cada actividad. Tus datos se guardan solo en este dispositivo (sin cuenta). El modo instructor con clasificación en tiempo real corresponde a GPU LAB 2.0 y <b>aún no está implementado</b>.</p>
    <button class="btn ghost danger" id="reset">Borrar mis resultados</button>`;
  $('#nick', c).oninput = (e) => { s.name = e.target.value.slice(0, 24); store.save(); };
  $('#reset', c).onclick = () => { if (confirm('¿Borrar todos tus resultados en este navegador?')) { store.reset(); renderProg(c); } };
}

boot();
