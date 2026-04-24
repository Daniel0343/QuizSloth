import { quizslothApi, API_URL } from '@/core/auth/api/quizslothApi';
import { ApunteDetalle, ApunteResumen } from '@/core/auth/interface/apunte';
import { SecureStorage } from '@/helpers/adapters/secure-storage';

export const generarApunteDesdeTexto = async (
  texto: string,
): Promise<ApunteDetalle> => {
  const { data } = await quizslothApi.post<ApunteDetalle>(
    '/apuntes/generar-desde-texto',
    { texto },
    { timeout: 120_000 },
  );
  return data;
};

export const generarApunteDesdeArchivo = async (
  archivo: { uri: string; name: string; type: string },
): Promise<ApunteDetalle> => {
  const token = await SecureStorage.getItem('token');

  const form = new FormData();
  form.append('archivo', { uri: archivo.uri, name: archivo.name, type: archivo.type } as any);

  const response = await fetch(`${API_URL}/apuntes/generar-desde-archivo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Error ${response.status}`);
  }

  return response.json();
};

export const getMisApuntes = async (): Promise<ApunteResumen[]> => {
  const { data } = await quizslothApi.get<ApunteResumen[]>('/apuntes/mis-apuntes');
  return data;
};

export const getApunte = async (id: number): Promise<ApunteDetalle> => {
  const { data } = await quizslothApi.get<ApunteDetalle>(`/apuntes/${id}`);
  return data;
};

export const getApuntePublico = async (id: number): Promise<ApunteDetalle> => {
  const { data } = await quizslothApi.get<ApunteDetalle>(`/apuntes/${id}/ver`);
  return data;
};

export const actualizarApunte = async (
  id: number,
  titulo: string,
  contenidoJson: string,
): Promise<ApunteDetalle> => {
  const { data } = await quizslothApi.put<ApunteDetalle>(`/apuntes/${id}`, { titulo, contenidoJson });
  return data;
};

export const eliminarApunte = async (id: number): Promise<void> => {
  await quizslothApi.delete(`/apuntes/${id}`);
};

export const añadirApunteAColeccion = async (colId: number, apunteId: number) => {
  const { data } = await quizslothApi.post(`/colecciones/${colId}/apuntes/${apunteId}`);
  return data;
};
