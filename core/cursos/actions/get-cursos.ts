import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { SecureStorage } from '@/helpers/adapters/secure-storage';
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

export const editarSeccion = async (seccionId: number, titulo: string): Promise<SeccionCurso> => {
  const { data } = await quizslothApi.put<SeccionCurso>(`/cursos/secciones/${seccionId}`, { titulo });
  return data;
};

export const editarElemento = async (elementoId: number, titulo: string, contenido: string): Promise<ElementoCurso> => {
  const { data } = await quizslothApi.put<ElementoCurso>(`/cursos/elementos/${elementoId}`, { titulo, contenido });
  return data;
};

export const crearElemento = async (
  seccionId: number,
  tipo: 'TEXTO' | 'ENLACE' | 'PDF' | 'QUIZ' | 'APUNTE',
  titulo: string,
  contenido: string,
): Promise<ElementoCurso> => {
  const { data } = await quizslothApi.post<ElementoCurso>(`/cursos/secciones/${seccionId}/elementos`, { tipo, titulo, contenido });
  return data;
};

export const eliminarElemento = async (elementoId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/elementos/${elementoId}`);
};

export interface CalificacionAlumno {
  alumnoNombre: string;
  alumnoEmail: string;
  puntuacion: number;
  porcentaje: number;
  fecha: string | null;
}

export interface CalificacionQuiz {
  quizId: number;
  quizTitulo: string;
  seccionTitulo: string;
  calificaciones: CalificacionAlumno[];
}

export const getCalificacionesCurso = async (cursoId: number): Promise<CalificacionQuiz[]> => {
  const { data } = await quizslothApi.get<CalificacionQuiz[]>(`/cursos/${cursoId}/calificaciones`);
  return data;
};

export const eliminarCalificacionesQuiz = async (cursoId: number, quizId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/${cursoId}/calificaciones/quiz/${quizId}`);
};

export const uploadPdf = (
  uri: string,
  nombre: string,
  onProgress?: (pct: number) => void,
): Promise<string> =>
  SecureStorage.getItem('token').then(token => {
    const base = (quizslothApi.defaults.baseURL ?? '').replace(/\/$/, '');
    const formData = new FormData();
    formData.append('file', { uri, name: nombre, type: 'application/pdf' } as any);

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${base}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token ?? ''}`);
      xhr.timeout = 120000;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const d = JSON.parse(xhr.responseText) as { url: string };
            resolve(`${base}/files/${d.url}`);
          } catch { reject(new Error('Respuesta inválida del servidor')); }
        } else {
          try {
            const err = JSON.parse(xhr.responseText) as { error?: string };
            reject(new Error(err.error ?? 'No se pudo subir el archivo'));
          } catch { reject(new Error('No se pudo subir el archivo')); }
        }
      };
      xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
      xhr.ontimeout = () => reject(new Error('Tiempo de espera agotado'));
      xhr.send(formData);
    });
  });
