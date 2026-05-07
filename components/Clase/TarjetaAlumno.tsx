import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CursoResumen } from '@/core/auth/interface/curso';

interface Props {
  clase: CursoResumen;
  onTap: () => void;
}

export default function TarjetaAlumno({ clase, onTap }: Props) {
  const iniciales = clase.nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <Pressable style={styles.cardAlumno} onPress={onTap}>
      <View style={[styles.cardAlumnoTop, { backgroundColor: clase.color ?? '#24833D' }]}>
        <View style={styles.cardAlumnoIniciales}>
          <Text style={styles.cardAlumnoInicialesText}>{iniciales}</Text>
        </View>
        <View style={styles.cardAlumnoChip}>
          <Ionicons name="arrow-forward" size={12} color="white" />
          <Text style={styles.cardAlumnoChipText}>Ver clase</Text>
        </View>
      </View>
      <View style={styles.cardAlumnoBody}>
        <Text style={styles.cardAlumnoNombre} numberOfLines={1}>{clase.nombre}</Text>
        {clase.descripcion ? (
          <Text style={styles.cardDescripcion} numberOfLines={2}>{clase.descripcion}</Text>
        ) : null}
        <View style={styles.cardAlumnoSeparador} />
        <View style={styles.cardAlumnoFooter}>
          <View style={styles.cardAlumnoFooterItem}>
            <Ionicons name="person-outline" size={13} color="#6a7282" />
            <Text style={styles.cardAlumnoFooterText}>{clase.profesor?.nombre ?? 'Desconocido'}</Text>
          </View>
          <View style={styles.cardAlumnoFooterItem}>
            <Ionicons name="people-outline" size={13} color="#6a7282" />
            <Text style={styles.cardAlumnoFooterText}>{clase.numAlumnos} {clase.numAlumnos === 1 ? 'estudiante' : 'estudiantes'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardAlumno: { borderRadius: 12, backgroundColor: 'white', overflow: 'hidden', alignSelf: 'stretch' },
  cardAlumnoTop: { height: 100, justifyContent: 'space-between', padding: 12 },
  cardAlumnoIniciales: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center',
  },
  cardAlumnoInicialesText: { color: 'white', fontSize: 18, fontWeight: '700' },
  cardAlumnoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  cardAlumnoChipText: { color: 'white', fontSize: 11, fontWeight: '600' },
  cardAlumnoBody: { padding: 14, gap: 5 },
  cardAlumnoNombre: { color: '#412E2E', fontSize: 17, fontWeight: '700' },
  cardDescripcion: { color: '#4a5565', fontSize: 12 },
  cardAlumnoSeparador: { height: 1, backgroundColor: 'rgba(65,46,46,0.08)', marginVertical: 6 },
  cardAlumnoFooter: { flexDirection: 'row', gap: 16 },
  cardAlumnoFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardAlumnoFooterText: { color: '#6a7282', fontSize: 12 },
});
