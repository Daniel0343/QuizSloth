import { getSalaInfo, unirseASala } from '@/core/salas/actions/sala';
import { useSalaWs } from '@/hooks/useSalaWs';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PantallaLobby from '@/components/sala/PantallaLobby';
import PantallaPodio from '@/components/sala/PantallaPodio';
import PantallaPregunta from '@/components/sala/PantallaPregunta';
import PantallaResultado from '@/components/sala/PantallaResultado';
import PantallaUnirse from '@/components/sala/PantallaUnirse';

export default function SalaScreen() {
  const params = useLocalSearchParams<{
    codigo: string; host?: string; participanteId?: string;
  }>();
  const codigo = params.codigo ?? '';
  const esHost = params.host === '1';
  const hostParticipanteId = params.participanteId ? Number(params.participanteId) : null;

  const { user } = useAuthStore();
  const [participanteId, setParticipanteId] = useState<number | null>(
    esHost ? hostParticipanteId : null
  );
  const [nickname, setNickname] = useState('');
  const [uniendose, setUniendose] = useState(false);
  const [quizTitulo, setQuizTitulo] = useState('');
  const [respuestaElegida, setRespuestaElegida] = useState<string | null>(null);

  const ws = useSalaWs({ codigo, participanteId, esHost });

  useEffect(() => {
    getSalaInfo(codigo)
      .then(info => setQuizTitulo(info.quizTitulo))
      .catch(() => { });
  }, [codigo]);

  const handleUnirse = async () => {
    const nick = nickname.trim() || user?.nombre || 'Jugador';
    setUniendose(true);
    try {
      console.log('[UNIRSE] llamando a unirseASala, codigo:', codigo, 'nick:', nick);
      const res = await unirseASala(codigo, nick);
      console.log('[UNIRSE] respuesta:', JSON.stringify(res));
      setParticipanteId(res.participanteId);
      setQuizTitulo(res.sala.quizTitulo);
    } catch (e: any) {
      console.log('[UNIRSE] error:', e?.message ?? e);
      Alert.alert('Error', 'No se pudo unir a la sala. Verifica el código.');
    } finally {
      setUniendose(false);
    }
  };

  const handleResponder = (opcion: string) => {
    if (respuestaElegida) return;
    setRespuestaElegida(opcion);
    ws.responder(opcion);
  };

  useEffect(() => {
    if (ws.fase === 'pregunta') setRespuestaElegida(null);
  }, [ws.preguntaActual?.idx]);

  console.log('[SALA] render — fase:', ws.fase, '| conectado:', ws.conectado, '| participanteId:', participanteId, '| esHost:', esHost, '| preguntaActual:', ws.preguntaActual?.idx);

  if (ws.fase === 'error') {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={48} color="#c1623e" />
        <Text style={styles.errorText}>Error de conexión</Text>
        <Pressable style={styles.btnRojo} onPress={() => router.back()}>
          <Text style={styles.btnTextoBlanco}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  if (!esHost && participanteId === null) {
    return <PantallaUnirse
      nickname={nickname}
      onNickname={setNickname}
      onUnirse={handleUnirse}
      cargando={uniendose}
      codigo={codigo}
    />;
  }

  if (!ws.conectado && participanteId !== null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#571D11" />
        <Text style={styles.conectandoText}>Conectando a la sala...</Text>
      </View>
    );
  }

  if (ws.fase === 'lobby') {
    return <PantallaLobby
      codigo={codigo}
      quizTitulo={quizTitulo}
      jugadores={ws.jugadores}
      esHost={esHost}
      onIniciar={ws.iniciar}
      conectado={ws.conectado}
    />;
  }

  if (ws.fase === 'pregunta' && ws.preguntaActual) {
    return <PantallaPregunta
      pregunta={ws.preguntaActual}
      respuestaElegida={respuestaElegida}
      onResponder={handleResponder}
      respondidos={ws.respondidos}
      total={ws.totalJugadores}
      esHost={esHost}
      onRevelar={ws.revelar}
    />;
  }

  if (ws.fase === 'resultado' && ws.resultado) {
    return <PantallaResultado
      resultado={ws.resultado}
      pregunta={ws.preguntaActual}
      esHost={esHost}
      onSiguiente={ws.siguiente}
    />;
  }

  if (ws.fase === 'podio' && ws.podio) {
    return <PantallaPodio podio={ws.podio} onSalir={() => router.replace('/(stack)/(tabs)/home' as any)} />;
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#571D11" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: '#fdfaf7' },
  conectandoText: { color: '#571D11', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#c1623e', fontSize: 16, fontWeight: '700' },
  btnRojo: {
    height: 48, borderRadius: 14, backgroundColor: '#c1623e',
    paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center',
  },
  btnTextoBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },
});
