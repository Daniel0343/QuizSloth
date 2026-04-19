import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  obtenerPreguntas, actualizarPregunta, actualizarQuiz,
  crearPregunta, eliminarPreguntaApi,
} from '@/core/quizzes/actions/crear-quiz';
import { quizslothApi } from '@/core/auth/api/quizslothApi';
import { PreguntaDetalle, QuizDetalle } from '@/core/auth/interface/quiz';

const DIFICULTADES = ['facil', 'normal', 'dificil', 'extremo'] as const;
const OPCIONES: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

export default function EditarQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quizId = Number(id);

  const [quiz, setQuiz] = useState<QuizDetalle | null>(null);
  const [preguntas, setPreguntas] = useState<PreguntaDetalle[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [expandida, setExpandida] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const [q, ps] = await Promise.all([
        quizslothApi.get<QuizDetalle>(`/quizzes/${quizId}`).then(r => r.data).catch(() => null),
        obtenerPreguntas(quizId),
      ]);
      if (q) setQuiz(q);
      setPreguntas(ps);
      setCargando(false);
    };
    cargar();
  }, [quizId]);

  const updatePregunta = (idx: number, campos: Partial<PreguntaDetalle>) => {
    setPreguntas(prev => prev.map((p, i) => i === idx ? { ...p, ...campos } : p));
  };

  const moverPregunta = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= preguntas.length) return;
    setPreguntas(prev => {
      const arr = [...prev];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr.map((p, i) => ({ ...p, orden: i }));
    });
  };

  const handleAñadir = async () => {
    try {
      const nueva = await crearPregunta(quizId, preguntas.length);
      setPreguntas(prev => [...prev, nueva]);
      setExpandida(preguntas.length);
    } catch {
      Alert.alert('Error', 'No se pudo añadir la pregunta.');
    }
  };

  const handleEliminarPregunta = (pregunta: PreguntaDetalle, idx: number) => {
    Alert.alert(
      'Eliminar pregunta',
      '¿Seguro que quieres eliminar esta pregunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await eliminarPreguntaApi(pregunta.id);
              setPreguntas(prev => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, orden: i })));
              if (expandida === idx) setExpandida(null);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la pregunta.');
            }
          },
        },
      ]
    );
  };

  const handleGuardar = async () => {
    if (!quiz) return;
    setGuardando(true);

    try {
      await actualizarQuiz(quizId, {
        titulo: quiz.titulo,
        dificultad: quiz.dificultad,
        categoriaId: quiz.categoria?.id,
      });

      await Promise.all(
        preguntas.map(p => actualizarPregunta(p.id, {
          enunciado: p.enunciado,
          opcionA: p.opcionA,
          opcionB: p.opcionB,
          opcionC: p.opcionC,
          opcionD: p.opcionD,
          respuestaCorrecta: p.respuestaCorrecta,
          dificultad: p.dificultad,
          orden: p.orden,
          peso: p.peso,
        }))
      );

      setGuardando(false);
      Alert.alert('¡Listo!', 'Quiz guardado correctamente.', [
        { text: 'OK', onPress: () => router.replace('/(stack)/(tabs)/home') },
      ]);
    } catch (e: any) {
      setGuardando(false);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message ?? e?.message ?? 'Error desconocido';
      Alert.alert(`Error ${status ?? ''}`.trim(), msg);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#53b55e" />
          <Text style={styles.loadingText}>Cargando preguntas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <Text style={styles.topTitle}>Editar Quiz</Text>
        <Pressable style={styles.saveBtn} onPress={handleGuardar} disabled={guardando}>
          {guardando
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={styles.saveBtnText}>Guardar</Text>
          }
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {quiz && (
          <View style={styles.quizCard}>
            <Text style={styles.cardSectionLabel}>Título</Text>
            <TextInput
              style={styles.inputTitulo}
              value={quiz.titulo}
              onChangeText={v => setQuiz(q => q ? { ...q, titulo: v } : q)}
              placeholder="Título del quiz"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.cardSectionLabel}>Dificultad general</Text>
            <View style={styles.chips}>
              {DIFICULTADES.map(d => (
                <Pressable
                  key={d}
                  style={[styles.chip, quiz.dificultad === d && styles.chipActive]}
                  onPress={() => setQuiz(q => q ? { ...q, dificultad: d } : q)}
                >
                  <Text style={[styles.chipText, quiz.dificultad === d && styles.chipTextActive]}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>{preguntas.length} preguntas generadas</Text>

        {preguntas.map((pregunta, idx) => (
          <PreguntaCard
            key={pregunta.id}
            pregunta={pregunta}
            idx={idx}
            total={preguntas.length}
            expandida={expandida === idx}
            onToggle={() => setExpandida(expandida === idx ? null : idx)}
            onChange={campos => updatePregunta(idx, campos)}
            onSubir={() => moverPregunta(idx, -1)}
            onBajar={() => moverPregunta(idx, 1)}
            onEliminar={() => handleEliminarPregunta(pregunta, idx)}
          />
        ))}

        <Pressable style={styles.addBtn} onPress={handleAñadir}>
          <Ionicons name="add-circle-outline" size={20} color="#844A31" />
          <Text style={styles.addBtnText}>Añadir pregunta manualmente</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreguntaCard({
  pregunta, idx, total, expandida, onToggle, onChange, onSubir, onBajar, onEliminar,
}: {
  pregunta: PreguntaDetalle;
  idx: number;
  total: number;
  expandida: boolean;
  onToggle: () => void;
  onChange: (campos: Partial<PreguntaDetalle>) => void;
  onSubir: () => void;
  onBajar: () => void;
  onEliminar: () => void;
}) {
  const opcionKey = { A: 'opcionA', B: 'opcionB', C: 'opcionC', D: 'opcionD' } as const;

  return (
    <View style={styles.preguntaCard}>
      <Pressable style={styles.preguntaHeader} onPress={onToggle}>
        <View style={styles.preguntaHeaderLeft}>
          <View style={styles.numBadge}>
            <Text style={styles.numBadgeText}>{idx + 1}</Text>
          </View>
          <Text style={styles.preguntaResumen} numberOfLines={expandida ? undefined : 1}>
            {pregunta.enunciado}
          </Text>
        </View>
        <View style={styles.preguntaHeaderRight}>
          <View style={styles.ordenBtns}>
            <Pressable onPress={onSubir} disabled={idx === 0} style={styles.ordenBtn}>
              <Ionicons name="chevron-up" size={14} color={idx === 0 ? '#d1d5db' : '#844A31'} />
            </Pressable>
            <Pressable onPress={onBajar} disabled={idx === total - 1} style={styles.ordenBtn}>
              <Ionicons name="chevron-down" size={14} color={idx === total - 1 ? '#d1d5db' : '#844A31'} />
            </Pressable>
          </View>
          <Pressable onPress={onEliminar} style={styles.deleteBtn} hitSlop={6}>
            <Ionicons name="trash-outline" size={16} color="#e53935" />
          </Pressable>
          <Ionicons name={expandida ? 'chevron-up' : 'chevron-down'} size={18} color="#9ca3af" />
        </View>
      </Pressable>

      {expandida && (
        <View style={styles.preguntaBody}>
          <Text style={styles.fieldLabel}>Enunciado</Text>
          <TextInput
            style={styles.fieldInput}
            value={pregunta.enunciado}
            onChangeText={v => onChange({ enunciado: v })}
            multiline
            textAlignVertical="top"
          />

          {OPCIONES.map(letra => (
            <View key={letra}>
              <Text style={styles.fieldLabel}>Opción {letra}</Text>
              <View style={styles.opcionRow}>
                <Pressable
                  style={[
                    styles.correctaBtn,
                    pregunta.respuestaCorrecta === letra && styles.correctaBtnActive,
                  ]}
                  onPress={() => onChange({ respuestaCorrecta: letra })}
                >
                  <Ionicons
                    name={pregunta.respuestaCorrecta === letra ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={pregunta.respuestaCorrecta === letra ? '#53b55e' : '#d1d5db'}
                  />
                </Pressable>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  value={pregunta[opcionKey[letra]]}
                  onChangeText={v => onChange({ [opcionKey[letra]]: v } as Partial<PreguntaDetalle>)}
                />
              </View>
            </View>
          ))}

          <View style={styles.preguntaFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Dificultad</Text>
              <View style={styles.chips}>
                {DIFICULTADES.map(d => (
                  <Pressable
                    key={d}
                    style={[styles.chipSm, pregunta.dificultad === d && styles.chipSmActive]}
                    onPress={() => onChange({ dificultad: d })}
                  >
                    <Text style={[styles.chipSmText, pregunta.dificultad === d && styles.chipSmTextActive]}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.pesoBox}>
              <Text style={styles.fieldLabel}>Valor</Text>
              <View style={styles.pesoControls}>
                <Pressable
                  style={styles.pesoBtn}
                  onPress={() => onChange({ peso: Math.max(0.5, Number((pregunta.peso - 0.5).toFixed(1))) })}
                >
                  <Ionicons name="remove" size={16} color="#844A31" />
                </Pressable>
                <Text style={styles.pesoValue}>{pregunta.peso}</Text>
                <Pressable
                  style={styles.pesoBtn}
                  onPress={() => onChange({ peso: Number((pregunta.peso + 0.5).toFixed(1)) })}
                >
                  <Ionicons name="add" size={16} color="#844A31" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: '#844A31',
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#fdfaf7',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(87,29,17,0.08)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(87,29,17,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#412E2E',
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#53b55e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.06)',
  },
  cardSectionLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  inputTitulo: {
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#412E2E',
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(132,74,49,0.25)',
  },
  chipActive: {
    backgroundColor: '#844A31',
    borderColor: '#844A31',
  },
  chipText: { color: '#844A31', fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: 'white' },
  sectionTitle: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  preguntaCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.06)',
    overflow: 'hidden',
  },
  preguntaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  preguntaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#fff3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    color: '#844A31',
    fontSize: 12,
    fontWeight: '700',
  },
  preguntaResumen: {
    flex: 1,
    color: '#412E2E',
    fontSize: 13,
    fontWeight: '500',
  },
  preguntaHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordenBtns: {
    flexDirection: 'row',
    gap: 2,
  },
  ordenBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(132,74,49,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preguntaBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(87,29,17,0.06)',
    paddingTop: 14,
    gap: 4,
  },
  fieldLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
    marginTop: 10,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.10)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#412E2E',
    backgroundColor: '#fafafa',
  },
  opcionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correctaBtn: {
    padding: 2,
  },
  correctaBtnActive: {},
  preguntaFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 10,
  },
  chipSm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(132,74,49,0.2)',
  },
  chipSmActive: {
    backgroundColor: '#844A31',
    borderColor: '#844A31',
  },
  chipSmText: { color: '#844A31', fontSize: 11, fontWeight: '500' },
  chipSmTextActive: { color: 'white' },
  pesoBox: {
    alignItems: 'center',
  },
  pesoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  pesoBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(132,74,49,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pesoValue: {
    color: '#412E2E',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(229,57,53,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(132,74,49,0.3)',
    backgroundColor: 'rgba(132,74,49,0.04)',
  },
  addBtnText: {
    color: '#844A31',
    fontSize: 14,
    fontWeight: '600',
  },
});
