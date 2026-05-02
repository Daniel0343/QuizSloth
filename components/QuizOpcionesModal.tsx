import { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { crearSala } from '@/core/salas/actions/sala';

interface Props {
  visible: boolean;
  quizId: number | null;
  quizTitulo?: string;
  esCreador?: boolean;
  onClose: () => void;
}

export default function QuizOpcionesModal({ visible, quizId, quizTitulo, esCreador = false, onClose }: Props) {
  const [creandoSala, setCreandoSala] = useState(false);
  const [participar, setParticipar] = useState(false);

  const handleCrearSala = async () => {
    if (!quizId) return;
    setCreandoSala(true);
    try {
      const sala = await crearSala(quizId, participar);
      onClose();
      const params = participar && sala.hostParticipanteId
        ? `?host=1&participanteId=${sala.hostParticipanteId}`
        : `?host=1`;
      router.push(`/sala/${sala.codigo}${params}` as any);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCreandoSala(false);
    }
  };

  const handleSolo = () => {
    if (!quizId) return;
    onClose();
    router.push(`/quiz/solo/${quizId}` as any);
  };

  const handleEditar = () => {
    if (!quizId) return;
    onClose();
    router.push(`/crear-quiz/editar?id=${quizId}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          {quizTitulo ? <Text style={styles.titulo} numberOfLines={2}>{quizTitulo}</Text> : null}

          <Pressable style={styles.checkRow} onPress={() => setParticipar(p => !p)}>
            <View style={[styles.checkbox, participar && styles.checkboxActive]}>
              {participar && <Ionicons name="checkmark" size={13} color="white" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>Participar como jugador</Text>
              <Text style={styles.checkSub}>Si no participas, solo gestionas la partida</Text>
            </View>
          </Pressable>

          <Opcion
            icon="people-outline"
            color="#571D11"
            bg="rgba(87,29,17,0.08)"
            label="Crear sala"
            sub="Juega con otros en tiempo real"
            onPress={handleCrearSala}
            loading={creandoSala}
          />
          <Opcion
            icon="person-outline"
            color="#24833D"
            bg="rgba(36,131,61,0.08)"
            label="Jugar solo"
            sub="Practica por tu cuenta"
            onPress={handleSolo}
          />
          {esCreador && (
            <Opcion
              icon="create-outline"
              color="#844A31"
              bg="rgba(132,74,49,0.08)"
              label="Editar quiz"
              sub="Modifica preguntas y configuración"
              onPress={handleEditar}
            />
          )}

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Opcion({ icon, color, bg, label, sub, onPress, loading }: {
  icon: any; color: string; bg: string; label: string; sub: string;
  onPress: () => void; loading?: boolean;
}) {
  return (
    <Pressable style={[styles.opcion, { backgroundColor: bg }]} onPress={onPress} disabled={loading}>
      <View style={[styles.opcionIcon, { backgroundColor: color + '20' }]}>
        {loading
          ? <ActivityIndicator size="small" color={color} />
          : <Ionicons name={icon} size={22} color={color} />
        }
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.opcionLabel, { color }]}>{label}</Text>
        <Text style={styles.opcionSub}>{sub}</Text>
      </View>
      {!loading && <Ionicons name="chevron-forward" size={16} color={color + '80'} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fdfaf7', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 10,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(65,46,46,0.2)', alignSelf: 'center', marginBottom: 12,
  },
  titulo: {
    fontSize: 16, fontWeight: '700', color: '#412E2E', marginBottom: 4, textAlign: 'center',
  },
  opcion: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14,
  },
  opcionIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  opcionLabel: { fontSize: 15, fontWeight: '700' },
  opcionSub: { fontSize: 12, color: 'rgba(65,46,46,0.55)', marginTop: 2 },
  cancelBtn: {
    height: 46, borderRadius: 12, backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(65,46,46,0.04)', borderRadius: 12, padding: 12,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: 'rgba(65,46,46,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#571D11', borderColor: '#571D11' },
  checkLabel: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  checkSub: { fontSize: 11, color: 'rgba(65,46,46,0.5)', marginTop: 2 },
});
