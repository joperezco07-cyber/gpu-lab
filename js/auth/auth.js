
import { db } from './session.js';
import { TIMEZONE } from '../config/supabase.js';

const fmt = (d) =>
  new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: TIMEZONE
  }).format(new Date(d));

const MSG = {
  invalid: ['bad', 'El PIN no es válido. Revisa que esté bien escrito o pídelo a tu profesor.'],
  inactive: ['warn', 'Esta clase está desactivada. Consulta a tu profesor.'],
  rate_limited: ['warn', 'Demasiados intentos. Espera unos minutos antes de volver a probar.'],
  error: ['bad', 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.']
};

export async function checkPin(pin) {
  try {
    const { data, error } = await db.rpc('check_class_pin', {
      p_pin: pin.trim()
    });

    if (error) {
      console.error('Error de Supabase:', error);
      return { ok: false, state: 'error' };
    }

    if (!data) {
      return { ok: false, state: 'error' };
    }

    return data;
  } catch (error) {
    console.error('Error de conexión:', error);
    return { ok: false, state: 'error' };
  }
}

function describe(r) {
  if (r.state === 'open') {
    return [
      'ok',
      `PIN válido: ${r.class_name}.` +
      (r.closes_at ? ` La clase cierra el ${fmt(r.closes_at)}.` : '')
    ];
  }

  if (r.state === 'not_started') {
    return ['warn', `La clase «${r.class_name}» abre el ${fmt(r.opens_at)}.`];
  }

  if (r.state === 'closed') {
    return ['warn', `La clase «${r.class_name}» cerró el ${fmt(r.closes_at)}.`];
  }

  return MSG[r.state] || MSG.error;
}

const form = document.getElementById('pinForm');

if (form) {
  const input = document.getElementById('pin');
  const out = document.getElementById('pinMsg');
  const btn = form.querySelector('button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    btn.disabled = true;
    out.className = 'msg';
    out.textContent = 'Validando…';

    try {
      const r = await checkPin(input.value);
      const [cls, txt] = describe(r);

      out.className = 'msg ' + cls;
      out.textContent = txt;
    } finally {
      btn.disabled = false;
    }
  });
}
