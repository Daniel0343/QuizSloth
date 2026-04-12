export interface QuizResumen {
  id: number;
  titulo: string;
  dificultad: string;
  categoria?: { id: number; nombre: string };
}
