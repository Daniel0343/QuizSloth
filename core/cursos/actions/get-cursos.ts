import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { CursoResumen } from '@/core/auth/interface/curso';

export type { CursoResumen };

export async function getCursos(): Promise<CursoResumen[]> {
  const { data } = await quizslothApi.get<CursoResumen[]>('/cursos');
  return data;
}

export async function getCursosByProfesor(profesorId: number): Promise<CursoResumen[]> {
  const { data } = await quizslothApi.get<CursoResumen[]>(`/cursos/profesor/${profesorId}`);
  return data;
}
