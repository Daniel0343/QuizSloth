export interface QuizResumen {
  id: number;
  titulo: string;
  dificultad: string;
  categoria?: { id: number; nombre: string };
  numPreguntas?: number;
  color?: string;
}

export interface QuizDetalle {
  id: number;
  titulo: string;
  dificultad: 'facil' | 'normal' | 'dificil' | 'extremo';
  categoria?: { id: number; nombre: string };
  fechaCreacion?: string;
  color?: string;
}

export interface PreguntaDetalle {
  id: number;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  respuestaCorrecta: 'A' | 'B' | 'C' | 'D';
  dificultad: 'facil' | 'normal' | 'dificil' | 'extremo';
  orden: number;
  peso: number;
  segundos: number;
}
