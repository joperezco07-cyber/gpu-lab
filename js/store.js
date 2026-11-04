// Puntuación local (localStorage). No requiere cuenta ni servidor.
const KEY = 'gpulab.v1';
const fresh = () => ({ name: '', scenarios: {}, quiz: { basic: { best: 0, runs: 0 }, adv: { best: 0, runs: 0 } }, identify: { best: 0, runs: 0 }, answered: 0, correct: 0 });
let state;
try { state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { state = fresh(); }

export const store = {
  get: () => state,
  save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* modo privado */ } },
  total() {
    let t = 0;
    Object.values(state.scenarios).forEach(s => { t += (s.basic || 0) + (s.adv || 0); });
    t += state.quiz.basic.best + state.quiz.adv.best + state.identify.best;
    return t;
  },
  reset() { state = fresh(); this.save(); }
};
