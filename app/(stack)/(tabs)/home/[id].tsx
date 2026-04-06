
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function HomeDetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View className="p-4 bg-[#d7b59f] min-h-screen block" style={{ display: 'block' }}>
      <Text className="text-2xl font-bold text-[#412E2E] block">Detalle: {id}</Text>
    </View>
  );
}