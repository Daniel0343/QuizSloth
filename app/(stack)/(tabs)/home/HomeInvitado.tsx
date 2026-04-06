import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function HomeInvitado() {
  return (
    <SafeAreaView className="flex-1 bg-[#d7b59f]">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text className="text-[#412E2E] text-3xl font-bold">Bienvenido</Text>
        <Text className="text-[#571D11] text-sm text-center">
          Estás navegando como invitado. Crea una cuenta para acceder a todas las funcionalidades.
        </Text>
        <Pressable
          onPress={() => router.push('/auth/seleccion-rol')}
          className="bg-[#53b55e] rounded-xl px-8 py-4"
        >
          <Text className="text-white font-semibold text-base">Crear cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
