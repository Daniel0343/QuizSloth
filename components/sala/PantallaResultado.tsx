import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPCION_COLORS = ['#c0392b', '#27ae60', '#d35400', '#2980b9'];
const OPCION_BG = ['#fadbd8', '#d5f5e3', '#fdebd0', '#d6eaf8'];

const LETRA_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

interface Props {
  resultado: any;
  pregunta: any;
  esHost: boolean;
  onSiguiente: () => void;
}

export default function PantallaResultado({ resultado, pregunta, esHost, onSiguiente }: Props) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fdfaf7' },
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
  opcionLetraBox: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  opcionLetra: { color: 'white', fontSize: 15, fontWeight: '800' },
  opcionTexto: { flex: 1, color: '#1a1a1a', fontSize: 14, fontWeight: '600', lineHeight: 18 },
  rankingList: { flex: 1, paddingHorizontal: 20 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(65,46,46,0.08)', gap: 12,
  },
  rankPos: { width: 28, fontSize: 16, fontWeight: '800', color: '#571D11', textAlign: 'center' },
  rankNick: { flex: 1, fontSize: 14, fontWeight: '600', color: '#412E2E' },
  rankPuntos: { fontSize: 14, fontWeight: '700', color: '#24833D' },
  btnPrimario: {
    height: 52, borderRadius: 16, backgroundColor: '#571D11',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 20,
  },
  btnTextoBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },
  esperandoCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  esperandoHostText: { color: '#844A31', fontSize: 13, fontWeight: '600' },
});
