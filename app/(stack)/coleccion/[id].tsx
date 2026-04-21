import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getQuizzesDeColeccion, quitarQuizDeColeccion } from '@/core/colecciones/actions/colecciones';

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: '#24833D', normal: '#844A31', dificil: '#c1623e', extremo: '#571D11',
};

export default function ColeccionDetalleScreen() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
  const coleccionId = Number(id);

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getQuizzesDeColeccion(coleccionId)
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setCargando(false));
  }, [coleccionId]);

  const handleQuitar = (quiz: any) => {
    Alert.alert(
      'Quitar de colección',
      `¿Quitar "${quiz.titulo}" de esta colección?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar', style: 'destructive',
          onPress: async () => {
            try {
              await quitarQuizDeColeccion(coleccionId, quiz.id);
              setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
            } catch {
              Alert.alert('Error', 'No se pudo quitar el quiz.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{nombre ?? 'Colección'}</Text>
        <View style={{ width: 38 }} />
      </View>

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#844A31" />
      ) : quizzes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={56} color="rgba(65,46,46,0.2)" />
          <Text style={styles.emptyTitle}>Esta colección está vacía</Text>
          <Text style={styles.emptySub}>Añade quizzes desde tu biblioteca</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {quizzes.map(quiz => (
            <View key={quiz.id} style={styles.card}>
              <Image source={require('@/assets/imagen-quizz-foto.png')} style={styles.cardThumb} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>{quiz.titulo}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.metaTag, { color: DIFICULTAD_COLOR[quiz.dificultad] ?? '#844A31' }]}>
                    {quiz.dificultad}
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.metaTag}>{quiz.categoria?.nombre ?? 'Sin categoría'}</Text>
                </View>
              </View>
              <Pressable style={styles.removeBtn} onPress={() => handleQuitar(quiz)} hitSlop={8}>
                <Ionicons name="remove-circle-outline" size={22} color="#c0392b" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7b59f' },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, gap: 8,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#412E2E', textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#412E2E' },
  emptySub: { fontSize: 13, color: '#844A31', opacity: 0.8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(65,46,46,0.08)',
    backgroundColor: 'rgba(217,217,217,1)',
  },
  cardThumb: {
    width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { color: '#1a1a1a', fontSize: 15, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTag: { color: '#555', fontSize: 12, fontWeight: '500' },
  dot: { color: '#555', fontSize: 12 },
  removeBtn: { padding: 4 },
});
