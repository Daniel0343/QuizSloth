import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Animated, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import AppAlert from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useThemeStore, THEME_PRESETS } from '@/presentation/theme/useThemeStore';
import { quizslothApi } from '@/core/auth/api/quizslothApi';

const ROL_LABEL: Record<string, string> = {
  profesor: 'Profesor',
  alumno: 'Alumno',
  invitado: 'Invitado',
};

export default function PerfilScreen() {
  const { user, logout } = useAuthStore();
  const { primaryColor, setColor } = useThemeStore();
  const inicial = (user?.nombre ?? 'I').charAt(0).toUpperCase();
  const [alertaLogout, setAlertaLogout] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalColor, setModalColor] = useState(false);
  const rol = user?.rol ?? 'invitado';

  // Edit profile state
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [editError, setEditError] = useState('');

  const abrirEditar = () => {
    setNombre(user?.nombre ?? '');
    setPassword('');
    setConfirmPassword('');
    setEditError('');
    setModalEditar(true);
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) { setEditError('El nombre no puede estar vacío.'); return; }
    if (password && password !== confirmPassword) { setEditError('Las contraseñas no coinciden.'); return; }
    setGuardando(true);
    setEditError('');
    try {
      const body: Record<string, string> = { nombre: nombre.trim() };
      if (password) body.password = password;
      await quizslothApi.patch('/auth/me', body);
      setModalEditar(false);
    } catch {
      setEditError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: primaryColor }]}>
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />
          <View style={styles.bannerCircle3} />

          <View style={styles.bannerTopRow}>
            <Text style={styles.bannerPageTitle}>Mi perfil</Text>
            {user && (
              <Pressable style={styles.bannerEditBtn} onPress={abrirEditar}>
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
              <View style={styles.rolBadge}>
                <View style={[styles.rolDot, { backgroundColor: rol === 'profesor' ? '#fbbf24' : '#86efac' }]} />
                <Text style={styles.rolText}>{ROL_LABEL[rol]}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cuenta */}
        <Text style={[styles.sectionLabel, { color: primaryColor }]}>Cuenta</Text>
        <View style={styles.card}>
          <SettingRow icon="mail-outline" label="Correo electrónico" value={user?.email} primaryColor={primaryColor} />
          <View style={styles.divider} />
          <SettingRow icon="person-outline" label="Nombre de usuario" value={user?.nombre} primaryColor={primaryColor} />
          <View style={styles.divider} />
          <SettingRow icon="lock-closed-outline" label="Contraseña" value="••••••••" primaryColor={primaryColor} onPress={abrirEditar} />
        </View>

        {/* App */}
        <Text style={[styles.sectionLabel, { color: primaryColor }]}>Aplicación</Text>
        <View style={styles.card}>
          <SettingRow icon="star-outline" label="Suscripción" primaryColor={primaryColor} />
          <View style={styles.divider} />
          {/* Color picker row */}
          <Pressable style={styles.settingRow} onPress={() => setModalColor(true)}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: `${primaryColor}18` }]}>
                <Ionicons name="color-palette-outline" size={17} color={primaryColor} />
              </View>
              <Text style={styles.settingLabel}>Color de la app</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={[styles.colorDotPreview, { backgroundColor: primaryColor }]} />
              <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.3)" />
            </View>
          </Pressable>
        </View>

        {/* Logout */}
        {user && (
          <Pressable style={styles.logoutBtn} onPress={() => setAlertaLogout(true)}>
            <View style={styles.logoutIconBox}>
              <Ionicons name="log-out-outline" size={18} color="#c0392b" />
            </View>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(192,57,43,0.5)" />
          </Pressable>
        )}

        <Text style={styles.version}>QuizSloth · v1.0.0</Text>
      </ScrollView>

      {/* Modal editar perfil */}
      <Modal visible={modalEditar} transparent animationType="slide" onRequestClose={() => setModalEditar(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalEditar(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Editar perfil</Text>

            <Text style={styles.inputLabel}>Nombre de usuario</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor="rgba(65,46,46,0.35)"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Nueva contraseña <Text style={styles.inputLabelOpt}>(opcional)</Text></Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Dejar en blanco para no cambiar"
              placeholderTextColor="rgba(65,46,46,0.35)"
              secureTextEntry
            />

            {password.length > 0 && (
              <>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite la contraseña"
                  placeholderTextColor="rgba(65,46,46,0.35)"
                  secureTextEntry
                />
              </>
            )}

            {editError.length > 0 && <Text style={styles.errorText}>{editError}</Text>}

            <Pressable
              style={[styles.confirmBtn, { backgroundColor: primaryColor }, guardando && { opacity: 0.6 }]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              {guardando
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={styles.confirmBtnText}>Guardar cambios</Text>
              }
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => setModalEditar(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal color de la app */}
      <Modal visible={modalColor} transparent animationType="slide" onRequestClose={() => setModalColor(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalColor(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Color de la aplicación</Text>
            <Text style={styles.sheetSub}>El color se aplica en el menú, banners y buscadores.</Text>
            <View style={styles.colorGrid}>
              {THEME_PRESETS.map(preset => (
                <Pressable
                  key={preset.value}
                  style={styles.colorOption}
                  onPress={async () => { await setColor(preset.value); setModalColor(false); }}
                >
                  <View style={[styles.colorCircle, { backgroundColor: preset.value },
                    primaryColor === preset.value && styles.colorCircleActive,
                  ]}>
                    {primaryColor === preset.value && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </View>
                  <Text style={styles.colorLabel}>{preset.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.cancelBtn} onPress={() => setModalColor(false)}>
              <Text style={styles.cancelBtnText}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <AppAlert
        visible={alertaLogout}
        variante="peligro"
        titulo="Cerrar sesión"
        mensaje="¿Estás seguro de que quieres salir?"
        botones={[
          { texto: 'Cancelar', estilo: 'cancelar', onPress: () => setAlertaLogout(false) },
          { texto: 'Salir', estilo: 'destructivo', onPress: async () => { await logout(); router.replace('/auth/seleccion-rol'); } },
        ]}
        onClose={() => setAlertaLogout(false)}
      />
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, value, primaryColor, onPress }: {
  icon: string; label: string; value?: string; primaryColor: string; onPress?: () => void;
}) {
  const chevronX = useRef(new Animated.Value(0)).current;

  const onPressIn = () =>
    Animated.spring(chevronX, { toValue: 4, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(chevronX, { toValue: 0, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIconBox, { backgroundColor: `${primaryColor}18` }]}>
            <Ionicons name={icon as any} size={17} color={primaryColor} />
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

  banner: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
    overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 8,
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  bannerPageTitle: { fontSize: 18, fontWeight: '800', color: 'white' },
  bannerEditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
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
  avatarEmail: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  rolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 2,
  },
  rolDot: { width: 7, height: 7, borderRadius: 4 },
  rolText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700',
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
    width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { color: '#412E2E', fontSize: 14, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '45%' },
  settingValue: { color: 'rgba(65,46,46,0.4)', fontSize: 13 },
  colorDotPreview: { width: 18, height: 18, borderRadius: 9 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 14, marginTop: 20,
    backgroundColor: 'white', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(192,57,43,0.18)',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  logoutIconBox: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: 'rgba(192,57,43,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { flex: 1, color: '#c0392b', fontSize: 14, fontWeight: '600' },
  version: {
    color: 'rgba(65,46,46,0.3)', fontSize: 11,
    textAlign: 'center', marginTop: 28, fontWeight: '500',
  },

  /* Modals */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 32, paddingTop: 12, paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(65,46,46,0.2)', alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#412E2E', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: 'rgba(65,46,46,0.5)', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(65,46,46,0.6)', marginBottom: 6, marginTop: 10 },
  inputLabelOpt: { fontSize: 12, fontWeight: '400', color: 'rgba(65,46,46,0.35)' },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1.5,
    borderColor: 'rgba(65,46,46,0.2)', paddingHorizontal: 12,
    fontSize: 14, color: '#412E2E',
  },
  errorText: { fontSize: 13, color: '#c0392b', marginTop: 8 },
  confirmBtn: {
    height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 8,
  },
  confirmBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    height: 46, borderRadius: 12, backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },

  /* Color picker */
  colorGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16,
    justifyContent: 'center', paddingVertical: 16,
  },
  colorOption: { alignItems: 'center', gap: 6, width: 72 },
  colorCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  colorCircleActive: {
    borderWidth: 3, borderColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  colorLabel: { fontSize: 12, fontWeight: '600', color: '#412E2E' },
});
