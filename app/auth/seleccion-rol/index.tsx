import { useRef } from 'react';
import { View, Text, Pressable, Image, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

function RoleCard({
  image, title, subtitle, onPress,
}: {
  image: any; title: string; subtitle: string; onPress: () => void;
}) {
  const scale      = useRef(new Animated.Value(1)).current;
  const chevronX   = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale,    { toValue: 0.97, useNativeDriver: true, speed: 30 }),
      Animated.spring(chevronX, { toValue: 6,    useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale,    { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.spring(chevronX, { toValue: 0, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="bg-white rounded-2xl p-5 flex-row items-center gap-4"
      >
        <Image source={image} style={{ width: 80, height: 80 }} resizeMode="contain" />
        <View className="flex-1">
          <Text className="text-[#412E2E] text-lg font-semibold mb-1">{title}</Text>
          <Text className="text-gray-500 text-sm">{subtitle}</Text>
        </View>
        <Animated.View style={{ transform: [{ translateX: chevronX }] }}>
          <Ionicons name="chevron-forward" size={24} color="#844A31" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export default function SeleccionRol() {
  const { loginAsGuest } = useAuthStore();

  const handleGuest = () => {
    loginAsGuest();
    router.replace('/(stack)/(tabs)/home');
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="bg-[#571D11] h-40 items-center justify-center">
        <Text className="text-white text-base font-semibold">Paso 1 de 2</Text>
      </View>

      <View className="flex-1 bg-[#d7b59f] rounded-t-3xl mt-[-16px] px-6 pb-8">
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
          <RoleCard
            image={require('@/assets/sloth-estudiante.png')}
            title="Estudiante"
            subtitle="Aprende con quizzes generados por IA"
            onPress={() => router.push('/auth/registro?role=student')}
          />
          <RoleCard
            image={require('@/assets/sloth-profesor.png')}
            title="Profesor"
            subtitle="Crea clases y genera material automático"
            onPress={() => router.push('/auth/registro?role=teacher')}
          />
        </View>

        <View className="flex-row items-center gap-4 mt-8 mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-gray-500 text-xs">o</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <AnimatedOutlineBtn onPress={handleGuest} label="Continuar sin cuenta" />

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

function AnimatedOutlineBtn({ onPress, label }: { onPress: () => void; label: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="w-full border-2 border-[#844A31] rounded-xl py-4 items-center"
      >
        <Text className="text-[#844A31] text-base font-semibold">{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
