import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Variante = 'peligro' | 'exito' | 'info';

interface Boton {
  texto: string;
  onPress?: () => void;
  estilo?: 'normal' | 'destructivo' | 'cancelar';
}

interface Props {
  visible: boolean;
  variante?: Variante;
  titulo: string;
  mensaje?: string;
  botones?: Boton[];
  onClose: () => void;
}

const VARIANTE_CONFIG = {
  peligro: { icono: 'trash-outline' as const,       color: '#c0392b', bg: '#fdecea' },
  exito:   { icono: 'checkmark-circle-outline' as const, color: '#24833D', bg: '#e8f5e9' },
  info:    { icono: 'information-circle-outline' as const, color: '#571D11', bg: '#f9f0eb' },
};

export default function AppAlert({ visible, variante = 'info', titulo, mensaje, botones, onClose }: Props) {
  const config = VARIANTE_CONFIG[variante];

  const botonesFinales: Boton[] = botones ?? [{ texto: 'Aceptar', onPress: onClose }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>

          <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icono} size={32} color={config.color} />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

          <View style={[styles.botonesRow, botonesFinales.length === 1 && { justifyContent: 'center' }]}>
            {botonesFinales.map((btn, i) => (
              <Pressable
                key={i}
                style={[
                  styles.boton,
                  btn.estilo === 'destructivo' && styles.botonDestructivo,
                  btn.estilo === 'cancelar'    && styles.botonCancelar,
                  botonesFinales.length === 1  && { flex: 0, paddingHorizontal: 40 },
                ]}
                onPress={() => { btn.onPress?.(); onClose(); }}
              >
                <Text style={[
                  styles.botonTexto,
                  btn.estilo === 'destructivo' && styles.botonTextoDestructivo,
                  btn.estilo === 'cancelar'    && styles.botonTextoCancelar,
                ]}>
                  {btn.texto}
                </Text>
              </Pressable>
            ))}
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  mensaje: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  botonesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  boton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#571D11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDestructivo: {
    backgroundColor: '#c0392b',
  },
  botonCancelar: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(65,46,46,0.2)',
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  botonTextoDestructivo: {
    color: '#fff',
  },
  botonTextoCancelar: {
    color: '#412E2E',
  },
});
