import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { Categoria } from '@/core/auth/interface/categoria';

export type { Categoria };

// Obtiene todas las categorías disponibles en la plataforma
export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await quizslothApi.get<Categoria[]>('/categorias');
  return data;
}

// Crea una nueva categoría con el nombre indicado, solo disponible para profesores
export async function crearCategoria(nombre: string): Promise<Categoria | null> {
  try {
    const { data } = await quizslothApi.post<Categoria>('/categorias', { nombre });
    return data;
  } catch {
    return null;
  }
}

// Elimina una categoría por su ID, devuelve true si se eliminó correctamente
export async function eliminarCategoria(id: number): Promise<boolean> {
  try {
    await quizslothApi.delete(`/categorias/${id}`);
    return true;
  } catch {
    return false;
  }
}
