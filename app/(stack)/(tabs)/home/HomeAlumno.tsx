import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export default function HomeAlumno() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-[#d7b59f]">
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-[#412E2E] text-3xl font-bold">Panel Alumno</Text>
        <Text className="text-[#571D11] text-base">{user?.nombre}</Text>
      </View>
    </SafeAreaView>
  );
}
