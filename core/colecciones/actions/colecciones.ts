import { quizslothApi } from '@/core/auth/api/quizslothApi';

export interface ColeccionDTO {
  id: number;
  nombre: string;
  cantidad: number;
}

export const getMisColecciones = async (): Promise<ColeccionDTO[]> => {
  const { data } = await quizslothApi.get<ColeccionDTO[]>('/colecciones/mis-colecciones');
  return data;
};

export const crearColeccion = async (nombre: string): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.post<ColeccionDTO>('/colecciones', { nombre });
  return data;
};

export const añadirQuizAColeccion = async (coleccionId: number, quizId: number): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.post<ColeccionDTO>(`/colecciones/${coleccionId}/quizzes/${quizId}`);
  return data;
};

export const quitarQuizDeColeccion = async (coleccionId: number, quizId: number): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.delete<ColeccionDTO>(`/colecciones/${coleccionId}/quizzes/${quizId}`);
  return data;
};

export const getQuizzesDeColeccion = async (coleccionId: number): Promise<any[]> => {
  const { data } = await quizslothApi.get(`/colecciones/${coleccionId}/quizzes`);
  return data;
};

export const getApuntesDeColeccion = async (coleccionId: number): Promise<any[]> => {
  const { data } = await quizslothApi.get(`/colecciones/${coleccionId}/apuntes`);
  return data;
};

export const quitarApunteDeColeccion = async (coleccionId: number, apunteId: number): Promise<void> => {
  await quizslothApi.delete(`/colecciones/${coleccionId}/apuntes/${apunteId}`);
};

export const eliminarColeccion = async (coleccionId: number): Promise<void> => {
  await quizslothApi.delete(`/colecciones/${coleccionId}`);
};

export const renombrarColeccion = async (coleccionId: number, nombre: string): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.put<ColeccionDTO>(`/colecciones/${coleccionId}`, { nombre });
  return data;
};
