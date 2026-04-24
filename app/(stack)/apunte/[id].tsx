import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getApuntePublico } from '@/core/apuntes/actions/apuntes';
import { ApunteContenido } from '@/core/auth/interface/apunte';

export default function VerApunteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cargando, setCargando] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState<ApunteContenido | null>(null);

  useEffect(() => {
    if (!id) return;
    getApuntePublico(Number(id))
      .then(a => {
        setTitulo(a.titulo);
        try { setContenido(JSON.parse(a.contenidoJson)); } catch { setContenido(null); }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d7b59f' }}>
        <ActivityIndicator size="large" color="#571D11" />
      </View>
    );
  }

  if (!contenido) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#412E2E" />
          </Pressable>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#412E2E' }}>No se pudo cargar el apunte.</Text>
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
        <Text style={styles.topTitle} numberOfLines={1}>{titulo}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.titulo}>{titulo}</Text>

        <View style={styles.resumenCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={16} color="#571D11" />
            <Text style={styles.sectionLabel}>Resumen</Text>
          </View>
          <Text style={styles.resumenText}>{contenido.resumen}</Text>
        </View>

        {contenido.secciones.map((sec, si) => (
          <View key={si} style={styles.seccionCard}>
            <Text style={styles.seccionTitulo}>{sec.titulo}</Text>
            <Text style={styles.seccionContenido}>{sec.contenido}</Text>
            {sec.puntosClave.length > 0 && (
              <View style={styles.puntosContainer}>
                <Text style={styles.puntosLabel}>Puntos clave</Text>
                {sec.puntosClave.map((p, pi) => (
                  <View key={pi} style={styles.puntoRow}>
                    <View style={styles.puntoDot} />
                    <Text style={styles.puntoText}>{p}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7b59f' },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, gap: 8,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#412E2E', textAlign: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', lineHeight: 30 },
  resumenCard: {
    backgroundColor: 'rgba(253,250,247,0.95)', borderRadius: 14, padding: 14, gap: 8,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#571D11', textTransform: 'uppercase', letterSpacing: 0.5 },
  resumenText: { fontSize: 14, color: '#412E2E', lineHeight: 22, fontStyle: 'italic' },
  seccionCard: {
    backgroundColor: 'rgba(253,250,247,0.95)', borderRadius: 14, padding: 14, gap: 10,
  },
  seccionTitulo: { fontSize: 16, fontWeight: '700', color: '#412E2E' },
  seccionContenido: { fontSize: 14, color: '#555', lineHeight: 22 },
  puntosContainer: {
    backgroundColor: 'rgba(83,181,94,0.08)', borderRadius: 10, padding: 12, gap: 8,
  },
  puntosLabel: { fontSize: 11, fontWeight: '700', color: '#24833D', textTransform: 'uppercase', letterSpacing: 0.5 },
  puntoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  puntoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#53b55e', marginTop: 7 },
  puntoText: { flex: 1, fontSize: 13, color: '#412E2E', lineHeight: 20 },
  refCard: {
    backgroundColor: 'rgba(253,250,247,0.95)', borderRadius: 14, padding: 14, gap: 10,
  },
  refRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(65,46,46,0.07)',
  },
  refIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(36,131,61,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  refTitulo: { fontSize: 13, fontWeight: '600', color: '#412E2E' },
  refDesc: { fontSize: 12, color: '#555', lineHeight: 18, marginTop: 2 },
  refUrl: { fontSize: 11, color: '#24833D', marginTop: 2 },
});
