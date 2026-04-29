import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApunteResumen } from '@/core/auth/interface/apunte';

interface Props {
  apunte: ApunteResumen;
  onEliminar: (a: ApunteResumen) => void;
}

export default function ApunteCard({ apunte, onEliminar }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/crear-apunte/editar?id=${apunte.id}` as any)}>
      <View style={[styles.cardThumb, { backgroundColor: 'rgba(83,181,94,0.15)', alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="document-text-outline" size={28} color="#24833D" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{apunte.titulo}</Text>
        <View style={styles.cardMetaRow}>
          <Ionicons name="sparkles-outline" size={11} color="#53b55e" />
          <Text style={[styles.cardMetaTag, { color: '#24833D' }]}>Apuntes</Text>
        </View>
      </View>
      <Pressable
        style={styles.cardMenu}
        onPress={() => Alert.alert(apunte.titulo, '¿Qué quieres hacer?', [
          { text: 'Editar', onPress: () => router.push(`/crear-apunte/editar?id=${apunte.id}` as any) },
          { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(apunte) },
          { text: 'Cancelar', style: 'cancel' },
        ])}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#412E2E" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(65,46,46,0.08)',
    backgroundColor: 'rgba(217,217,217,1)',
  },
  cardThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardMetaTag: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
  cardMenu: {
    padding: 4,
  },
});
