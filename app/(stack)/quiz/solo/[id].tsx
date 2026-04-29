import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { PreguntaDetalle } from '@/core/auth/interface/quiz';
import { getQuizPreguntas } from '@/core/quizzes/actions/get-quizzes';
import { guardarCalificacionSolo } from '@/core/salas/actions/sala';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

const OPCIONES = ['A', 'B', 'C', 'D'] as const;
const OPCION_COLORS = ['#c0392b', '#27ae60', '#d35400', '#2980b9'];
const OPCION_BG = ['#fadbd8', '#d5f5e3', '#fdebd0', '#d6eaf8'];

export default function SoloQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quizId = Number(id);
  const { user } = useAuthStore();

  const [preguntas, setPreguntas] = useState<PreguntaDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idx, setIdx] = useState(0);
  const [segundos, setSegundos] = useState(30);
  const [respuestaElegida, setRespuestaElegida] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [acertadas, setAcertadas] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getQuizPreguntas(quizId)
      .then(p => setPreguntas(p))
      .catch(() => router.back())
      .finally(() => setCargando(false));
  }, [quizId]);

  useEffect(() => {
    if (cargando || terminado || preguntas.length === 0) return;
    setSegundos(preguntas[idx]?.segundos ?? 30);
    setRespuestaElegida(null);
    setMostrarResultado(false);
    timerRef.current = setInterval(() => {
      setSegundos(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setMostrarResultado(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [idx, cargando, terminado, preguntas.length]);

  const handleResponder = (opcion: string) => {
    if (respuestaElegida || mostrarResultado) return;
    clearInterval(timerRef.current!);
    setRespuestaElegida(opcion);
    setMostrarResultado(true);
    const pregunta = preguntas[idx];
    if (opcion === pregunta.respuestaCorrecta) {
      const pts = Math.round((pregunta.peso ?? 1) * 100);
      setPuntos(p => p + pts);
      setAcertadas(a => a + 1);
    }
  };

  const handleSiguiente = () => {
    if (idx + 1 >= preguntas.length) {
      finalizarPartida();
    } else {
      setIdx(i => i + 1);
    }
  };

  const finalizarPartida = async () => {
    setTerminado(true);
    if (!user) return;
    const maxPuntos = preguntas.reduce((s, p) => s + Math.round((p.peso ?? 1) * 100), 0);
    setGuardando(true);
    try {
      await guardarCalificacionSolo(quizId, puntos, maxPuntos);
    } catch { /* ignorar */ }
    setGuardando(false);
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#571D11" />
      </View>
    );
  }

  if (preguntas.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#c1623e" />
        <Text style={styles.errorText}>Este quiz no tiene preguntas</Text>
        <Pressable style={styles.btnPrimario} onPress={() => router.back()}>
          <Text style={styles.btnBlanco}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  if (terminado) {
    return <PantallaFinal
      preguntas={preguntas}
      puntos={puntos}
      acertadas={acertadas}
      guardando={guardando}
      onSalir={() => router.back()}
    />;
  }

  const pregunta = preguntas[idx];
  const opciones = [pregunta.opcionA, pregunta.opcionB, pregunta.opcionC, pregunta.opcionD];
  const correctaIdx = OPCIONES.indexOf(pregunta.respuestaCorrecta as any);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#571D11' }]}>
      <View style={styles.preguntaHeader}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <Text style={styles.preguntaIdx}>{idx + 1} / {preguntas.length}</Text>
        <View style={styles.timerCircle}>
          <Text style={[styles.timerText, segundos <= 5 && { color: '#ff6b6b' }]}>{segundos}</Text>
        </View>
      </View>

      <View style={styles.enunciadoCard}>
        <Text style={styles.enunciado}>{pregunta.enunciado}</Text>
        <Text style={styles.preguntaPuntos}>+{Math.round((pregunta.peso ?? 1) * 100)} pts</Text>
      </View>

      <View style={styles.opcionesGrid}>
        {OPCIONES.map((letra, i) => {
          const esElegida = respuestaElegida === letra;
          const esCorrecta = mostrarResultado && i === correctaIdx;
          const esIncorrecta = mostrarResultado && esElegida && letra !== pregunta.respuestaCorrecta;

          return (
            <Pressable
              key={letra}
              style={[
                styles.opcionBtn,
                { backgroundColor: OPCION_BG[i], borderColor: OPCION_COLORS[i] },
                esCorrecta && { backgroundColor: '#27ae60', borderColor: '#27ae60' },
                esIncorrecta && { backgroundColor: '#c0392b', borderColor: '#c0392b' },
                esElegida && !mostrarResultado && { backgroundColor: OPCION_COLORS[i], borderColor: OPCION_COLORS[i] },
                mostrarResultado && !esCorrecta && !esElegida && { opacity: 0.4 },
              ]}
              onPress={() => handleResponder(letra)}
              disabled={respuestaElegida !== null || mostrarResultado}
            >
              <View style={[styles.opcionLetraBox, { backgroundColor: OPCION_COLORS[i] }]}>
                {esCorrecta ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : esIncorrecta ? (
                  <Ionicons name="close" size={16} color="white" />
                ) : (
                  <Text style={styles.opcionLetra}>{letra}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.opcionTexto,
                  (esCorrecta || esIncorrecta || (esElegida && !mostrarResultado)) && { color: 'white' },
                ]}
                numberOfLines={3}
              >
                {opciones[i]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mostrarResultado && (
        <Pressable style={[styles.btnSiguiente]} onPress={handleSiguiente}>
          <Text style={styles.btnBlanco}>
            {idx + 1 >= preguntas.length ? 'Ver resultados' : 'Siguiente pregunta'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function PantallaFinal({ preguntas, puntos, acertadas, guardando, onSalir }: {
  preguntas: PreguntaDetalle[];
  puntos: number;
  acertadas: number;
  guardando: boolean;
  onSalir: () => void;
}) {
  const maxPuntos = preguntas.reduce((s, p) => s + Math.round((p.peso ?? 1) * 100), 0);
  const nota = maxPuntos > 0 ? Math.min(10, (puntos / maxPuntos) * 10) : 0;
  const porcentaje = maxPuntos > 0 ? Math.round((puntos / maxPuntos) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#fdfaf7' }]}>
      <ScrollView contentContainerStyle={styles.finalContent}>
        <View style={styles.notaCirculo}>
          <Text style={styles.notaNumero}>{nota.toFixed(1)}</Text>
          <Text style={styles.notaLabel}>/ 10</Text>
        </View>

        <Text style={styles.finalTitulo}>
          {nota >= 9 ? '¡Excelente!' : nota >= 7 ? '¡Muy bien!' : nota >= 5 ? 'Aprobado' : 'Sigue practicando'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{acertadas}</Text>
            <Text style={styles.statLabel}>Correctas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{preguntas.length - acertadas}</Text>
            <Text style={styles.statLabel}>Incorrectas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{porcentaje}%</Text>
            <Text style={styles.statLabel}>Acierto</Text>
          </View>
        </View>

        <View style={styles.totalPuntosBox}>
          <Text style={styles.totalPuntosLabel}>Puntuación total</Text>
          <Text style={styles.totalPuntosVal}>{puntos} / {maxPuntos} pts</Text>
        </View>

        {guardando && (
          <View style={styles.guardandoRow}>
            <ActivityIndicator size="small" color="#571D11" />
            <Text style={styles.guardandoText}>Guardando calificación...</Text>
          </View>
        )}

        <Pressable
          style={[styles.btnPrimario, { marginTop: 16 }, guardando && { opacity: 0.6 }]}
          onPress={onSalir}
          disabled={guardando}
        >
          <Text style={styles.btnBlanco}>Volver</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: '#fdfaf7' },
  errorText: { color: '#c1623e', fontSize: 15, fontWeight: '600' },

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
    flex: 1, paddingHorizontal: 16, gap: 10,
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
  btnSiguiente: {
    margin: 16, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  btnPrimario: {
    height: 52, borderRadius: 16, backgroundColor: '#571D11',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 20,
  },
  btnBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },

  // Final
  finalContent: { alignItems: 'center', paddingTop: 40, paddingBottom: 40, gap: 20, paddingHorizontal: 20 },
  notaCirculo: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#571D11', justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(87,29,17,0.3)', shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  notaNumero: { color: 'white', fontSize: 40, fontWeight: '900' },
  notaLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  finalTitulo: { fontSize: 22, fontWeight: '800', color: '#412E2E', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row', gap: 12, width: '100%',
  },
  statBox: {
    flex: 1, backgroundColor: 'white', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', gap: 4,
    shadowColor: 'rgba(0,0,0,0.06)', shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNum: { fontSize: 24, fontWeight: '900', color: '#571D11' },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(65,46,46,0.6)' },
  totalPuntosBox: {
    width: '100%', backgroundColor: 'rgba(87,29,17,0.06)',
    borderRadius: 14, padding: 16, alignItems: 'center', gap: 4,
  },
  totalPuntosLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(65,46,46,0.6)' },
  totalPuntosVal: { fontSize: 18, fontWeight: '800', color: '#571D11' },
  guardandoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guardandoText: { color: '#844A31', fontSize: 13, fontWeight: '600' },
});
