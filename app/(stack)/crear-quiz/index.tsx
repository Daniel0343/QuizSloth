import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { generarQuizDesdeTexto, generarQuizDesdeArchivo } from '@/core/quizzes/actions/crear-quiz';
import { getCategorias } from '@/core/categorias/actions/get-categorias';
import { Categoria } from '@/core/auth/interface/categoria';
import { useEffect } from 'react';

const DIFICULTADES = ['facil', 'normal', 'dificil', 'extremo'] as const;

export default function CrearQuizScreen() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const esArchivo = tipo === 'archivo';

  const [tab, setTab] = useState<'texto' | 'archivo'>(esArchivo ? 'archivo' : 'texto');
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [dificultad, setDificultad] = useState<string>('normal');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    getCategorias().then(setCategorias);
  }, []);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      setArchivo({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
    }
  };

  const puedeGenerar = titulo.trim().length > 0 &&
    (tab === 'texto' ? texto.trim().length > 30 : archivo !== null);

  const handleGenerar = async () => {
    if (!puedeGenerar) return;
    setGenerando(true);

    try {
      const resultado = tab === 'texto'
        ? await generarQuizDesdeTexto(titulo.trim(), texto.trim(), numPreguntas, categoriaId)
        : await generarQuizDesdeArchivo(archivo!, titulo.trim(), numPreguntas, categoriaId);

      setGenerando(false);
      router.replace(`/crear-quiz/editar?id=${(resultado as any).quiz.id}&nuevo=true`);
    } catch (e: any) {
      setGenerando(false);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message ?? e?.message ?? 'Error desconocido';
      Alert.alert(
        `Error ${status ?? ''}`.trim(),
        msg,
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <Text style={styles.topTitle}>Nuevo Quiz</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Título del quiz</Text>
        <TextInput
          style={styles.inputTitulo}
          placeholder="Ej: Introducción a la biología celular"
          placeholderTextColor="#9ca3af"
          value={titulo}
          onChangeText={setTitulo}
          maxLength={120}
        />

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tabBtn, tab === 'texto' && styles.tabBtnActive]}
            onPress={() => setTab('texto')}
          >
            <Ionicons name="document-text-outline" size={16} color={tab === 'texto' ? 'white' : '#844A31'} />
            <Text style={[styles.tabText, tab === 'texto' && styles.tabTextActive]}>Texto</Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === 'archivo' && styles.tabBtnActive]}
            onPress={() => setTab('archivo')}
          >
            <Ionicons name="attach-outline" size={16} color={tab === 'archivo' ? 'white' : '#844A31'} />
            <Text style={[styles.tabText, tab === 'archivo' && styles.tabTextActive]}>PDF / PPT</Text>
          </Pressable>
        </View>

        {tab === 'texto' ? (
          <TextInput
            style={styles.textArea}
            placeholder="Pega o escribe el contenido (mínimo 30 caracteres) del que quieres generar las preguntas..."
            placeholderTextColor="#9ca3af"
            multiline
            value={texto}
            onChangeText={setTexto}
            textAlignVertical="top"
          />
        ) : (
          <Pressable style={styles.dropZone} onPress={pickFile}>
            {archivo ? (
              <>
                <Ionicons name="checkmark-circle" size={32} color="#53b55e" />
                <Text style={styles.dropFileName}>{archivo.name}</Text>
                <Text style={styles.dropHint}>Toca para cambiar</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={34} color="#844A31" style={{ opacity: 0.5 }} />
                <Text style={styles.dropTitle}>Seleccionar archivo</Text>
                <Text style={styles.dropHint}>PDF o PowerPoint (.pptx)</Text>
              </>
            )}
          </Pressable>
        )}

        <Text style={styles.label}>Número de preguntas (máx. 30)</Text>
        <TextInput
          style={styles.inputTitulo}
          value={String(numPreguntas)}
          onChangeText={v => {
            const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(n)) setNumPreguntas(Math.min(30, Math.max(1, n)));
            if (v === '') setNumPreguntas(1);
          }}
          keyboardType="numeric"
          maxLength={2}
          placeholder="10"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Dificultad</Text>
        <View style={styles.chips}>
          {DIFICULTADES.map(d => (
            <Pressable
              key={d}
              style={[styles.chip, dificultad === d && styles.chipActive]}
              onPress={() => setDificultad(d)}
            >
              <Text style={[styles.chipText, dificultad === d && styles.chipTextActive]}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {categorias.length > 0 && (
          <>
            <Text style={styles.label}>Categoría (opcional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categorias.map(c => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, categoriaId === c.id && styles.chipActive]}
                  onPress={() => setCategoriaId(categoriaId === c.id ? undefined : c.id)}
                >
                  <Text style={[styles.chipText, categoriaId === c.id && styles.chipTextActive]}>{c.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        <Pressable
          style={[styles.generateBtn, !puedeGenerar && styles.generateBtnDisabled]}
          onPress={handleGenerar}
          disabled={generando || !puedeGenerar}
        >
          {generando ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={18} color="white" />
              <Text style={styles.generateBtnText}>Generar Quiz con IA</Text>
            </>
          )}
        </Pressable>

        {generando && (
          <Text style={styles.generandoHint}>
            La IA está generando las preguntas, puede tardar unos segundos...
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fdfaf7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    color: '#412E2E',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
  },
  inputTitulo: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#412E2E',
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(132,74,49,0.25)',
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#844A31',
    borderColor: '#844A31',
  },
  tabText: {
    color: '#844A31',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#412E2E',
    minHeight: 180,
  },
  dropZone: {
    backgroundColor: 'rgba(132,74,49,0.04)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(132,74,49,0.2)',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  dropTitle: {
    color: '#844A31',
    fontSize: 14,
    fontWeight: '600',
  },
  dropFileName: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  dropHint: {
    color: '#844A31',
    fontSize: 12,
    opacity: 0.6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(132,74,49,0.25)',
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#844A31',
    borderColor: '#844A31',
  },
  chipText: {
    color: '#844A31',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
  },
  catScroll: {
    flexDirection: 'row',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    backgroundColor: '#53b55e',
    borderRadius: 16,
    paddingVertical: 16,
  },
  generateBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  generateBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  generandoHint: {
    color: '#844A31',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
});
