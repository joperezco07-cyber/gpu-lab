
import { db } from './session.js';

export async function sendTeacherRecovery(email) {
  if (!email || !email.trim()) {
    return {
      ok: false,
      error: 'Escribe el correo electrónico del profesor.'
    };
  }

  try {
    const { error } = await db.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          'https://joperezco07-cyber.github.io/gpu-lab/reset-password.html'
      }
    );

    if (error) {
      console.error('Error solicitando recuperación:', error);

      return {
        ok: false,
        error: 'No se pudo enviar el correo de recuperación.'
      };
    }

    return {
      ok: true,
      message: 'Revisa tu correo para continuar con la recuperación.'
    };

  } catch (error) {
    console.error('Error inesperado:', error);

    return {
      ok: false,
      error: 'Ocurrió un error al solicitar la recuperación.'
    };
  }
}
