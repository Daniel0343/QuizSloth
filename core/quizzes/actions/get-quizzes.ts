import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { QuizResumen } from '@/core/auth/interface/quiz';

export type { QuizResumen };

export async function getQuizzes(categoriaId?: number): Promise<QuizResumen[]> {
  const params = categoriaId ? { categoriaId } : {};
  const { data } = await quizslothApi.get<QuizResumen[]>('/quizzes', { params });
  return data;
}
