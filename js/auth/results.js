
import { db } from './session.js';

export async function saveStudentResult({
  activityType,
  activityId,
  activityName,
  level,
  score,
  maxScore
}) {
  try {
    const { data, error } = await db.rpc(
      'save_my_activity_result',
      {
        p_activity_type: activityType,
        p_activity_id: activityId,
        p_activity_name: activityName,
        p_level: level,
        p_score: score,
        p_max_score: maxScore
      }
    );

    if (error) {
      console.error('Error guardando calificación:', error);
      return { ok: false, error };
    }

    console.log('Calificación guardada correctamente:', data);
    return { ok: true, id: data };

  } catch (error) {
    console.error('Error inesperado guardando calificación:', error);
    return { ok: false, error };
  }
}