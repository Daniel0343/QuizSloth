import { quizslothApi } from '@/core/auth/api/quizslothApi';

export interface ColeccionDTO {
  id: number;
  nombre: string;
  cantidad: number;
}

// Obtiene todas las colecciones del usuario autenticado
export const getMisColecciones = async (): Promise<ColeccionDTO[]> => {
  const { data } = await quizslothApi.get<ColeccionDTO[]>('/colecciones/mis-colecciones');
  return data;
};

// Crea una nueva colección con el nombre indicado
export const crearColeccion = async (nombre: string): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.post<ColeccionDTO>('/colecciones', { nombre });
  return data;
};

// Añade un quiz a una colección existente
export const añadirQuizAColeccion = async (coleccionId: number, quizId: number): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.post<ColeccionDTO>(`/colecciones/${coleccionId}/quizzes/${quizId}`);
  return data;
};

// Quita un quiz de una colección
export const quitarQuizDeColeccion = async (coleccionId: number, quizId: number): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.delete<ColeccionDTO>(`/colecciones/${coleccionId}/quizzes/${quizId}`);
  return data;
};

// Obtiene todos los quizzes guardados en una colección
export const getQuizzesDeColeccion = async (coleccionId: number): Promise<any[]> => {
  const { data } = await quizslothApi.get(`/colecciones/${coleccionId}/quizzes`);
  return data;
};

// Obtiene todos los apuntes guardados en una colección
export const getApuntesDeColeccion = async (coleccionId: number): Promise<any[]> => {
  const { data } = await quizslothApi.get(`/colecciones/${coleccionId}/apuntes`);
  return data;
};

// Quita un apunte de una colección
export const quitarApunteDeColeccion = async (coleccionId: number, apunteId: number): Promise<void> => {
  await quizslothApi.delete(`/colecciones/${coleccionId}/apuntes/${apunteId}`);
};

// Elimina permanentemente una colección y su contenido
export const eliminarColeccion = async (coleccionId: number): Promise<void> => {
  await quizslothApi.delete(`/colecciones/${coleccionId}`);
};

// Cambia el nombre de una colección existente
export const renombrarColeccion = async (coleccionId: number, nombre: string): Promise<ColeccionDTO> => {
  const { data } = await quizslothApi.put<ColeccionDTO>(`/colecciones/${coleccionId}`, { nombre });
  return data;
};
