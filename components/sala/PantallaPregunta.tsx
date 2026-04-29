import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPCIONES = ['A', 'B', 'C', 'D'] as const;
const OPCION_COLORS = ['#c0392b', '#27ae60', '#d35400', '#2980b9'];
const OPCION_BG = ['#fadbd8', '#d5f5e3', '#fdebd0', '#d6eaf8'];

interface Props {
  pregunta: any;
  respuestaElegida: string | null;
  onResponder: (o: string) => void;
  respondidos: number;
  total: number;
  esHost: boolean;
  onRevelar: () => void;
}

export default function PantallaPregunta({ pregunta, respuestaElegida, onResponder, respondidos, total, esHost, onRevelar }: Props) {
  const [segundos, setSegundos] = useState(pregunta.segundos ?? 30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reveladoRef = useRef(false);

  useEffect(() => {
    reveladoRef.current = false;
    setSegundos(pregunta.segundos ?? 30);
    timerRef.current = setInterval(() => {
      setSegundos((s: number) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [pregunta.idx]);

  useEffect(() => {
    if (segundos === 0 && esHost && !reveladoRef.current) {
      reveladoRef.current = true;
      onRevelar();
    }
  }, [segundos]);

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fdfaf7' },
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
});
