import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export default function StackLayout() {
  const { status, checkStatus } = useAuthStore();

  useEffect(() => {
    if (status === 'checking') checkStatus();
  }, []);

  if (status === 'checking') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d7b59f' }}>
        <ActivityIndicator size="large" color="#571D11" />
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/auth/seleccion-rol" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="crear-quiz/index" />
      <Stack.Screen name="crear-quiz/editar" />
    </Stack>
  );
}
