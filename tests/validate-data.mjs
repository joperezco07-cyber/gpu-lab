// Validación de integridad de datos de GPU LAB (ejecutar: node tests/validate-data.mjs)
import { GPUS, COMPONENTS, DISASSEMBLY, SCENARIOS, REPAIRS, BASE, QUIZ } from '../js/data.js';
import { buildEvidence, TOOLS } from '../js/tools.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('✗', m); } };
const compIds = new Set(COMPONENTS.map(c => c.id));

ok(GPUS.length === 5, '5 tarjetas');
ok(COMPONENTS.length === 12, '12 componentes');
const fields = ['name', 'location', 'func', 'principle', 'failures', 'symptoms', 'inspection', 'tools', 'solutions', 'warnings'];
COMPONENTS.forEach(c => fields.forEach(f => ok(c[f] && (!Array.isArray(c[f]) || c[f].length), `${c.id}.${f} presente`)));
GPUS.forEach(g => ['name', 'arch', 'mem', 'bus', 'connectors', 'cooling', 'internals', 'tdpW', 'model'].forEach(f => ok(g[f], `${g.id}.${f}`)));
DISASSEMBLY.forEach(s => s.focus.forEach(id => ok(compIds.has(id), `desmontaje foco ${id}`)));
ok(SCENARIOS.length === 6, '6 escenarios');
SCENARIOS.forEach(s => {
  const cids = new Set(s.causes.map(c => c.id));
  s.causes.forEach(c => { ok(REPAIRS[c.fix], `${s.id}/${c.id} reparación existe`); ok(c.comp === null || compIds.has(c.comp), `${s.id}/${c.id} componente existe`); });
  ok(s.variants.length >= 2, `${s.id} tiene ≥2 variantes`);
  s.variants.forEach(v => {
    ok(cids.has(v.cause), `${s.id} variante causa ${v.cause} válida`);
    ok(v.why && v.why.length > 20, `${s.id}/${v.cause} explicación`);
    const ev = buildEvidence(v);
    ok(ev.temps.load.gpu > 0 && ev.visual.fans && ev.rails.aux && ev.meter.aux12v, `${s.id}/${v.cause} evidencia completa`);
    Object.values(ev.meter).forEach(m => ok(['ok', 'warn', 'bad'].includes(m.flag), `${s.id}/${v.cause} flag medidor`));
  });
});
ok(TOOLS.length === 9, '9 herramientas');
ok(QUIZ.filter(q => q.lvl === 'basic').length >= 8 && QUIZ.filter(q => q.lvl === 'adv').length >= 8, 'banco de preguntas suficiente');
QUIZ.forEach((q, i) => ok(q.a >= 0 && q.a < q.o.length && q.e, `pregunta ${i} válida`));
ok(BASE.temps.load.gpu < 80, 'base sana');
console.log(fails ? `\n${fails} fallos` : `OK: datos válidos (${GPUS.length} GPUs, ${COMPONENTS.length} componentes, ${SCENARIOS.length} escenarios, ${QUIZ.length} preguntas)`);
process.exit(fails ? 1 : 0);
