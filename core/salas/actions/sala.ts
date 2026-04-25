import { quizslothApi } from '@/core/auth/api/quizslothApi';

export interface JugadorDTO {
  id: number;
  nickname: string;
  puntos: number;
  respondio: boolean;
}

export interface SalaInfoDTO {
  codigo: string;
  estado: 'ESPERANDO' | 'JUGANDO' | 'TERMINADA';
  preguntaActualIdx: number;
  totalPreguntas: number;
  quizTitulo: string;
  hostParticipanteId: number | null;
  jugadores: JugadorDTO[];
}

export interface PreguntaWsDTO {
  idx: number;
  total: number;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  puntos: number;
  segundos: number;
}

export interface ResultadoPreguntaDTO {
  respuestaCorrecta: string;
  jugadores: JugadorDTO[];
}

export interface PodioDTO {
  podio: JugadorDTO[];
  todos: JugadorDTO[];
}

export interface UnirseResponseDTO {
  participanteId: number;
  sala: SalaInfoDTO;
}

export const crearSala = async (quizId: number): Promise<SalaInfoDTO> => {
  const { data } = await quizslothApi.post<SalaInfoDTO>('/salas', { quizId });
  return data;
};

export const getSalaInfo = async (codigo: string): Promise<SalaInfoDTO> => {
  const { data } = await quizslothApi.get<SalaInfoDTO>(`/salas/${codigo}`);
  return data;
};

export const unirseASala = async (
  codigo: string,
  nickname: string,
): Promise<UnirseResponseDTO> => {
  const { data } = await quizslothApi.post<UnirseResponseDTO>(`/salas/${codigo}/unirse`, { nickname });
  return data;
};

export const guardarCalificacionSolo = async (
  quizId: number,
  puntos: number,
  totalPreguntas: number,
): Promise<void> => {
  await quizslothApi.post(`/salas/solo/calificacion`, { quizId, puntos, totalPreguntas });
};

export const getWsUrl = (): string => {
  const base = (quizslothApi.defaults.baseURL ?? '').replace(/\/api$/, '');
  return base.replace(/^http/, 'ws') + '/api/ws';
};
