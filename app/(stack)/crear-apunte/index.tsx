import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator,
} from 'react-native';
import AppAlert from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { generarApunteDesdeTexto, generarApunteDesdeArchivo } from '@/core/apuntes/actions/apuntes';

type Modo = 'texto' | 'pdf';

export default function CrearApunteScreen() {
  const { modo: modoParam } = useLocalSearchParams<{ modo?: string }>();
  const [modo, setModo] = useState<Modo>(modoParam === 'pdf' ? 'pdf' : 'texto');
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [generando, setGenerando] = useState(false);
  const [alerta, setAlerta] = useState({ visible: false, titulo: '', mensaje: '' });
  const cerrar = () => setAlerta(p => ({ ...p, visible: false }));

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setArchivo({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/pdf' });
    }
  };

  const handleGenerar = async () => {
    if (modo === 'texto' && !texto.trim()) {
      setAlerta({ visible: true, titulo: 'Escribe algo', mensaje: 'Indica el tema o pega el contenido del que quieres los apuntes.' });
      return;
    }
    if (modo === 'pdf' && !archivo) {
      setAlerta({ visible: true, titulo: 'Selecciona un archivo', mensaje: 'Elige un PDF para generar los apuntes.' });
      return;
    }
    setGenerando(true);
    try {
      const apunte = modo === 'texto'
        ? await generarApunteDesdeTexto(texto.trim())
        : await generarApunteDesdeArchivo(archivo!);

      router.replace(`/crear-apunte/editar?id=${apunte.id}&nuevo=true` as any);
    } catch (e: any) {
      setAlerta({ visible: true, titulo: 'Error', mensaje: e?.message ?? 'No se pudieron generar los apuntes. Inténtalo de nuevo.' });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <Text style={styles.topTitle}>Crear apuntes con IA</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selector modo */}
        <View style={styles.modoRow}>
          <Pressable
            style={[styles.modoBtn, modo === 'texto' && styles.modoBtnActive]}
            onPress={() => setModo('texto')}
          >
            <Ionicons name="sparkles-outline" size={16} color={modo === 'texto' ? 'white' : '#844A31'} />
            <Text style={[styles.modoText, modo === 'texto' && styles.modoTextActive]}>Tema / texto</Text>
          </Pressable>
          <Pressable
            style={[styles.modoBtn, modo === 'pdf' && styles.modoBtnActive]}
            onPress={() => setModo('pdf')}
          >
            <Ionicons name="document-attach-outline" size={16} color={modo === 'pdf' ? 'white' : '#844A31'} />
            <Text style={[styles.modoText, modo === 'pdf' && styles.modoTextActive]}>Subir PDF</Text>
          </Pressable>
        </View>

        {modo === 'texto' ? (
          <>
            <Text style={styles.label}>¿Sobre qué tema quieres los apuntes?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Ej: La Segunda Guerra Mundial, Las ecuaciones diferenciales, El sistema digestivo..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              value={texto}
              onChangeText={setTexto}
              textAlignVertical="top"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Selecciona un PDF</Text>
            <Pressable style={styles.fileBtn} onPress={handlePickFile}>
              <Ionicons name="cloud-upload-outline" size={28} color="#844A31" />
              {archivo
                ? <Text style={styles.fileNameText} numberOfLines={2}>{archivo.name}</Text>
                : <Text style={styles.filePlaceholder}>Toca para seleccionar un PDF</Text>
              }
            </Pressable>
          </>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#844A31" />
          <Text style={styles.infoText}>
            La IA generará el resumen, secciones con puntos clave y referencias reales donde ampliar la información.
          </Text>
        </View>

        <Pressable
          style={[styles.generateBtn, generando && { opacity: 0.7 }]}
          onPress={handleGenerar}
          disabled={generando}
        >
          {generando ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.generateBtnText}>Generando apuntes...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={20} color="white" />
              <Text style={styles.generateBtnText}>Generar apuntes</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
      <AppAlert
        visible={alerta.visible}
        variante="info"
        titulo={alerta.titulo}
        mensaje={alerta.mensaje}
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
  topTitle: {
    flex: 1, fontSize: 17, fontWeight: '700', color: '#412E2E', textAlign: 'center',
  },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  modoRow: { flexDirection: 'row', gap: 10 },
  modoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 42, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(132,74,49,0.3)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  modoBtnActive: {
    backgroundColor: '#571D11', borderColor: '#571D11',
  },
  modoText: { fontSize: 14, fontWeight: '600', color: '#844A31' },
  modoTextActive: { color: 'white' },
  label: { fontSize: 14, fontWeight: '700', color: '#412E2E' },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.15)',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#412E2E', minHeight: 140,
  },
  fileBtn: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(132,74,49,0.3)',
    borderStyle: 'dashed', alignItems: 'center',
    paddingVertical: 32, gap: 10,
  },
  fileNameText: {
    fontSize: 13, fontWeight: '600', color: '#412E2E', textAlign: 'center', paddingHorizontal: 16,
  },
  filePlaceholder: { fontSize: 14, color: '#9ca3af' },
  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: 'rgba(132,74,49,0.08)', borderRadius: 12, padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, color: '#844A31', lineHeight: 19 },
  generateBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#571D11',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  generateBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
