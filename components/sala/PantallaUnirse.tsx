import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  nickname: string;
  onNickname: (v: string) => void;
  onUnirse: () => void;
  cargando: boolean;
  codigo: string;
}

export default function PantallaUnirse({ nickname, onNickname, onUnirse, cargando, codigo }: Props) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fdfaf7' },
  backBtn: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center',
  },
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
  btnPrimario: {
    height: 52, borderRadius: 16, backgroundColor: '#571D11',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 20,
    width: '100%',
  },
  btnTextoBlanco: { color: 'white', fontSize: 15, fontWeight: '700' },
});
