import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CursoResumen } from '@/core/auth/interface/curso';

interface Props {
  clase: CursoResumen;
  onMenu: () => void;
  onTap: () => void;
}

export default function TarjetaProfesor({ clase, onMenu, onTap }: Props) {
  return (
    <Pressable style={styles.cardProfesor} onPress={onTap}>
      <View style={[styles.cardProfesorTop, { backgroundColor: clase.color ?? '#24833D' }]}>
        <Pressable style={styles.cardMenu} onPress={onMenu} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={16} color="white" />
        </Pressable>
      </View>
      <View style={styles.cardProfesorBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>{clase.nombre}</Text>
        <Text style={styles.cardDescripcion} numberOfLines={1}>{clase.descripcion ?? ''}</Text>
        <View style={styles.cardEstudiantes}>
          <Ionicons name="people-outline" size={13} color="#6a7282" />
          <Text style={styles.cardEstudiantesText}>{clase.numAlumnos} estudiantes</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardProfesor: { width: '47.5%', borderRadius: 12, backgroundColor: 'white', overflow: 'hidden' },
  cardProfesorTop: { height: 72, alignItems: 'flex-end', paddingTop: 10, paddingRight: 10 },
  cardMenu: { padding: 4 },
  cardProfesorBody: { padding: 10, gap: 2 },
  cardNombre: { color: '#412E2E', fontSize: 14, fontWeight: '600' },
  cardDescripcion: { color: '#4a5565', fontSize: 12 },
  cardEstudiantes: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardEstudiantesText: { color: '#6a7282', fontSize: 12 },
});
