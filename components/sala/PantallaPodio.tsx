import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  podio: any;
  onSalir: () => void;
}

export default function PantallaPodio({ podio, onSalir }: Props) {
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
  btnPrimario: {
    height: 52, borderRadius: 16, backgroundColor: '#571D11',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 20,
  },
  btnTextoBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },
});
