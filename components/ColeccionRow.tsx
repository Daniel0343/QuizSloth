import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ColeccionDTO } from '@/core/colecciones/actions/colecciones';

interface Props {
  col: ColeccionDTO;
  onLongPress: (col: ColeccionDTO) => void;
}

export default function ColeccionRow({ col, onLongPress }: Props) {
  return (
    <Pressable
      style={styles.colRow}
      onPress={() => router.push({ pathname: '/(stack)/coleccion/[id]', params: { id: col.id, nombre: col.nombre } } as any)}
      onLongPress={() => onLongPress(col)}
    >
      <Text style={styles.colNombre}>{col.nombre}</Text>
      <View style={styles.colRight}>
        <Text style={styles.colCount}>{col.cantidad}</Text>
        <Ionicons name="chevron-forward" size={16} color="#412E2E" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  colRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(65,46,46,0.08)',
  },
  colNombre: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '600',
  },
  colRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colCount: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '500',
  },
});
