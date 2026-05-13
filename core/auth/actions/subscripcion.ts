import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { Subscripcion } from '@/core/auth/interface/subscripcion';

// Obtiene el estado actual de la suscripción del usuario autenticado
export const getSubscripcion = async (): Promise<Subscripcion | null> => {
  try {
    const { data } = await quizslothApi.get<Subscripcion>('/auth/me/subscripcion');
    return data;
  } catch {
    return null;
  }
};

// Cancela la suscripción activa del usuario y devuelve true si se realizó correctamente
export const cancelarSubscripcion = async (): Promise<boolean> => {
  try {
    await quizslothApi.delete('/auth/me/subscripcion');
    return true;
  } catch {
    return false;
  }
};

// Reactiva la suscripción del usuario generando un nuevo pedido mensual en Odoo
export const reactivarSubscripcion = async (): Promise<boolean> => {
  try {
    await quizslothApi.post('/auth/me/subscripcion');
    return true;
  } catch {
    return false;
  }
};
