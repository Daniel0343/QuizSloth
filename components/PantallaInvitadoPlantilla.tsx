import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from 'expo-router';

interface Props {
  titulo?: string;
  mensaje?: string;
}

export default function PantallaInvitado({
  titulo = 'Inicia sesión para continuar',
  mensaje = 'Esta sección solo está disponible para usuarios registrados.',
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/sloth-triste.png')}
        style={styles.imagen}
        resizeMode="contain"
      />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.mensaje}>{mensaje}</Text>
      <Pressable style={styles.btn} onPress={() => router.push('/auth/seleccion-rol')}>
        <Text style={styles.btnText}>Iniciar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d7b59f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 14,
  },
  imagen: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#412E2E',
    textAlign: 'center',
  },
  mensaje: {
    fontSize: 14,
    color: 'rgba(65,46,46,0.65)',
    textAlign: 'center',
    lineHeight: 21,
  },
  btn: {
    marginTop: 8,
    height: 46,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: '#571D11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
