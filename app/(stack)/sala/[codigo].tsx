import { getSalaInfo, unirseASala } from '@/core/salas/actions/sala';
import { useSalaWs } from '@/hooks/useSalaWs';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Pressable, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPCIONES = ['A', 'B', 'C', 'D'] as const;
const OPCION_COLORS = ['#c0392b', '#27ae60', '#d35400', '#2980b9'];
const OPCION_BG = ['#fadbd8', '#d5f5e3', '#fdebd0', '#d6eaf8'];

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

function PantallaUnirse({ nickname, onNickname, onUnirse, cargando, codigo }: {
  nickname: string; onNickname: (v: string) => void;
  onUnirse: () => void; cargando: boolean; codigo: string;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#412E2E" />
      </Pressable>
      <View style={styles.joinContainer}>
        <Text style={styles.joinTitle}>Unirse a la sala</Text>
        <Text style={styles.joinCode}>{codigo}</Text>
        <TextInput
          style={styles.nicknameInput}
          placeholder="Tu nombre o apodo"
          placeholderTextColor="rgba(65,46,46,0.45)"
          value={nickname}
          onChangeText={onNickname}
          maxLength={20}
          autoFocus
        />
        <Pressable
          style={[styles.btnPrimario, cargando && { opacity: 0.6 }]}
          onPress={onUnirse}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={styles.btnTextoBlanco}>Entrar a la sala</Text>
          }
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PantallaLobby({ codigo, quizTitulo, jugadores, esHost, onIniciar, conectado }: {
  codigo: string; quizTitulo: string; jugadores: any[];
  esHost: boolean; onIniciar: () => void; conectado: boolean;
}) {
  const [iniciando, setIniciando] = useState(false);

  const handleIniciar = async () => {
    setIniciando(true);
    await onIniciar();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#412E2E" />
      </Pressable>
      <ScrollView contentContainerStyle={styles.lobbyContent}>
        <Text style={styles.lobbyTitulo} numberOfLines={2}>{quizTitulo}</Text>

        <View style={styles.codigoCard}>
          <Text style={styles.codigoLabel}>Código de sala</Text>
          <Text style={styles.codigoValor}>{codigo}</Text>
          <Text style={styles.codigoHint}>Comparte este código para que otros se unan</Text>
        </View>

        <View style={styles.qrCard}>
          {conectado && (
            <QRCode value={codigo} size={160} color="#412E2E" backgroundColor="#fdfaf7" />
          )}
        </View>

        <View style={styles.jugadoresCard}>
          <Text style={styles.jugadoresTitle}>
            Jugadores ({jugadores.length})
          </Text>
          {jugadores.map(j => (
            <View key={j.id} style={styles.jugadorRow}>
              <View style={styles.jugadorAvatar}>
                <Ionicons name="person" size={14} color="#571D11" />
              </View>
              <Text style={styles.jugadorNick}>{j.nickname}</Text>
            </View>
          ))}
          {jugadores.length === 0 && (
            <Text style={styles.esperandoText}>Esperando jugadores...</Text>
          )}
        </View>

        {esHost && (
          <Pressable
            style={[
              styles.btnPrimario,
              (jugadores.length === 0 || iniciando) && { opacity: 0.5 },
            ]}
            onPress={handleIniciar}
            disabled={jugadores.length === 0 || iniciando}
          >
            {iniciando
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.btnTextoBlanco}>Comenzar partida</Text>
            }
          </Pressable>
        )}

        {!esHost && (
          <View style={styles.esperandoCard}>
            <ActivityIndicator size="small" color="#571D11" />
            <Text style={styles.esperandoHostText}>Esperando que el host inicie la partida...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PantallaPregunta({ pregunta, respuestaElegida, onResponder, respondidos, total, esHost, onRevelar }: {
  pregunta: any; respuestaElegida: string | null;
  onResponder: (o: string) => void;
  respondidos: number; total: number;
  esHost: boolean; onRevelar: () => void;
}) {
  const [segundos, setSegundos] = useState(pregunta.segundos ?? 30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSegundos(pregunta.segundos ?? 30);
    timerRef.current = setInterval(() => {
      setSegundos((s: number) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [pregunta.idx]);

  const opciones = [pregunta.opcionA, pregunta.opcionB, pregunta.opcionC, pregunta.opcionD];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#571D11' }]}>
      <View style={styles.preguntaHeader}>
        <Text style={styles.preguntaIdx}>
          {pregunta.idx + 1} / {pregunta.total}
        </Text>
        <View style={styles.timerCircle}>
          <Text style={[styles.timerText, segundos <= 5 && { color: '#ff6b6b' }]}>{segundos}</Text>
        </View>
      </View>

      <View style={styles.enunciadoCard}>
        <Text style={styles.enunciado}>{pregunta.enunciado}</Text>
        <Text style={styles.preguntaPuntos}>+{pregunta.puntos} pts</Text>
      </View>

      <View style={styles.opcionesGrid}>
        {OPCIONES.map((letra, i) => (
          <Pressable
            key={letra}
            style={[
              styles.opcionBtn,
              { backgroundColor: OPCION_BG[i], borderColor: OPCION_COLORS[i] },
              respuestaElegida === letra && {
                backgroundColor: OPCION_COLORS[i],
                borderColor: OPCION_COLORS[i],
              },
              (respuestaElegida !== null && respuestaElegida !== letra) && { opacity: 0.45 },
            ]}
            onPress={() => onResponder(letra)}
            disabled={respuestaElegida !== null || segundos === 0}
          >
            <View style={[styles.opcionLetraBox, { backgroundColor: OPCION_COLORS[i] }]}>
              <Text style={styles.opcionLetra}>{letra}</Text>
            </View>
            <Text
              style={[
                styles.opcionTexto,
                respuestaElegida === letra && { color: 'white', fontWeight: '700' },
              ]}
              numberOfLines={3}
            >
              {opciones[i]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.progresoRow}>
        <Text style={styles.progresoText}>{respondidos}/{total} respondieron</Text>
        {esHost && (
          <Pressable style={styles.btnRevelarSmall} onPress={onRevelar}>
            <Text style={styles.btnRevelarText}>Revelar resultado</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const LETRA_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

function PantallaResultado({ resultado, pregunta, esHost, onSiguiente }: {
  resultado: any; pregunta: any; esHost: boolean; onSiguiente: () => void;
}) {
  const [avanzando, setAvanzando] = useState(false);

  const handleSig = async () => {
    setAvanzando(true);
    await onSiguiente();
  };

  const letra = resultado.respuestaCorrecta as string;
  const idx = LETRA_IDX[letra] ?? 0;
  const color = OPCION_COLORS[idx];
  const bg = OPCION_BG[idx];
  const opciones: Record<string, string> = pregunta
    ? { A: pregunta.opcionA, B: pregunta.opcionB, C: pregunta.opcionC, D: pregunta.opcionD }
    : {};
  const textoOpcion = opciones[letra] ?? '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#fdfaf7' }]}>
      <View style={styles.resultadoHeader}>
        <Text style={styles.resultadoLabel}>Respuesta correcta</Text>
        <View style={[styles.respuestaCorrectaOpcion, { backgroundColor: bg, borderColor: color }]}>
          <View style={[styles.opcionLetraBox, { backgroundColor: color }]}>
            <Text style={styles.opcionLetra}>{letra}</Text>
          </View>
          <Text style={[styles.opcionTexto, { color: '#1a1a1a' }]} numberOfLines={2}>{textoOpcion}</Text>
        </View>
      </View>

      <ScrollView style={styles.rankingList}>
        {resultado.jugadores.map((j: any, idx: number) => (
          <View key={j.id} style={styles.rankRow}>
            <Text style={styles.rankPos}>{idx + 1}</Text>
            <Text style={styles.rankNick}>{j.nickname}</Text>
            <Text style={styles.rankPuntos}>{j.puntos} pts</Text>
          </View>
        ))}
      </ScrollView>

      {esHost && (
        <Pressable
          style={[styles.btnPrimario, { margin: 20 }, avanzando && { opacity: 0.6 }]}
          onPress={handleSig}
          disabled={avanzando}
        >
          {avanzando
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={styles.btnTextoBlanco}>Siguiente pregunta</Text>
          }
        </Pressable>
      )}

      {!esHost && (
        <View style={styles.esperandoCard}>
          <ActivityIndicator size="small" color="#571D11" />
          <Text style={styles.esperandoHostText}>Esperando al host...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function PantallaPodio({ podio, onSalir }: { podio: any; onSalir: () => void }) {
  const top3 = podio.podio.slice(0, 3);
  const resto = podio.todos.slice(3);
  const MEDALS = ['🥇', '🥈', '🥉'];
  const HEIGHTS = [120, 90, 70];
  const COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#571D11' }]}>
      <Text style={styles.podioTitulo}>Podio final</Text>

      <View style={styles.podioStage}>
        {[1, 0, 2].map(pos => {
          const j = top3[pos];
          if (!j) return <View key={pos} style={{ flex: 1 }} />;
          return (
            <View key={pos} style={[styles.podioColumnaWrap, { flex: 1 }]}>
              <Text style={styles.podioMedal}>{MEDALS[pos]}</Text>
              <Text style={styles.podioNick} numberOfLines={1}>{j.nickname}</Text>
              <Text style={styles.podioPuntos}>{j.puntos} pts</Text>
              <View style={[styles.podioColumna, {
                height: HEIGHTS[pos], backgroundColor: COLORS[pos] + 'CC',
              }]}>
                <Text style={styles.podioPos}>{pos + 1}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {resto.length > 0 && (
        <ScrollView style={styles.restoPodio}>
          {resto.map((j: any, idx: number) => (
            <View key={j.id} style={styles.restoRow}>
              <Text style={styles.restoPos}>{idx + 4}</Text>
              <Text style={styles.restoNick}>{j.nickname}</Text>
              <Text style={styles.restoPuntos}>{j.puntos} pts</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable style={[styles.btnPrimario, { margin: 20, backgroundColor: '#fdfaf7' }]} onPress={onSalir}>
        <Text style={[styles.btnTextoBlanco, { color: '#571D11' }]}>Volver al inicio</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fdfaf7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: '#fdfaf7' },
  conectandoText: { color: '#571D11', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#c1623e', fontSize: 16, fontWeight: '700' },
  backBtn: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  btnPrimario: {
    height: 52, borderRadius: 16, backgroundColor: '#571D11',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 20,
  },
  btnRojo: {
    height: 48, borderRadius: 14, backgroundColor: '#c1623e',
    paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center',
  },
  btnTextoBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },

  // Join screen
  joinContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 20,
  },
  joinTitle: { fontSize: 22, fontWeight: '800', color: '#412E2E' },
  joinCode: {
    fontSize: 32, fontWeight: '900', letterSpacing: 8, color: '#571D11',
    backgroundColor: 'rgba(87,29,17,0.08)', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 16,
  },
  nicknameInput: {
    width: '100%', height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.2)',
    paddingHorizontal: 16, fontSize: 15, color: '#412E2E',
    backgroundColor: 'white',
  },

  // Lobby
  lobbyContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  lobbyTitulo: { fontSize: 20, fontWeight: '800', color: '#412E2E', textAlign: 'center', marginTop: 4 },
  codigoCard: {
    backgroundColor: '#571D11', borderRadius: 20,
    paddingVertical: 20, paddingHorizontal: 24, alignItems: 'center', gap: 6,
  },
  codigoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  codigoValor: { color: 'white', fontSize: 36, fontWeight: '900', letterSpacing: 10 },
  codigoHint: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  qrCard: {
    alignSelf: 'center', backgroundColor: '#fdfaf7',
    padding: 16, borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.1)', shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  jugadoresCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 8,
    shadowColor: 'rgba(0,0,0,0.06)', shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jugadoresTitle: { fontSize: 14, fontWeight: '700', color: '#412E2E', marginBottom: 4 },
  jugadorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  jugadorAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(87,29,17,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  jugadorNick: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  esperandoText: { color: 'rgba(65,46,46,0.45)', fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  esperandoCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  esperandoHostText: { color: '#844A31', fontSize: 13, fontWeight: '600' },

  // Pregunta
  preguntaHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  preguntaIdx: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  timerCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  timerText: { color: 'white', fontSize: 18, fontWeight: '800' },
  enunciadoCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 16,
    borderRadius: 16, padding: 20, gap: 8, marginBottom: 12,
  },
  enunciado: { color: 'white', fontSize: 17, fontWeight: '700', lineHeight: 24 },
  preguntaPuntos: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  opcionesGrid: {
    flex: 1, paddingHorizontal: 16, gap: 10, flexDirection: 'column',
  },
  opcionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14, borderWidth: 2, flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  opcionLetraBox: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  opcionLetra: { color: 'white', fontSize: 15, fontWeight: '800' },
  opcionTexto: { flex: 1, color: '#1a1a1a', fontSize: 14, fontWeight: '600', lineHeight: 18 },
  progresoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  progresoText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  btnRevelarSmall: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  btnRevelarText: { color: 'white', fontSize: 12, fontWeight: '700' },

  // Resultado
  resultadoHeader: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 20,
    paddingHorizontal: 20, gap: 12,
  },
  resultadoLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(65,46,46,0.6)' },
  respuestaCorrectaOpcion: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14, borderWidth: 2,
    width: '100%',
  },
  rankingList: { flex: 1, paddingHorizontal: 20 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(65,46,46,0.08)', gap: 12,
  },
  rankPos: { width: 28, fontSize: 16, fontWeight: '800', color: '#571D11', textAlign: 'center' },
  rankNick: { flex: 1, fontSize: 14, fontWeight: '600', color: '#412E2E' },
  rankPuntos: { fontSize: 14, fontWeight: '700', color: '#24833D' },

  // Podio
  podioTitulo: {
    color: 'white', fontSize: 24, fontWeight: '900',
    textAlign: 'center', paddingTop: 24, paddingBottom: 8,
  },
  podioStage: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 16, height: 200,
  },
  podioColumnaWrap: { alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  podioMedal: { fontSize: 24 },
  podioNick: { color: 'white', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  podioPuntos: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },
  podioColumna: {
    width: '80%', borderTopLeftRadius: 8, borderTopRightRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  podioPos: { color: 'white', fontSize: 20, fontWeight: '900' },
  restoPodio: { flex: 1, paddingHorizontal: 20 },
  restoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', gap: 12,
  },
  restoPos: { width: 28, color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  restoNick: { flex: 1, color: 'white', fontSize: 14, fontWeight: '600' },
  restoPuntos: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
});
