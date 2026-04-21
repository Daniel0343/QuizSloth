import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { Categoria } from '@/core/auth/interface/categoria';

export type { Categoria };

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await quizslothApi.get<Categoria[]>('/categorias');
  return data;
}

export async function crearCategoria(nombre: string): Promise<Categoria | null> {
  try {
    const { data } = await quizslothApi.post<Categoria>('/categorias', { nombre });
    return data;
  } catch {
    return null;
  }
}

export async function eliminarCategoria(id: number): Promise<boolean> {
  try {
    await quizslothApi.delete(`/categorias/${id}`);
    return true;
  } catch {
    return false;
  }
}
