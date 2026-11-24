
import { db } from './session.js';

export async function loginTeacher({ email, password }) {
  if (!email || !email.trim()) {
    return {
      ok: false,
      error: 'Escribe tu correo electrónico.'
    };
  }

  if (!password) {
    return {
      ok: false,
      error: 'Escribe tu contraseña.'
    };
  }

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: 'Correo o contraseña incorrectos.'
      };
    }

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('role, active')
      .eq('id', data.user.id)
      .single();

    if (
      profileError ||
      profile?.role !== 'teacher' ||
      profile?.active !== true
    ) {
      await db.auth.signOut();

      return {
        ok: false,
        error: 'La cuenta de profesor no está disponible.'
      };
    }

    return { ok: true };

  } catch (error) {
    console.error('Error de acceso del profesor:', error);

    return {
      ok: false,
      error: 'No se pudo conectar con el servidor.'
    };
  }
}
