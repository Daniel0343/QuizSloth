import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export default function SeleccionRol() {
  const { loginAsGuest } = useAuthStore();

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    router.push(`/auth/registro?role=${role}`);
  };

  const handleGuest = () => {
    loginAsGuest();
    router.replace('/(stack)/(tabs)/home');
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header */}
      <View className="bg-[#571D11] h-40 items-center justify-center">
        <Text className="text-white text-base font-semibold">Paso 1 de 2</Text>
      </View>

      {/* Contenido */}
      <View className="flex-1 bg-[#d7b59f] rounded-t-3xl mt-[-16px] px-6 pb-8">

        {/* Logo centrado entre header y contenido */}
        <View className="items-center -mt-12 mb-6">
          <Image
            source={require('@/assets/sloth-sintexto.png')}
            style={{ width: 96, height: 96 }}
            resizeMode="contain"
          />
        </View>

        <View className="mb-10">
          <Text className="text-[#844A31] text-base font-semibold mb-1">¡Bienvenido a QuizzSloth!</Text>
          <Text className="text-[#412E2E] text-3xl font-bold leading-tight">
            ¿Eres profesor{'\n'}o estudiante?
          </Text>
        </View>

        <View className="gap-4">
          <Pressable
            onPress={() => handleRoleSelect('student')}
            className="bg-white rounded-2xl p-5 flex-row items-center gap-4"
          >
            <Image
              source={require('@/assets/sloth-estudiante.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-[#412E2E] text-lg font-semibold mb-1">Estudiante</Text>
              <Text className="text-gray-500 text-sm">Aprende con quizzes generados por IA</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#844A31" />
          </Pressable>

          <Pressable
            onPress={() => handleRoleSelect('teacher')}
            className="bg-white rounded-2xl p-5 flex-row items-center gap-4"
          >
            <Image
              source={require('@/assets/sloth-profesor.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-[#412E2E] text-lg font-semibold mb-1">Profesor</Text>
              <Text className="text-gray-500 text-sm">Crea clases y genera material automático</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#844A31" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-4 mt-8 mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-gray-500 text-xs">o</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <Pressable
          onPress={handleGuest}
          className="w-full border-2 border-[#844A31] rounded-xl py-4 items-center"
        >
          <Text className="text-[#844A31] text-base font-semibold">Continuar sin cuenta</Text>
        </Pressable>

        <View className="mt-6 items-center">
          <Text className="text-gray-500 text-xs">
            ¿Ya tienes cuenta?{' '}
            <Text className="text-[#844A31] font-medium" onPress={() => router.push('/auth/login')}>
              Inicia sesión
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
