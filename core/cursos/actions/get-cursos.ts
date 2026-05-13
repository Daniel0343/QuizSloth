import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { SecureStorage } from '@/helpers/adapters/secure-storage';
import { CursoResumen, Participante, SeccionCurso, ElementoCurso } from '@/core/auth/interface/curso';

export type { CursoResumen };

// Obtiene la lista de cursos del usuario autenticado (como profesor o alumno)
export const getMisCursos = async (): Promise<CursoResumen[]> => {
  const { data } = await quizslothApi.get<CursoResumen[]>('/cursos/mis-cursos');
  return data;
};

// Obtiene el detalle completo de un curso por su ID
export const getCurso = async (id: number): Promise<CursoResumen> => {
  const { data } = await quizslothApi.get<CursoResumen>(`/cursos/${id}`);
  return data;
};

// Crea un nuevo curso con nombre, descripción y color
export const crearCurso = async (nombre: string, descripcion: string, color: string): Promise<CursoResumen> => {
  const { data } = await quizslothApi.post<CursoResumen>('/cursos', { nombre, descripcion, color });
  return data;
};

// Actualiza los datos de un curso existente
export const actualizarCurso = async (id: number, nombre: string, descripcion: string, color: string): Promise<CursoResumen> => {
  const { data } = await quizslothApi.put<CursoResumen>(`/cursos/${id}`, { nombre, descripcion, color });
  return data;
};

// Elimina un curso y todo su contenido por su ID
export const eliminarCurso = async (id: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/${id}`);
};

// Obtiene la lista de alumnos participantes de un curso
export const getParticipantes = async (cursoId: number): Promise<Participante[]> => {
  const { data } = await quizslothApi.get<Participante[]>(`/cursos/${cursoId}/participantes`);
  return data;
};

// Invita a un alumno a un curso mediante su email
export const invitarAlumno = async (cursoId: number, email: string): Promise<CursoResumen> => {
  const { data } = await quizslothApi.post<CursoResumen>(`/cursos/${cursoId}/invitar`, { email });
  return data;
};

// Expulsa a un alumno de un curso
export const quitarAlumno = async (cursoId: number, alumnoId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/${cursoId}/alumnos/${alumnoId}`);
};

// Obtiene las secciones de un curso con sus elementos
export const getSecciones = async (cursoId: number): Promise<SeccionCurso[]> => {
  const { data } = await quizslothApi.get<SeccionCurso[]>(`/cursos/${cursoId}/secciones`);
  return data;
};

// Crea una nueva sección dentro de un curso
export const crearSeccion = async (cursoId: number, titulo: string): Promise<SeccionCurso> => {
  const { data } = await quizslothApi.post<SeccionCurso>(`/cursos/${cursoId}/secciones`, { titulo });
  return data;
};

// Elimina una sección y todos sus elementos
export const eliminarSeccion = async (seccionId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/secciones/${seccionId}`);
};

// Cambia el título de una sección existente
export const editarSeccion = async (seccionId: number, titulo: string): Promise<SeccionCurso> => {
  const { data } = await quizslothApi.put<SeccionCurso>(`/cursos/secciones/${seccionId}`, { titulo });
  return data;
};

// Edita el título y contenido de un elemento de una sección
export const editarElemento = async (elementoId: number, titulo: string, contenido: string): Promise<ElementoCurso> => {
  const { data } = await quizslothApi.put<ElementoCurso>(`/cursos/elementos/${elementoId}`, { titulo, contenido });
  return data;
};

// Crea un nuevo elemento en una sección (texto, enlace, PDF, quiz o apunte)
export const crearElemento = async (
  seccionId: number,
  tipo: 'TEXTO' | 'ENLACE' | 'PDF' | 'QUIZ' | 'APUNTE',
  titulo: string,
  contenido: string,
): Promise<ElementoCurso> => {
  const { data } = await quizslothApi.post<ElementoCurso>(`/cursos/secciones/${seccionId}/elementos`, { tipo, titulo, contenido });
  return data;
};

// Elimina un elemento de una sección
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

// Obtiene las calificaciones de todos los quizzes de un curso agrupadas por quiz
export const getCalificacionesCurso = async (cursoId: number): Promise<CalificacionQuiz[]> => {
  const { data } = await quizslothApi.get<CalificacionQuiz[]>(`/cursos/${cursoId}/calificaciones`);
  return data;
};

// Elimina todas las calificaciones de un quiz concreto dentro de un curso
export const eliminarCalificacionesQuiz = async (cursoId: number, quizId: number): Promise<void> => {
  await quizslothApi.delete(`/cursos/${cursoId}/calificaciones/quiz/${quizId}`);
};

// Sube un PDF al servidor con seguimiento de progreso y devuelve la URL del archivo
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
