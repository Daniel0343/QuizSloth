import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, Image,
  KeyboardAvoidingView, ScrollView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export default function Login() {
  const { login, loginAsGuest } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    if (!form.email || !form.password) return;
    setIsPosting(true);
    const ok = await login(form.email, form.password);
    setIsPosting(false);
    if (ok) {
      router.replace('/(stack)/(tabs)/home');
    } else {
      Alert.alert('Error', 'Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    router.replace('/(stack)/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-[#571D11] h-40 items-center justify-center relative">
          <View className="absolute -bottom-12 items-center">
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ width: 96, height: 96, borderRadius: 48 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Contenido */}
        <View className="flex-1 bg-[#d7b59f] rounded-t-3xl mt-[-16px] px-6 pt-20 pb-8">
          <View className="mb-6">
            <Text className="text-[#412E2E] text-3xl font-bold">Inicia sesión</Text>
            <Text className="text-gray-600 text-sm mt-1">Accede a tu cuenta de QuizzSloth</Text>
          </View>

          {/* Email */}
          <Text className="text-[#412E2E] text-xs font-medium mb-2">Email</Text>
          <View className="flex-row items-center bg-white rounded-xl px-4 mb-4">
            <Ionicons name="mail-outline" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="tu@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />
          </View>

          {/* Contraseña */}
          <Text className="text-[#412E2E] text-xs font-medium mb-2">Contraseña</Text>
          <View className="flex-row items-center bg-white rounded-xl px-4 mb-2">
            <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="Tu contraseña"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9ca3af"
              />
            </Pressable>
          </View>

          <Pressable className="items-end mb-6">
            <Text className="text-[#844A31] text-xs font-medium">¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            disabled={isPosting}
            className={`w-full rounded-xl py-4 items-center mb-4 ${isPosting ? 'bg-gray-400' : 'bg-[#53b55e]'}`}
          >
            <Text className="text-white text-base font-semibold">
              {isPosting ? 'Iniciando...' : 'Iniciar sesión'}
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-4 my-4">
            <View className="flex-1 h-px bg-[#844A31] opacity-20" />
            <Text className="text-[#844A31] text-xs opacity-70">o</Text>
            <View className="flex-1 h-px bg-[#844A31] opacity-20" />
          </View>

          <Pressable
            onPress={handleGuest}
            className="w-full border-2 border-[#844A31] rounded-xl py-4 items-center mb-6"
          >
            <Text className="text-[#844A31] text-base font-semibold">Continuar sin cuenta</Text>
          </Pressable>

          <View className="items-center">
            <Text className="text-gray-600 text-xs">
              ¿No tienes cuenta?{' '}
              <Text
                className="text-[#844A31] font-medium"
                onPress={() => router.push('/auth/seleccion-rol')}
              >
                Regístrate aquí
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
