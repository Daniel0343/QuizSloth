import { quizslothApi } from '@/core/auth/api/quizslothApi';

export interface Categoria {
  id: number;
  nombre: string;
}

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await quizslothApi.get<Categoria[]>('/categorias');
  return data;
}
