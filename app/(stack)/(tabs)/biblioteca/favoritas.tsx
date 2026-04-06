import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritasScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#d7b59f]">
      <View className="flex-1 items-center justify-center">
        <Text className="text-[#412E2E] text-2xl font-bold">Mis Favoritas</Text>
      </View>
    </SafeAreaView>
  );
}
