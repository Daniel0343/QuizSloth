export interface ClaseProfesor {
  id: number;
  nombre: string;
  descripcion: string;
  numEstudiantes: number;
}

export interface ClaseAlumno {
  id: number;
  nombre: string;
  nombreProfesor: string;
  quizzesPendientes: number;
}
