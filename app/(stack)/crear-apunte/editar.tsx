import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, Alert, Linking, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { getApunte, actualizarApunte, añadirApunteAColeccion } from '@/core/apuntes/actions/apuntes';
import { getMisColecciones, crearColeccion } from '@/core/colecciones/actions/colecciones';
import { ApunteContenido, Seccion } from '@/core/auth/interface/apunte';
import { ColeccionDTO } from '@/core/colecciones/actions/colecciones';

export default function EditarApunteScreen() {
  const { id, nuevo } = useLocalSearchParams<{ id: string; nuevo?: string }>();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState<ApunteContenido | null>(null);
  const [apunteId, setApunteId] = useState<number>(0);

  // Modal colección
  const [modalColeccion, setModalColeccion] = useState(false);
  const [colecciones, setColecciones] = useState<ColeccionDTO[]>([]);
  const [nuevaCol, setNuevaCol] = useState('');
  const [creandoCol, setCreandoCol] = useState(false);

  useEffect(() => {
    if (!id) return;
    getApunte(Number(id))
      .then(a => {
        setApunteId(a.id);
        setTitulo(a.titulo);
        try {
          setContenido(JSON.parse(a.contenidoJson));
        } catch {
          setContenido(null);
        }
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el apunte.'))
      .finally(() => setCargando(false));

    getMisColecciones().then(setColecciones).catch(() => {});
  }, [id]);

  const handleGuardar = async () => {
    if (!contenido) return;
    setGuardando(true);
    try {
      await actualizarApunte(apunteId, titulo, JSON.stringify(contenido));
      if (nuevo === 'true') {
        setModalColeccion(true);
      } else {
        Alert.alert('Guardado', 'Apunte actualizado correctamente.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo guardar el apunte.');
    } finally {
      setGuardando(false);
    }
  };

  const handleAñadirColeccion = async (colId: number) => {
    try {
      await añadirApunteAColeccion(colId, apunteId);
      setModalColeccion(false);
      router.replace('/(stack)/(tabs)/biblioteca' as any);
      Alert.alert('¡Listo!', 'Apunte guardado en tu biblioteca y colección.');
    } catch {
      Alert.alert('Error', 'No se pudo añadir a la colección.');
    }
  };

  const handleCrearYAñadir = async () => {
    if (!nuevaCol.trim()) return;
    setCreandoCol(true);
    try {
      const col = await crearColeccion(nuevaCol.trim());
      await añadirApunteAColeccion(col.id, apunteId);
      setNuevaCol('');
      setModalColeccion(false);
      router.replace('/(stack)/(tabs)/biblioteca' as any);
      Alert.alert('¡Listo!', `Apunte guardado en "${col.nombre}".`);
    } catch {
      Alert.alert('Error', 'No se pudo crear la colección.');
    } finally {
      setCreandoCol(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!contenido) return;
    try {
      const html = generarHTML(titulo, contenido);
      const { uri: pdfUri } = await Print.printToFileAsync({ html, base64: false });
      const nombreArchivo = titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_') || 'apunte';
      const destUri = `${FileSystem.documentDirectory}${nombreArchivo}.pdf`;
      await FileSystem.copyAsync({ from: pdfUri, to: destUri });
      await Sharing.shareAsync(destUri, { mimeType: 'application/pdf', dialogTitle: 'Guardar o compartir PDF', UTI: 'com.adobe.pdf' });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar el PDF.');
    }
  };

  const actualizarSeccion = (idx: number, campo: keyof Seccion, valor: string | string[]) => {
    if (!contenido) return;
    const secciones = [...contenido.secciones];
    secciones[idx] = { ...secciones[idx], [campo]: valor };
    setContenido({ ...contenido, secciones });
  };

  const actualizarPuntoClave = (secIdx: number, pIdx: number, valor: string) => {
    if (!contenido) return;
    const secciones = [...contenido.secciones];
    const puntos = [...secciones[secIdx].puntosClave];
    puntos[pIdx] = valor;
    secciones[secIdx] = { ...secciones[secIdx], puntosClave: puntos };
    setContenido({ ...contenido, secciones });
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d7b59f' }}>
        <ActivityIndicator size="large" color="#571D11" />
        <Text style={{ marginTop: 12, color: '#571D11', fontWeight: '600' }}>Cargando apuntes...</Text>
      </View>
    );
  }

  if (!contenido) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#412E2E' }}>No se pudo cargar el contenido.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable style={styles.topIconBtn} onPress={() => setEditando(e => !e)}>
            <Ionicons name={editando ? 'checkmark-done-outline' : 'create-outline'} size={20} color="#412E2E" />
          </Pressable>
          <Pressable style={styles.topIconBtn} onPress={handleDescargarPDF}>
            <Ionicons name="download-outline" size={20} color="#412E2E" />
          </Pressable>
          <Pressable
            style={[styles.guardarBtn, guardando && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.guardarText}>Guardar</Text>
            }
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Título */}
        {editando ? (
          <TextInput
            style={styles.tituloInput}
            value={titulo}
            onChangeText={setTitulo}
            multiline
          />
        ) : (
          <Text style={styles.titulo}>{titulo}</Text>
        )}

        {/* Resumen */}
        <View style={styles.resumenCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={16} color="#571D11" />
            <Text style={styles.sectionLabel}>Resumen</Text>
          </View>
          {editando ? (
            <TextInput
              style={styles.editTextArea}
              value={contenido.resumen}
              onChangeText={v => setContenido({ ...contenido, resumen: v })}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.resumenText}>{contenido.resumen}</Text>
          )}
        </View>

        {/* Secciones */}
        {contenido.secciones.map((sec, si) => (
          <View key={si} style={styles.seccionCard}>
            {editando ? (
              <TextInput
                style={styles.seccionTituloInput}
                value={sec.titulo}
                onChangeText={v => actualizarSeccion(si, 'titulo', v)}
              />
            ) : (
              <Text style={styles.seccionTitulo}>{sec.titulo}</Text>
            )}

            {editando ? (
              <TextInput
                style={styles.editTextArea}
                value={sec.contenido}
                onChangeText={v => actualizarSeccion(si, 'contenido', v)}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.seccionContenido}>{sec.contenido}</Text>
            )}

            {sec.puntosClave.length > 0 && (
              <View style={styles.puntosContainer}>
                <Text style={styles.puntosLabel}>Puntos clave</Text>
                {sec.puntosClave.map((p, pi) => (
                  <View key={pi} style={styles.puntoRow}>
                    <View style={styles.puntoDot} />
                    {editando ? (
                      <TextInput
                        style={styles.puntoInput}
                        value={p}
                        onChangeText={v => actualizarPuntoClave(si, pi, v)}
                        multiline
                      />
                    ) : (
                      <Text style={styles.puntoText}>{p}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Referencias */}
        {contenido.referencias.length > 0 && (
          <View style={styles.refCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="link-outline" size={16} color="#24833D" />
              <Text style={[styles.sectionLabel, { color: '#24833D' }]}>Referencias</Text>
            </View>
            {contenido.referencias.map((ref, ri) => (
              <Pressable key={ri} style={styles.refRow} onPress={() => Linking.openURL(ref.url)}>
                <View style={styles.refIcon}>
                  <Ionicons name="globe-outline" size={16} color="#24833D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.refTitulo}>{ref.titulo}</Text>
                  <Text style={styles.refDesc} numberOfLines={2}>{ref.descripcion}</Text>
                  <Text style={styles.refUrl} numberOfLines={1}>{ref.url}</Text>
                </View>
                <Ionicons name="open-outline" size={14} color="rgba(36,131,61,0.6)" />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>

    {/* Modal colección */}
    <Modal visible={modalColeccion} transparent animationType="slide" onRequestClose={() => setModalColeccion(false)}>
      <Pressable style={styles.overlay} onPress={() => setModalColeccion(false)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>¿Añadir a una colección?</Text>
          <Text style={styles.sheetSub}>El apunte ya está en tu biblioteca</Text>

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
                <Pressable key={col.id} style={styles.colRow} onPress={() => handleAñadirColeccion(col.id)}>
                  <View style={styles.colIcon}>
                    <Ionicons name="folder-outline" size={20} color="#24833D" />
                  </View>
                  <Text style={[styles.colNombre, { flex: 1 }]}>{col.nombre}</Text>
                  <Text style={{ color: '#844A31', fontSize: 13 }}>{col.cantidad}</Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.3)" />
                </Pressable>
              ))
            )}
          </ScrollView>

          <Pressable style={styles.omitirBtn} onPress={() => {
            setModalColeccion(false);
            router.replace('/(stack)/(tabs)/biblioteca' as any);
          }}>
            <Text style={styles.omitirText}>Omitir por ahora</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  );
}

function generarHTML(titulo: string, contenido: ApunteContenido): string {
  const seccionesHTML = contenido.secciones.map(s => `
    <div class="seccion">
      <h2>${s.titulo}</h2>
      <p>${s.contenido}</p>
      ${s.puntosClave.length > 0 ? `
        <div class="puntos">
          <strong>Puntos clave:</strong>
          <ul>${s.puntosClave.map(p => `<li>${p}</li>`).join('')}</ul>
        </div>` : ''}
    </div>
  `).join('');

  const referenciasHTML = contenido.referencias.length > 0 ? `
    <div class="referencias">
      <h2>Referencias</h2>
      ${contenido.referencias.map(r => `
        <div class="ref">
          <strong>${r.titulo}</strong>
          <p>${r.descripcion}</p>
          <a href="${r.url}">${r.url}</a>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1a1a1a; }
        h1 { color: #571D11; border-bottom: 2px solid #571D11; padding-bottom: 8px; }
        .resumen { background: #f9f3ef; border-left: 4px solid #844A31; padding: 16px; border-radius: 4px; margin: 20px 0; font-style: italic; }
        .seccion { margin: 24px 0; }
        h2 { color: #412E2E; }
        .puntos { background: #f0f9f2; padding: 12px 16px; border-radius: 8px; margin-top: 12px; }
        ul { margin: 6px 0; padding-left: 20px; }
        li { margin: 4px 0; }
        .referencias { border-top: 2px solid #e5e7eb; margin-top: 32px; padding-top: 16px; }
        .ref { margin: 12px 0; }
        a { color: #24833D; word-break: break-all; }
      </style>
    </head>
    <body>
      <h1>${titulo}</h1>
      <div class="resumen">${contenido.resumen}</div>
      ${seccionesHTML}
      ${referenciasHTML}
    </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7b59f' },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, gap: 8,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topActions: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  topIconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  guardarBtn: {
    height: 36, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: '#571D11', alignItems: 'center', justifyContent: 'center',
  },
  guardarText: { fontSize: 14, fontWeight: '700', color: 'white' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', lineHeight: 30 },
  tituloInput: {
    fontSize: 22, fontWeight: '800', color: '#1a1a1a',
    borderBottomWidth: 2, borderBottomColor: '#571D11', paddingBottom: 4,
  },
  resumenCard: {
    backgroundColor: 'rgba(253,250,247,0.95)', borderRadius: 14,
    padding: 14, gap: 8,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#571D11', textTransform: 'uppercase', letterSpacing: 0.5 },
  resumenText: { fontSize: 14, color: '#412E2E', lineHeight: 22, fontStyle: 'italic' },
  editTextArea: {
    fontSize: 14, color: '#412E2E', lineHeight: 22,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.2)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, minHeight: 80,
  },
  seccionCard: {
    backgroundColor: 'rgba(253,250,247,0.95)', borderRadius: 14,
    padding: 14, gap: 10,
  },
  seccionTitulo: { fontSize: 16, fontWeight: '700', color: '#412E2E' },
  seccionTituloInput: {
    fontSize: 16, fontWeight: '700', color: '#412E2E',
    borderBottomWidth: 1.5, borderBottomColor: '#844A31', paddingBottom: 4,
  },
  seccionContenido: { fontSize: 14, color: '#555', lineHeight: 22 },
  puntosContainer: {
    backgroundColor: 'rgba(83,181,94,0.08)', borderRadius: 10, padding: 12, gap: 8,
  },
  puntosLabel: { fontSize: 11, fontWeight: '700', color: '#24833D', textTransform: 'uppercase', letterSpacing: 0.5 },
  puntoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  puntoDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#53b55e', marginTop: 7,
  },
  puntoText: { flex: 1, fontSize: 13, color: '#412E2E', lineHeight: 20 },
  puntoInput: {
    flex: 1, fontSize: 13, color: '#412E2E', lineHeight: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(83,181,94,0.4)',
  },
  refCard: {
    backgroundColor: 'rgba(253,250,247,0.95)', borderRadius: 14, padding: 14, gap: 10,
  },
  refRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(36,131,61,0.1)',
  },
  refIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(83,181,94,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  refTitulo: { fontSize: 13, fontWeight: '700', color: '#412E2E' },
  refDesc: { fontSize: 12, color: '#555', marginTop: 2, lineHeight: 17 },
  refUrl: { fontSize: 11, color: '#24833D', marginTop: 3 },
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
  newColRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  newColInput: {
    flex: 1, height: 42, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.2)',
    paddingHorizontal: 12, fontSize: 14, color: '#412E2E',
  },
  newColBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: '#571D11', alignItems: 'center', justifyContent: 'center',
  },
  emptyCol: { textAlign: 'center', color: '#844A31', fontSize: 13, opacity: 0.7, paddingVertical: 16 },
  colRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  colIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#e8f0e3', alignItems: 'center', justifyContent: 'center',
  },
  colNombre: { fontSize: 15, fontWeight: '600', color: '#412E2E' },
  omitirBtn: {
    marginTop: 12, height: 46, borderRadius: 12,
    backgroundColor: 'rgba(65,46,46,0.07)', alignItems: 'center', justifyContent: 'center',
  },
  omitirText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
});
