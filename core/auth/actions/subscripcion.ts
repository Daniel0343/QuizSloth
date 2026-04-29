import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { Subscripcion } from '@/core/auth/interface/subscripcion';

export const getSubscripcion = async (): Promise<Subscripcion | null> => {
  try {
    const { data } = await quizslothApi.get<Subscripcion>('/auth/me/subscripcion');
    return data;
  } catch {
    return null;
  }
};
