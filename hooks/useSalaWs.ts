import { SecureStorage } from '@/helpers/adapters/secure-storage';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  JugadorDTO,
  PodioDTO,
  PreguntaWsDTO, ResultadoPreguntaDTO,
  getWsUrl,
} from '../core/salas/actions/sala';

export type SalaFase = 'lobby' | 'pregunta' | 'resultado' | 'podio' | 'error';

interface UseSalaWsOptions {
  codigo: string;
  participanteId: number | null;
  esHost: boolean;
}

export function useSalaWs({ codigo, participanteId, esHost }: UseSalaWsOptions) {
  const clientRef = useRef<Client | null>(null);
  const [conectado, setConectado] = useState(false);
  const [fase, setFase] = useState<SalaFase>('lobby');
  const [jugadores, setJugadores] = useState<JugadorDTO[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<PreguntaWsDTO | null>(null);
  const [resultado, setResultado] = useState<ResultadoPreguntaDTO | null>(null);
  const [podio, setPodio] = useState<PodioDTO | null>(null);
  const [respondidos, setRespondidos] = useState(0);
  const [totalJugadores, setTotalJugadores] = useState(0);

  useEffect(() => {
    let token = '';
    SecureStorage.getItem('token').then(t => { token = t ?? ''; });

    const client = new Client({
      brokerURL: getWsUrl(),
      reconnectDelay: 3000,
      onConnect: () => {
        setConectado(true);

        client.subscribe(`/topic/sala/${codigo}/jugadores`, msg => {
          const data: JugadorDTO[] = JSON.parse(msg.body);
          setJugadores(data);
          setTotalJugadores(data.length);
        });

        client.subscribe(`/topic/sala/${codigo}/pregunta`, msg => {
          const data: PreguntaWsDTO = JSON.parse(msg.body);
          setPreguntaActual(data);
          setResultado(null);
          setRespondidos(0);
          setFase('pregunta');
        });

        client.subscribe(`/topic/sala/${codigo}/progreso`, msg => {
          const data: { respondidos: number; total: number } = JSON.parse(msg.body);
          setRespondidos(data.respondidos);
          setTotalJugadores(data.total);
        });

        client.subscribe(`/topic/sala/${codigo}/resultado`, msg => {
          const data: ResultadoPreguntaDTO = JSON.parse(msg.body);
          setResultado(data);
          setJugadores(data.jugadores);
          setFase('resultado');
        });

        client.subscribe(`/topic/sala/${codigo}/fin`, msg => {
          const data: PodioDTO = JSON.parse(msg.body);
          setPodio(data);
          setFase('podio');
        });
      },
      onDisconnect: () => setConectado(false),
      onStompError: () => setFase('error'),
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [codigo]);

  const getToken = async () => (await SecureStorage.getItem('token')) ?? '';

  const iniciar = useCallback(async () => {
    const token = await getToken();
    clientRef.current?.publish({
      destination: `/app/sala/${codigo}/iniciar`,
      body: JSON.stringify({ token }),
    });
  }, [codigo]);

  const responder = useCallback((respuesta: string) => {
    if (!participanteId) return;
    clientRef.current?.publish({
      destination: `/app/sala/${codigo}/responder`,
      body: JSON.stringify({ participanteId, respuesta }),
    });
  }, [codigo, participanteId]);

  const siguiente = useCallback(async () => {
    const token = await getToken();
    clientRef.current?.publish({
      destination: `/app/sala/${codigo}/siguiente`,
      body: JSON.stringify({ token }),
    });
  }, [codigo]);

  const revelar = useCallback(async () => {
    const token = await getToken();
    clientRef.current?.publish({
      destination: `/app/sala/${codigo}/revelar`,
      body: JSON.stringify({ token }),
    });
  }, [codigo]);

  return {
    conectado, fase, jugadores, preguntaActual, resultado, podio,
    respondidos, totalJugadores,
    iniciar, responder, siguiente, revelar,
  };
}
