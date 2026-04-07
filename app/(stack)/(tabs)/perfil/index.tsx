import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export default function PerfilScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/seleccion-rol');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#d7b59f]">
      <View className="flex-1 px-6 pt-8">

        {/* Info usuario */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-[#571D11] items-center justify-center mb-4">
            <Ionicons name="person" size={40} color="#d7b59f" />
          </View>
          <Text className="text-[#412E2E] text-2xl font-bold">
            {user?.nombre ?? 'Invitado'}
          </Text>
          {user && (
            <Text className="text-[#571D11] text-sm mt-1">{user.email}</Text>
          )}
          <View className="mt-2 bg-[#571D11] px-4 py-1 rounded-full">
            <Text className="text-white text-xs font-medium capitalize">
              {user?.rol ?? 'invitado'}
            </Text>
          </View>
        </View>

        {/* Botón cerrar sesión */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 bg-[#571D11] rounded-xl py-4"
        >
          <Ionicons name="log-out-outline" size={22} color="white" />
          <Text className="text-white text-base font-semibold">Cerrar sesión</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}
