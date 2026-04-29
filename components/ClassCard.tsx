import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CursoResumen } from '@/core/auth/interface/curso';

const FALLBACK_COLORS = ['#24833D', '#571D11', '#1a6fa8', '#7c3aed', '#b45309', '#c1623e'];

interface Props {
  curso: CursoResumen;
  idx: number;
}

export default function ClassCard({ curso, idx }: Props) {
  const bannerColor = curso.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
  const iniciales = curso.nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <Pressable style={styles.classCard} onPress={() => router.push(`/clase/${curso.id}` as any)}>
      <View style={[styles.classCardBanner, { backgroundColor: bannerColor }]}>
        <View style={styles.classCardIniciales}>
          <Text style={styles.classCardInicialesText}>{iniciales}</Text>
        </View>
      </View>
      <View style={styles.classCardBody}>
        <Text style={styles.classCardName} numberOfLines={1}>{curso.nombre}</Text>
        {curso.profesor ? (
          <Text style={styles.classCardSub} numberOfLines={1}>{curso.profesor.nombre}</Text>
        ) : (
          <Text style={styles.classCardSub} numberOfLines={1}>{curso.numAlumnos} estudiantes</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  classCard: {
    width: '47%',
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  classCardBanner: {
    height: 60,
    justifyContent: 'flex-end',
    padding: 8,
  },
  classCardIniciales: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classCardInicialesText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  classCardBody: {
    padding: 8,
    gap: 2,
  },
  classCardName: {
    color: '#412E2E',
    fontSize: 12,
    fontWeight: '700',
  },
  classCardSub: {
    color: '#6a7282',
    fontSize: 11,
  },
});
