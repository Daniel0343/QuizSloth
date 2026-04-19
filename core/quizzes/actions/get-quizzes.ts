import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { QuizResumen } from '@/core/auth/interface/quiz';

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
