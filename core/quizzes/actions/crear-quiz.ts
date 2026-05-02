import { quizslothApi, API_URL } from '@/core/auth/api/quizslothApi';
import { QuizDetalle, PreguntaDetalle } from '@/core/auth/interface/quiz';
import { SecureStorage } from '@/helpers/adapters/secure-storage';

export interface QuizConPreguntas {
  quiz: QuizDetalle;
  preguntas: PreguntaDetalle[];
}

export const generarQuizDesdeTexto = async (
  titulo: string,
  texto: string,
  numPreguntas: number,
  dificultad: string,
  categoriaId?: number,
): Promise<QuizConPreguntas | { error: string }> => {
  const { data } = await quizslothApi.post<QuizConPreguntas>(
    '/quizzes/generar-desde-texto',
    { titulo, texto, numPreguntas, dificultad, categoriaId },
    { timeout: 120_000 },
  );
  return data;
};

export const generarQuizDesdeArchivo = async (
  archivo: { uri: string; name: string; type: string },
  titulo: string,
  numPreguntas: number,
  dificultad: string,
  categoriaId?: number,
): Promise<QuizConPreguntas> => {
  const token = await SecureStorage.getItem('token');

  const form = new FormData();
  form.append('archivo', { uri: archivo.uri, name: archivo.name, type: archivo.type } as any);
  form.append('titulo', titulo);
  form.append('numPreguntas', String(numPreguntas));
  form.append('dificultad', dificultad);
  if (categoriaId) form.append('categoriaId', String(categoriaId));

  const response = await fetch(`${API_URL}/quizzes/generar-desde-archivo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw Object.assign(new Error(text || `Error ${response.status}`), {
      response: { status: response.status, data: { message: text } },
    });
  }

  return response.json();
};

export const crearQuizVacio = async (titulo: string): Promise<QuizDetalle> => {
  const { data } = await quizslothApi.post<QuizDetalle>('/quizzes', { titulo });
  return data;
};

export const actualizarQuiz = async (
  id: number,
  campos: { titulo?: string; dificultad?: string; categoriaId?: number; color?: string },
): Promise<QuizDetalle> => {
  const { data } = await quizslothApi.put<QuizDetalle>(`/quizzes/${id}`, campos);
  return data;
};

export const actualizarPregunta = async (
  id: number,
  campos: Partial<PreguntaDetalle>,
): Promise<PreguntaDetalle> => {
  const { data } = await quizslothApi.put<PreguntaDetalle>(`/preguntas/${id}`, campos);
  return data;
};

export const obtenerPreguntas = async (quizId: number): Promise<PreguntaDetalle[]> => {
  try {
    const { data } = await quizslothApi.get<PreguntaDetalle[]>(`/quizzes/${quizId}/preguntas`);
    return data;
  } catch (e) {
    return [];
  }
};

export const crearPregunta = async (quizId: number, orden: number): Promise<PreguntaDetalle> => {
  const { data } = await quizslothApi.post<PreguntaDetalle>('/preguntas', { quizId, orden });
  return data;
};

export const eliminarPreguntaApi = async (id: number): Promise<void> => {
  await quizslothApi.delete(`/preguntas/${id}`);
};

export const getPlantillas = async (): Promise<any[]> => {
  const { data } = await quizslothApi.get<any[]>('/plantillas');
  return data;
};

export const clonarPlantilla = async (id: number): Promise<QuizConPreguntas> => {
  const { data } = await quizslothApi.post<QuizConPreguntas>(`/plantillas/${id}/clonar`);
  return data;
};
