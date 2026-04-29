import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { QuizResumen, PreguntaDetalle } from '@/core/auth/interface/quiz';

export type { QuizResumen };

export async function getQuizzes(categoriaId?: number): Promise<QuizResumen[]> {
  const params = categoriaId ? { categoriaId } : {};
  const { data } = await quizslothApi.get<QuizResumen[]>('/quizzes', { params });
  return data;
}

export async function getMisQuizzes(): Promise<QuizResumen[]> {
  const { data } = await quizslothApi.get<QuizResumen[]>('/quizzes/mis-quizzes');
  return data;
}

export async function eliminarQuiz(id: number): Promise<void> {
  await quizslothApi.delete(`/quizzes/${id}`);
}

export async function getQuiz(id: number): Promise<QuizResumen> {
  const { data } = await quizslothApi.get<QuizResumen>(`/quizzes/${id}`);
  return data;
}

export async function getQuizPreguntas(id: number): Promise<PreguntaDetalle[]> {
  const { data } = await quizslothApi.get<PreguntaDetalle[]>(`/quizzes/${id}/preguntas`);
  return data;
}
