import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Modal, Alert, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getPlantillas, clonarPlantilla } from '@/core/quizzes/actions/crear-quiz';
import { getMisColecciones, crearColeccion, añadirQuizAColeccion, ColeccionDTO } from '@/core/colecciones/actions/colecciones';
import { QuizDetalle } from '@/core/auth/interface/quiz';

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: '#24833D', normal: '#844A31', dificil: '#c1623e', extremo: '#571D11',
};

const CATEGORIA_ICON: Record<string, string> = {
  'Programación': 'code-slash-outline',
  'Bases de Datos': 'server-outline',
  'Matemáticas': 'calculator-outline',
  'Historia': 'globe-outline',
  'Lengua': 'book-outline',
  'Biología': 'leaf-outline',
};

export default function PlantillasScreen() {
  const [plantillas, setPlantillas] = useState<QuizDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState<QuizDetalle | null>(null);
  const [modalAccion, setModalAccion] = useState(false);
  const [modalColeccion, setModalColeccion] = useState(false);
  const [colecciones, setColecciones] = useState<ColeccionDTO[]>([]);
  const [nuevaCol, setNuevaCol] = useState('');
  const [clonando, setClonando] = useState(false);
  const [creandoCol, setCreandoCol] = useState(false);
  const [quizClonado, setQuizClonado] = useState<{ id: number } | null>(null);

  useEffect(() => {
    Promise.all([
      getPlantillas().catch(() => []),
      getMisColecciones().catch(() => []),
    ]).then(([p, c]) => {
      setPlantillas(p);
      setColecciones(c);
      setCargando(false);
    });
  }, []);

  const handleSeleccionar = (plantilla: QuizDetalle) => {
    setSeleccionada(plantilla);
    setModalAccion(true);
  };

  const handleSoloUsar = () => {
    setModalAccion(false);
    Alert.alert('Próximamente', 'La funcionalidad de jugar quizzes estará disponible muy pronto.');
  };

  const handleGuardarBiblioteca = async () => {
    if (!seleccionada) return;
    setClonando(true);
    try {
      const resultado = await clonarPlantilla(seleccionada.id);
      setModalAccion(false);
      router.push(`/crear-quiz/editar?id=${resultado.quiz.id}&nuevo=true` as any);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el quiz en la biblioteca.');
    } finally {
      setClonando(false);
    }
  };

  const handleAñadirColeccion = async (colId: number) => {
    if (!quizClonado) return;
    try {
      await añadirQuizAColeccion(colId, quizClonado.id);
      setModalColeccion(false);
      router.replace('/(stack)/(tabs)/biblioteca' as any);
      Alert.alert('¡Listo!', 'Quiz guardado en tu biblioteca y colección.');
    } catch {
      Alert.alert('Error', 'No se pudo añadir a la colección.');
    }
  };

  const handleCrearYAñadir = async () => {
    if (!nuevaCol.trim() || !quizClonado) return;
    setCreandoCol(true);
    try {
      const col = await crearColeccion(nuevaCol.trim());
      await añadirQuizAColeccion(col.id, quizClonado.id);
      setNuevaCol('');
      setModalColeccion(false);
      router.replace('/(stack)/(tabs)/biblioteca' as any);
      Alert.alert('¡Listo!', `Quiz guardado en "${col.nombre}".`);
    } catch {
      Alert.alert('Error', 'No se pudo crear la colección.');
    } finally {
      setCreandoCol(false);
    }
  };

  const handleOmitirColeccion = () => {
    setModalColeccion(false);
    router.replace('/(stack)/(tabs)/biblioteca' as any);
    Alert.alert('¡Listo!', 'Quiz guardado en tu biblioteca.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <Text style={styles.topTitle}>Quizzes prediseñados</Text>
        <View style={{ width: 38 }} />
      </View>

      <Text style={styles.subtitle}>Elige un quiz listo para usar o guárdalo en tu biblioteca</Text>

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#844A31" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {plantillas.map(p => (
            <Pressable key={p.id} style={styles.card} onPress={() => handleSeleccionar(p)}>
              <Image source={require('@/assets/imagen-quizz-foto.png')} style={styles.cardIcon} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{p.titulo}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.metaTag, { color: DIFICULTAD_COLOR[p.dificultad] ?? '#844A31' }]}>
                    {p.dificultad}
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.metaTag}>{p.categoria?.nombre ?? 'General'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(65,46,46,0.35)" />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Modal: Usar o Guardar */}
      <Modal visible={modalAccion} transparent animationType="slide" onRequestClose={() => setModalAccion(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalAccion(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            {seleccionada && (
              <Text style={styles.sheetTitle} numberOfLines={2}>{seleccionada.titulo}</Text>
            )}
            <Text style={styles.sheetSub}>¿Qué quieres hacer con este quiz?</Text>

            <Pressable style={styles.sheetOption} onPress={handleGuardarBiblioteca} disabled={clonando}>
              <View style={[styles.optIcon, { backgroundColor: '#f0e8e3' }]}>
                {clonando
                  ? <ActivityIndicator size="small" color="#571D11" />
                  : <Ionicons name="create-outline" size={22} color="#571D11" />
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>Editar quiz</Text>
                <Text style={styles.optSub}>Guarda una copia y edítala a tu gusto</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.3)" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.sheetOption} onPress={handleSoloUsar}>
              <View style={[styles.optIcon, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="play-circle-outline" size={22} color="#24833D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>Usar ahora</Text>
                <Text style={styles.optSub}>Jugar directamente sin guardarlo</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.3)" />
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => setModalAccion(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: Añadir a colección */}
      <Modal visible={modalColeccion} transparent animationType="slide" onRequestClose={() => setModalColeccion(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalColeccion(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>¿Añadir a una colección?</Text>
            <Text style={styles.sheetSub}>El quiz ya está en tu biblioteca</Text>

            <View style={styles.newColRow}>
              <TextInput
                style={styles.newColInput}
                placeholder="Nueva colección..."
                placeholderTextColor="#9ca3af"
                value={nuevaCol}
                onChangeText={setNuevaCol}
              />
              <Pressable
                style={[styles.newColBtn, !nuevaCol.trim() && { opacity: 0.4 }]}
                onPress={handleCrearYAñadir}
                disabled={!nuevaCol.trim() || creandoCol}
              >
                {creandoCol
                  ? <ActivityIndicator size="small" color="white" />
                  : <Ionicons name="add" size={20} color="white" />
                }
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {colecciones.length === 0 ? (
                <Text style={styles.emptyCol}>No tienes colecciones todavía</Text>
              ) : (
                colecciones.map(col => (
                  <Pressable key={col.id} style={styles.sheetOption} onPress={() => handleAñadirColeccion(col.id)}>
                    <View style={[styles.optIcon, { backgroundColor: '#e8f0e3' }]}>
                      <Ionicons name="folder-outline" size={20} color="#24833D" />
                    </View>
                    <Text style={[styles.optTitle, { flex: 1 }]}>{col.nombre}</Text>
                    <Text style={{ color: '#844A31', fontSize: 13 }}>{col.cantidad}</Text>
                    <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.3)" />
                  </Pressable>
                ))
              )}
            </ScrollView>

            <Pressable style={styles.cancelBtn} onPress={handleOmitirColeccion}>
              <Text style={styles.cancelText}>Omitir por ahora</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  subtitle: {
    fontSize: 13, color: '#844A31', opacity: 0.8, textAlign: 'center',
    paddingHorizontal: 24, marginBottom: 16,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(217,217,217,1)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTag: { fontSize: 12, fontWeight: '500', color: '#555' },
  dot: { fontSize: 12, color: '#555' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 32, paddingTop: 12, paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(65,46,46,0.2)', alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#412E2E', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: '#844A31', opacity: 0.7, marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
  },
  optIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  optTitle: { fontSize: 15, fontWeight: '600', color: '#412E2E' },
  optSub: { fontSize: 12, color: '#844A31', opacity: 0.7, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(65,46,46,0.08)' },
  cancelBtn: {
    marginTop: 12, height: 46, borderRadius: 12,
    backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  newColRow: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  newColInput: {
    flex: 1, height: 42, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.2)',
    paddingHorizontal: 12, fontSize: 14, color: '#412E2E',
  },
  newColBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: '#571D11', alignItems: 'center', justifyContent: 'center',
  },
  emptyCol: {
    textAlign: 'center', color: '#844A31', fontSize: 13,
    opacity: 0.7, paddingVertical: 16,
  },
});
