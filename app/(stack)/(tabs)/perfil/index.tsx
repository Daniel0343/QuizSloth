import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Animated,
} from 'react-native';
import AppAlert from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

const ROL_LABEL: Record<string, string> = {
  profesor: 'Profesor',
  alumno: 'Alumno',
  invitado: 'Invitado',
};


export default function PerfilScreen() {
  const { user, logout } = useAuthStore();
  const inicial = (user?.nombre ?? 'I').charAt(0).toUpperCase();
  const [alerta, setAlerta] = useState(false);
  const rol = user?.rol ?? 'invitado';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />
          <View style={styles.bannerCircle3} />

          <View style={styles.bannerTopRow}>
            <Text style={styles.bannerPageTitle}>Mi perfil</Text>
            {user && (
              <Pressable style={styles.bannerEditBtn}>
                <Ionicons name="pencil-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={styles.bannerEditText}>Editar</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{inicial}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{user?.nombre ?? 'Invitado'}</Text>
              <Text style={styles.avatarEmail}>{user?.email ?? ''}</Text>
              <View style={[styles.rolBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <View style={[styles.rolDot, { backgroundColor: rol === 'profesor' ? '#fbbf24' : '#86efac' }]} />
                <Text style={styles.rolText}>{ROL_LABEL[rol]}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cuenta */}
        <Text style={styles.sectionLabel}>Cuenta</Text>
        <View style={styles.card}>
          <SettingRow icon="mail-outline" label="Correo electrónico" value={user?.email} />
          <View style={styles.divider} />
          <SettingRow icon="person-outline" label="Nombre de usuario" value={user?.nombre} />
          <View style={styles.divider} />
          <SettingRow icon="lock-closed-outline" label="Contraseña" value="••••••••" />
        </View>

        {/* App */}
        <Text style={styles.sectionLabel}>Aplicación</Text>
        <View style={styles.card}>
          <SettingRow icon="star-outline" label="Suscripción" />
        </View>

        {/* Logout */}
        {user && (
          <Pressable style={styles.logoutBtn} onPress={() => setAlerta(true)}>
            <View style={styles.logoutIconBox}>
              <Ionicons name="log-out-outline" size={18} color="#c0392b" />
            </View>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(192,57,43,0.5)" />
          </Pressable>
        )}

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

function SettingRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
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
            <Ionicons name={icon as any} size={17} color="#571D11" />
          </View>
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue} numberOfLines={1}>{value}</Text>}
          <Animated.View style={{ transform: [{ translateX: chevronX }] }}>
            <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.3)" />
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f0eb' },
  scroll: { paddingBottom: 48 },

  /* Banner */
  banner: {
    backgroundColor: '#571D11',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  bannerCircle1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -30,
  },
  bannerCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20,
  },
  bannerCircle3: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.07)', top: 10, left: '45%',
  },
  bannerTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  bannerPageTitle: { fontSize: 18, fontWeight: '800', color: 'white' },
  bannerEditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  bannerEditText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: 'white', fontSize: 28, fontWeight: '800' },
  avatarInfo: { flex: 1, gap: 3 },
  avatarName: { color: 'white', fontSize: 18, fontWeight: '800' },
  avatarEmail: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '400' },
  rolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 2,
  },
  rolDot: { width: 7, height: 7, borderRadius: 4 },
  rolText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },

  /* Sections */
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#571D11',
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8,
  },
  card: {
    backgroundColor: 'white', marginHorizontal: 14,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(65,46,46,0.08)',
  },
  divider: { height: 1, backgroundColor: 'rgba(65,46,46,0.06)', marginLeft: 62 },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIconBox: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: 'rgba(87,29,17,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { color: '#412E2E', fontSize: 14, fontWeight: '500' },
  settingRight: {
    flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '45%',
  },
  settingValue: { color: 'rgba(65,46,46,0.4)', fontSize: 13, fontWeight: '400' },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 14, marginTop: 20,
    backgroundColor: 'white', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(192,57,43,0.18)',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  logoutIconBox: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: 'rgba(192,57,43,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { flex: 1, color: '#c0392b', fontSize: 14, fontWeight: '600' },

  version: {
    color: 'rgba(65,46,46,0.3)', fontSize: 11,
    textAlign: 'center', marginTop: 28,
    fontWeight: '500',
  },
});
