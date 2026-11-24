import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.js';

const REGISTER_URL = `${SUPABASE_URL}/functions/v1/student-register`;

export async function registerStudent({ name, pin, password }) {
  try {
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
        },
      body: JSON.stringify({
        name: name.trim(),
        pin: pin.trim(),
        password
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return {
        ok: false,
        error: result.error || 'No se pudo completar el registro.'
      };
    }

    return {
      ok: true,
      publicId: result.public_id,
      message: result.message
    };
  } catch (error) {
    console.error('Error de registro:', error);

    return {
      ok: false,
      error: 'No se pudo conectar con el servidor. Revisa tu conexión.'
    };
  }
}
