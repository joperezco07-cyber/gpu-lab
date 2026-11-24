
import { db } from './session.js';

export async function loginStudent({ publicId, password }) {
  const id = publicId.trim().toUpperCase();

  if (!/^GPU-[A-Z0-9]{12}$/.test(id)) {
    return {
      ok: false,
      error: 'El identificador GPU no tiene un formato válido.'
    };
  }

  if (!password) {
    return {
      ok: false,
      error: 'Escribe tu contraseña.'
    };
  }

  const email = `${id.toLowerCase()}@accounts.gpulab.invalid`;

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: 'Identificador o contraseña incorrectos.'
      };
    }

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('role, active')
      .eq('id', data.user.id)
      .single();

    if (
      profileError ||
      profile?.role !== 'student' ||
      profile?.active !== true
    ) {
      await db.auth.signOut();

      return {
        ok: false,
        error: 'La cuenta de estudiante no está disponible.'
      };
    }

    return { ok: true };
  } catch (error) {
    console.error('Error de acceso:', error);

    return {
      ok: false,
      error: 'No se pudo conectar con el servidor.'
    };
  }
}
