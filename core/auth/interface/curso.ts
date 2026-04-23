export interface CursoResumen {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  numAlumnos: number;
  profesor?: { id: number; nombre: string; email: string; };
}

export interface Participante {
  id: number;
  nombre: string;
  email: string;
  rol: 'profesor' | 'alumno';
}

export interface ElementoCurso {
  id: number;
  tipo: 'TEXTO' | 'ENLACE' | 'PDF' | 'QUIZ' | 'APUNTE';
  titulo: string;
  contenido?: string;
  orden: number;
}

export interface SeccionCurso {
  id: number;
  titulo: string;
  orden: number;
  elementos: ElementoCurso[];
}
