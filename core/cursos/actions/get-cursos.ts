import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { CursoResumen, Participante, SeccionCurso, ElementoCurso } from '@/core/auth/interface/curso';

export type { CursoResumen };

export const getMisCursos = async (): Promise<CursoResumen[]> => {
  const { data } = await quizslothApi.get<CursoResumen[]>('/cursos/mis-cursos');
  return data;
};

export const getCurso = async (id: number): Promise<CursoResumen> => {
  const { data } = await quizslothApi.get<CursoResumen>(`/cursos/${id}`);
  return data;
};

export const crearCurso = async (nombre: string, descripcion: string, color: string): Promise<CursoResumen> => {
  const { data } = await quizslothApi.post<CursoResumen>('/cursos', { nombre, descripcion, color });
  return data;
};

export const actualizarCurso = async (id: number, nombre: string, descripcion: string, color: string): Promise<CursoResumen> => {
  const { data } = await quizslothApi.put<CursoResumen>(`/cursos/${id}`, { nombre, descripcion, color });
  return data;
};

export const eliminarCurso = async (id: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/${id}`);
};

export const getParticipantes = async (cursoId: number): Promise<Participante[]> => {
  const { data } = await quizslothApi.get<Participante[]>(`/cursos/${cursoId}/participantes`);
  return data;
};

export const invitarAlumno = async (cursoId: number, email: string): Promise<CursoResumen> => {
  const { data } = await quizslothApi.post<CursoResumen>(`/cursos/${cursoId}/invitar`, { email });
  return data;
};

export const quitarAlumno = async (cursoId: number, alumnoId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/${cursoId}/alumnos/${alumnoId}`);
};

export const getSecciones = async (cursoId: number): Promise<SeccionCurso[]> => {
  const { data } = await quizslothApi.get<SeccionCurso[]>(`/cursos/${cursoId}/secciones`);
  return data;
};

export const crearSeccion = async (cursoId: number, titulo: string): Promise<SeccionCurso> => {
  const { data } = await quizslothApi.post<SeccionCurso>(`/cursos/${cursoId}/secciones`, { titulo });
  return data;
};

export const eliminarSeccion = async (seccionId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/secciones/${seccionId}`);
};

export const crearElemento = async (
  seccionId: number,
  tipo: 'TEXTO' | 'ENLACE' | 'PDF',
  titulo: string,
  contenido: string,
): Promise<ElementoCurso> => {
  const { data } = await quizslothApi.post<ElementoCurso>(`/cursos/secciones/${seccionId}/elementos`, { tipo, titulo, contenido });
  return data;
};

export const eliminarElemento = async (elementoId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/elementos/${elementoId}`);
};
