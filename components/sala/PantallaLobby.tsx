import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

interface Props {
  codigo: string;
  quizTitulo: string;
  jugadores: any[];
  esHost: boolean;
  onIniciar: () => void;
  conectado: boolean;
}

export default function PantallaLobby({ codigo, quizTitulo, jugadores, esHost, onIniciar, conectado }: Props) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fdfaf7' },
  backBtn: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
  },
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
  btnPrimario: {
    height: 52, borderRadius: 16, backgroundColor: '#571D11',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 20,
  },
  btnTextoBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },
});
