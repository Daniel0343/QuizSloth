import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, Pressable, Image, TouchableOpacity } from 'react-native';

function CenterButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        top: -46,
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: '#d7b59f',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
      }}
    >
      <Image
        source={require('@/assets/mano-sloth.png')}
        style={{ width: 75, height: 75 }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#571D11',
            borderTopWidth: 0,
            height: 84,
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
          name="center/index"
          options={{
            title: '',
            tabBarButton: () => <CenterButton onPress={() => setModalVisible(true)} />,
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
      
        <Tabs.Screen name="home/[id]" options={{ href: null }} />
        <Tabs.Screen name="home/HomeInvitado" options={{ href: null }} />
        <Tabs.Screen name="home/HomePrincipal" options={{ href: null }} />
        <Tabs.Screen name="biblioteca/favoritas" options={{ href: null }} />

      </Tabs>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: '#d7b59f',
              borderRadius: 24,
              padding: 32,
              width: '80%',
              alignItems: 'center',
              gap: 16,
            }}
            onPress={() => {}}
          >
            <Text style={{ color: '#412E2E', fontSize: 22, fontWeight: 'bold' }}>
              Modal futuro
            </Text>
            <Text style={{ color: '#571D11', fontSize: 14, textAlign: 'center' }}>
              Aquí irá el contenido que se decida más adelante.
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 8,
                backgroundColor: '#571D11',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 32,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
