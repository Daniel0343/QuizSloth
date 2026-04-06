import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
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
        name="clase/index"
        options={{
          title: 'Clase',
          tabBarIcon: ({ color }) => <Ionicons name="school" size={28} color={color} />,
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
        name="perfil/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
      {/* Pantallas ocultas del tab bar */}
      <Tabs.Screen name="home/[id]" options={{ href: null }} />
      <Tabs.Screen name="home/HomeProfesor" options={{ href: null }} />
      <Tabs.Screen name="home/HomeAlumno" options={{ href: null }} />
      <Tabs.Screen name="home/HomeInvitado" options={{ href: null }} />
      <Tabs.Screen name="biblioteca/favoritas" options={{ href: null }} />
    </Tabs>
  );
}
