import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getCategorias, type Categoria } from '@/core/categorias/actions/get-categorias';

export default function HomeInvitado() {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [code, setCode] = useState('');
  const [categories, setCategories] = useState<Categoria[]>([]);

  useEffect(() => {
    getCategorias()
      .then(setCategories)
      .catch(() => {}); // si falla (sin backend) simplemente no muestra categorías
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/sloth.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ opacity: 0.55 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('@/assets/icono-perfil.png')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.invitadoText}>Invitado</Text>
            </View>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push('/auth/seleccion-rol')}
            >
              <Text style={styles.loginText}>Login</Text>
            </Pressable>
          </View>

 
          <View style={styles.explorarContainer}>
            <Text style={styles.explorarText}>Explorar</Text>
          </View>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {[{ id: 0, nombre: 'Todas' }, ...categories].map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.nombre)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.nombre ? styles.categoryChipActive : styles.categoryChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategory === cat.nombre ? 'rgba(234,243,246,1)' : 'rgba(87,29,17,1)' },
                  ]}
                >
                  {cat.nombre}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContent}
          >
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.quizCard}>
                <Image
                  source={require('@/assets/categoria-vacia.png')}
                  style={styles.quizCardImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.loginCard}>
            <Text style={styles.loginCardText}>
              Inicia sesión para poder ver los quizzes
            </Text>
            <Pressable
              style={styles.loginCardButton}
              onPress={() => router.push('/auth/seleccion-rol')}
            >
              <Text style={styles.loginCardButtonText}>Iniciar sesión</Text>
              <Ionicons name="chevron-forward" size={14} color="#571D11" />
            </Pressable>
          </View>

          <View style={styles.codeSection}>
            <View style={styles.codeInputRow}>
              <TextInput
                style={styles.codeInput}
                placeholder="Introducir código de participación"
                placeholderTextColor="rgba(132,74,49,0.5)"
                value={code}
                onChangeText={setCode}
              />
              <Ionicons name="qr-code-outline" size={20} color="#844A31" />
            </View>
            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Unirse al juego</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgba(215,181,159,1)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(132,74,49,1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  invitadoText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  loginButton: {
    height: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(87,29,17,1)',
  },
  loginText: {
    color: 'rgba(234,243,246,1)',
    fontSize: 13,
    fontWeight: '600',
  },
  explorarContainer: {
    paddingVertical: 6,
    paddingLeft: 20,
  },
  explorarText: {
    color: '#412E2E',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 30,
    textShadowColor: 'rgba(215,181,159,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  categoriesContent: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 8,
    alignItems: 'center',
    height: 38,
  },
  categoryChip: {
    height: 30,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(87,29,17,1)',
  },
  categoryChipInactive: {
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,1)',
    backgroundColor: 'rgba(215,181,159,0.75)',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19.5,
  },
  cardsContent: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 10,
  },
  quizCard: {
    width: 130,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(232,221,213,1)',
    opacity: 0.75,
  },
  quizCardImage: {
    width: '100%',
    height: '100%',
  },
  loginCard: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(65,46,46,1)',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  loginCardText: {
    color: 'rgba(234,243,246,1)',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  loginCardButton: {
    flexDirection: 'row',
    height: 34,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(253,183,138,1)',
  },
  loginCardButtonText: {
    color: 'rgba(87,29,17,1)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19.5,
  },
  codeSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(232,210,192,0.92)',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 25,
    gap: 18,
    shadowColor: 'rgba(87,29,17,0.2)',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  codeInputRow: {
    flexDirection: 'row',
    height: 42,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(132,74,49,0.3)',
    backgroundColor: 'rgba(255,245,238,0.7)',
  },
  codeInput: {
    flex: 1,
    height: '100%',
    color: '#412E2E',
    fontSize: 13,
  },
  joinButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(87,29,17,1)',
  },
  joinButtonText: {
    color: 'rgba(234,243,246,1)',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
});
