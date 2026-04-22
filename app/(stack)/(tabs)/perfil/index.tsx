import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Switch, Animated,
} from 'react-native';
import AppAlert from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export default function PerfilScreen() {
  const { user, logout } = useAuthStore();
  const esProfesor = user?.rol === 'profesor';
  const [modoEstudiante, setModoEstudiante] = useState(false);

  const inicial = (user?.nombre ?? 'I').charAt(0).toUpperCase();
  const [alerta, setAlerta] = useState(false);

  const handleLogout = () => setAlerta(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi cuenta</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.nombre ?? 'Invitado'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
          {user && (
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Editar</Text>
            </Pressable>
          )}
        </View>

        {esProfesor && (
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIconBox}>
                  <Ionicons name="school-outline" size={18} color="#571D11" />
                </View>
                <Text style={styles.toggleLabel}>Cambiar a modo estudiante</Text>
              </View>
              <Switch
                value={modoEstudiante}
                onValueChange={setModoEstudiante}
                trackColor={{ false: '#d1d5db', true: '#53b55e' }}
                thumbColor="white"
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <SettingRow icon="mail-outline" label="Correo electrónico" value={user?.email} />
          <View style={styles.divider} />
          <SettingRow icon="person-outline" label="Nombre de usuario" value={user?.nombre} />
          <View style={styles.divider} />
          <SettingRow icon="lock-closed-outline" label="Contraseña" value="••••••••" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <SettingRow icon="notifications-outline" label="Notificaciones" />
          <View style={styles.divider} />
          <SettingRow icon="shield-checkmark-outline" label="Privacidad" />
          <View style={styles.divider} />
          <SettingRow icon="stats-chart-outline" label="Estadísticas" />
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#6b7280" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.version}>QuizSloth v1.0.0</Text>
      </ScrollView>

      <AppAlert
        visible={alerta}
        variante="peligro"
        titulo="Cerrar sesión"
        mensaje="¿Estás seguro de que quieres salir?"
        botones={[
          { texto: 'Cancelar', estilo: 'cancelar', onPress: () => setAlerta(false) },
          { texto: 'Salir', estilo: 'destructivo', onPress: async () => { await logout(); router.replace('/auth/seleccion-rol'); } },
        ]}
        onClose={() => setAlerta(false)}
      />
    </SafeAreaView>
  );
}

function SettingRow({
  icon, label, value,
}: {
  icon: string; label: string; value?: string;
}) {
  const chevronX = useRef(new Animated.Value(0)).current;

  const onPressIn = () =>
    Animated.spring(chevronX, { toValue: 4, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(chevronX, { toValue: 0, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIconBox}>
            <Ionicons name={icon as any} size={18} color="#571D11" />
          </View>
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue} numberOfLines={1}>{value}</Text>}
          <Animated.View style={{ transform: [{ translateX: chevronX }] }}>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 52,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    color: '#412E2E',
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#374151',
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  profileEmail: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: {
    color: '#412E2E',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#fff3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#fff3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '45%',
  },
  settingValue: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 62,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingVertical: 16,
  },
  logoutText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    color: '#d1d5db',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
});
