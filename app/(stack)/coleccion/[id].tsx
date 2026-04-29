import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image,
} from 'react-native';
import AppAlert from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getQuizzesDeColeccion, quitarQuizDeColeccion, getApuntesDeColeccion, quitarApunteDeColeccion } from '@/core/colecciones/actions/colecciones';
import QuizOpcionesModal from '@/components/QuizOpcionesModal';

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: '#24833D', normal: '#844A31', dificil: '#c1623e', extremo: '#571D11',
};

export default function ColeccionDetalleScreen() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
  const coleccionId = Number(id);

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [apuntes, setApuntes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [quizOpciones, setQuizOpciones] = useState<any | null>(null);
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje?: string; botones?: any[] }>({ visible: false, titulo: '' });
  const cerrar = () => setAlerta(p => ({ ...p, visible: false }));

  useEffect(() => {
    Promise.all([
      getQuizzesDeColeccion(coleccionId).catch(() => []),
      getApuntesDeColeccion(coleccionId).catch(() => []),
    ]).then(([q, a]) => {
      setQuizzes(q);
      setApuntes(a);
    }).finally(() => setCargando(false));
  }, [coleccionId]);

  const handleQuitarQuiz = (quiz: any) => {
    setAlerta({
      visible: true,
      titulo: 'Quitar de colección',
      mensaje: `¿Quitar "${quiz.titulo}" de esta colección?`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrar },
        { texto: 'Quitar', estilo: 'destructivo', onPress: async () => {
          cerrar();
          try {
            await quitarQuizDeColeccion(coleccionId, quiz.id);
            setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
          } catch {
            setAlerta({ visible: true, titulo: 'Error', mensaje: 'No se pudo quitar el quiz.' });
          }
        }},
      ],
    });
  };

  const handleQuitarApunte = (apunte: any) => {
    setAlerta({
      visible: true,
      titulo: 'Quitar de colección',
      mensaje: `¿Quitar "${apunte.titulo}" de esta colección?`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrar },
        { texto: 'Quitar', estilo: 'destructivo', onPress: async () => {
          cerrar();
          try {
            await quitarApunteDeColeccion(coleccionId, apunte.id);
            setApuntes(prev => prev.filter(a => a.id !== apunte.id));
          } catch {
            setAlerta({ visible: true, titulo: 'Error', mensaje: 'No se pudo quitar el apunte.' });
          }
        }},
      ],
    });
  };

  const total = quizzes.length + apuntes.length;

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
      ) : total === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={56} color="rgba(65,46,46,0.2)" />
          <Text style={styles.emptyTitle}>Esta colección está vacía</Text>
          <Text style={styles.emptySub}>Añade quizzes y apuntes desde tu biblioteca</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {quizzes.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="help-circle-outline" size={15} color="#844A31" />
                <Text style={styles.sectionLabel}>Quizzes ({quizzes.length})</Text>
              </View>
              {quizzes.map(quiz => (
                <Pressable key={`quiz-${quiz.id}`} style={styles.card} onPress={() => setQuizOpciones(quiz)}>
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
                  <Pressable style={styles.removeBtn} onPress={(e) => { e.stopPropagation(); handleQuitarQuiz(quiz); }} hitSlop={8}>
                    <Ionicons name="remove-circle-outline" size={22} color="#c0392b" />
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}

          {apuntes.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={15} color="#24833D" />
                <Text style={[styles.sectionLabel, { color: '#24833D' }]}>Apuntes ({apuntes.length})</Text>
              </View>
              {apuntes.map(apunte => (
                <Pressable
                  key={`apunte-${apunte.id}`}
                  style={styles.card}
                  onPress={() => router.push(`/crear-apunte/editar?id=${apunte.id}` as any)}
                >
                  <View style={[styles.cardThumb, { backgroundColor: 'rgba(83,181,94,0.15)', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="document-text-outline" size={28} color="#24833D" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{apunte.titulo}</Text>
                    <View style={styles.cardMeta}>
                      <Ionicons name="sparkles-outline" size={11} color="#53b55e" />
                      <Text style={[styles.metaTag, { color: '#24833D' }]}>Apuntes IA</Text>
                    </View>
                  </View>
                  <Pressable style={styles.removeBtn} onPress={() => handleQuitarApunte(apunte)} hitSlop={8}>
                    <Ionicons name="remove-circle-outline" size={22} color="#c0392b" />
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}
        </ScrollView>
      )}

      <QuizOpcionesModal
        visible={quizOpciones !== null}
        quizId={quizOpciones?.id ?? null}
        quizTitulo={quizOpciones?.titulo}
        esCreador
        onClose={() => setQuizOpciones(null)}
      />
      <AppAlert
        visible={alerta.visible}
        variante="peligro"
        titulo={alerta.titulo}
        mensaje={alerta.mensaje}
        botones={alerta.botones}
        onClose={cerrar}
      />
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
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(65,46,46,0.05)',
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#844A31', textTransform: 'uppercase', letterSpacing: 0.5,
  },
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
