import { quizslothApi } from '@/core/auth/api/quizslothApi';

export interface QuizResumen {
  id: number;
  titulo: string;
  dificultad: string;
  categoria?: { id: number; nombre: string };
}

export async function getQuizzes(categoriaId?: number): Promise<QuizResumen[]> {
  const params = categoriaId ? { categoriaId } : {};
  const { data } = await quizslothApi.get<QuizResumen[]>('/quizzes', { params });
  return data;
}
