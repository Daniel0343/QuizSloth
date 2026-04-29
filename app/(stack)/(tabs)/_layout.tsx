import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import CrearModal from '@/components/CrearModal';
import { useThemeStore } from '@/presentation/theme/useThemeStore';

const TAB_BAR_HEIGHT = 84;
const BUTTON_SIZE = 78;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TabsLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const { primaryColor } = useThemeStore();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: primaryColor,
            borderTopWidth: 0,
            height: TAB_BAR_HEIGHT,
          },
          tabBarItemStyle: {
            paddingVertical: 6,
          },
          tabBarActiveTintColor: '#53b55e',
          tabBarInactiveTintColor: '#d7b59f',
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
          },
          tabBarAllowFontScaling: false,
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="biblioteca/index"
          options={{
            title: 'Biblioteca',
            tabBarIcon: ({ color }) => <Ionicons name="library" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="clase/index"
          options={{
            title: 'Clase',
            tabBarIcon: ({ color }) => <Ionicons name="school" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil/index"
          options={{
            title: 'Cuenta',
            tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={28} color={color} />,
          }}
        />

        <Tabs.Screen name="home/HomeInvitado" options={{ href: null }} />
        <Tabs.Screen name="home/HomePrincipal" options={{ href: null }} />
        <Tabs.Screen name="biblioteca/favoritas" options={{ href: null }} />
      </Tabs>


      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.floatingBtn, {
          bottom: TAB_BAR_HEIGHT - BUTTON_SIZE / 2 + 8,
          left: SCREEN_WIDTH / 2 - BUTTON_SIZE / 2,
        }]}
        activeOpacity={0.85}
      >
        <Image
          source={require('@/assets/mano-perezoso.png')}
          style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <CrearModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#d7b59f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 99,
  },
});
