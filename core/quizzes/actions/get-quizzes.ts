import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { QuizResumen, QuizDetalle, PreguntaDetalle } from '@/core/auth/interface/quiz';

export type { QuizResumen };

// Obtiene los quizzes públicos, opcionalmente filtrados por categoría
export async function getQuizzes(categoriaId?: number): Promise<QuizResumen[]> {
  const params = categoriaId ? { categoriaId } : {};
  const { data } = await quizslothApi.get<QuizResumen[]>('/quizzes', { params });
  return data;
}

// Obtiene los quizzes creados por el usuario autenticado incluyendo borradores
export async function getMisQuizzes(): Promise<QuizResumen[]> {
  const { data } = await quizslothApi.get<QuizResumen[]>('/quizzes/mis-quizzes');
  return data;
}

// Elimina un quiz por su ID
export async function eliminarQuiz(id: number): Promise<void> {
  await quizslothApi.delete(`/quizzes/${id}`);
}

// Obtiene el detalle completo de un quiz por su ID
export async function getQuiz(id: number): Promise<QuizDetalle> {
  const { data } = await quizslothApi.get<QuizDetalle>(`/quizzes/${id}`);
  return data;
}

// Obtiene las preguntas de un quiz por su ID
export async function getQuizPreguntas(id: number): Promise<PreguntaDetalle[]> {
  const { data } = await quizslothApi.get<PreguntaDetalle[]>(`/quizzes/${id}/preguntas`);
  return data;
}
