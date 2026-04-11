import { quizslothApi } from '@/core/auth/api/quizslothApi';

export interface CursoResumen {
  id: number;
  nombre: string;
  descripcion?: string;
}

export async function getCursos(): Promise<CursoResumen[]> {
  const { data } = await quizslothApi.get<CursoResumen[]>('/cursos');
  return data;
}

export async function getCursosByProfesor(profesorId: number): Promise<CursoResumen[]> {
  const { data } = await quizslothApi.get<CursoResumen[]>(`/cursos/profesor/${profesorId}`);
  return data;
}
