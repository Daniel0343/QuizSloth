import { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, Image,
  KeyboardAvoidingView, ScrollView, Platform, StyleSheet, Animated, Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Rol } from '@/core/auth/interface/user';

interface FormErrors {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Registro() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { register, loginAsGuest } = useAuthStore();

  const [showPassword,   setShowPassword]   = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [isPosting,      setIsPosting]      = useState(false);
  const [errors,         setErrors]         = useState<FormErrors>({});
  const [modalSub,       setModalSub]       = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [form, setForm] = useState({
    nombre: '', apellidos: '', email: '', password: '', confirmPassword: '',
  });

  const clearError = (field: keyof FormErrors) =>
    setErrors(prev => ({ ...prev, [field]: undefined }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio';
    if (!form.email.trim())    e.email    = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email no válido';
    if (!form.password)        e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (!form.confirmPassword) e.confirmPassword = 'Repite la contraseña';
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (role !== 'teacher') {
      setAceptaTerminos(false);
      setModalSub(true);
      return;
    }
    await doRegister();
  };

  const doRegister = async () => {
    setIsPosting(true);
    const nombreCompleto = `${form.nombre.trim()} ${form.apellidos.trim()}`.trim();
    const rol: Rol = role === 'teacher' ? 'profesor' : 'alumno';
    const ok = await register(nombreCompleto, form.email, form.password, rol);
    setIsPosting(false);
    if (ok) {
      router.replace('/(stack)/(tabs)/home');
    } else {
      setErrors({ email: 'No se pudo completar el registro. Inténtalo de nuevo.' });
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    router.replace('/(stack)/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-[#571D11]" contentContainerStyle={{ flexGrow: 1 }}>

        <View className="bg-[#571D11] h-40 items-center justify-center relative">
          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 top-10 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-base font-semibold">Paso 2 de 2</Text>
        </View>

        <View className="flex-1 bg-[#d7b59f] rounded-t-3xl mt-[-16px] px-6 pb-10">

          <View className="items-center -mt-12 mb-4">
            <Image
              source={require('@/assets/sloth-sintexto.png')}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-[#412E2E] text-3xl font-bold mb-1">Crea tu cuenta</Text>
          <Text className="text-[#844A31] text-sm font-medium mb-5">
            Como {role === 'teacher' ? 'profesor' : 'estudiante'}
          </Text>

          <Text className="text-[#412E2E] text-xs font-semibold mb-1.5">Nombre</Text>
          <View className={`flex-row items-center bg-white rounded-xl px-4 mb-1 ${errors.nombre ? 'border-2 border-red-500' : ''}`}>
            <Ionicons name="person-outline" size={20} color={errors.nombre ? '#dc2626' : '#9ca3af'} />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="Tu nombre" placeholderTextColor="#9ca3af"
              value={form.nombre}
              onChangeText={v => { setForm({ ...form, nombre: v }); clearError('nombre'); }}
            />
          </View>
          {errors.nombre && <ErrorMsg text={errors.nombre} />}

          <Text className="text-[#412E2E] text-xs font-semibold mb-1.5 mt-2">Apellidos</Text>
          <View className="flex-row items-center bg-white rounded-xl px-4 mb-1">
            <Ionicons name="person-outline" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="Tus apellidos" placeholderTextColor="#9ca3af"
              value={form.apellidos}
              onChangeText={v => setForm({ ...form, apellidos: v })}
            />
          </View>

          <Text className="text-[#412E2E] text-xs font-semibold mb-1.5 mt-2">Email</Text>
          <View className={`flex-row items-center bg-white rounded-xl px-4 mb-1 ${errors.email ? 'border-2 border-red-500' : ''}`}>
            <Ionicons name="mail-outline" size={20} color={errors.email ? '#dc2626' : '#9ca3af'} />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="tu@email.com" placeholderTextColor="#9ca3af"
              keyboardType="email-address" autoCapitalize="none"
              value={form.email}
              onChangeText={v => { setForm({ ...form, email: v }); clearError('email'); }}
            />
          </View>
          {errors.email && <ErrorMsg text={errors.email} />}

          <Text className="text-[#412E2E] text-xs font-semibold mb-1.5 mt-2">Contraseña</Text>
          <View className={`flex-row items-center bg-white rounded-xl px-4 mb-1 ${errors.password ? 'border-2 border-red-500' : ''}`}>
            <Ionicons name="lock-closed-outline" size={20} color={errors.password ? '#dc2626' : '#9ca3af'} />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="Crea tu contraseña" placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword} autoCapitalize="none"
              value={form.password}
              onChangeText={v => { setForm({ ...form, password: v }); clearError('password'); }}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </Pressable>
          </View>
          {errors.password && <ErrorMsg text={errors.password} />}

          <Text className="text-[#412E2E] text-xs font-semibold mb-1.5 mt-2">Confirmar contraseña</Text>
          <View className={`flex-row items-center bg-white rounded-xl px-4 mb-1 ${errors.confirmPassword ? 'border-2 border-red-500' : ''}`}>
            <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? '#dc2626' : '#9ca3af'} />
            <TextInput
              className="flex-1 py-4 px-3 text-[14px] text-[#412E2E]"
              placeholder="Repite tu contraseña" placeholderTextColor="#9ca3af"
              secureTextEntry={!showConfirm} autoCapitalize="none"
              value={form.confirmPassword}
              onChangeText={v => { setForm({ ...form, confirmPassword: v }); clearError('confirmPassword'); }}
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </Pressable>
          </View>
          {errors.confirmPassword && <ErrorMsg text={errors.confirmPassword} />}

          <AnimatedBtn
            onPress={handleRegister}
            disabled={isPosting}
            className={`w-full rounded-xl py-4 items-center mt-4 mb-2 ${isPosting ? 'bg-gray-400' : 'bg-[#53b55e]'}`}
          >
            <Text className="text-white text-base font-bold tracking-wide">
              {isPosting ? 'Creando cuenta...' : 'Inscribirse'}
            </Text>
          </AnimatedBtn>

          <View className="flex-row items-center gap-4 my-4">
            <View className="flex-1 h-px bg-[#844A31] opacity-20" />
            <Text className="text-[#844A31] text-xs opacity-70">o</Text>
            <View className="flex-1 h-px bg-[#844A31] opacity-20" />
          </View>

          <AnimatedBtn
            onPress={handleGuest}
            className="w-full border-2 border-[#844A31] rounded-xl py-4 items-center mb-6"
          >
            <Text className="text-[#844A31] text-base font-semibold">Continuar sin cuenta</Text>
          </AnimatedBtn>

          <View className="items-center">
            <Text className="text-[#844A31] text-xs opacity-80">
              ¿Ya tienes cuenta?{' '}
              <Text
                className="text-[#571D11] font-bold underline"
                onPress={() => router.push('/auth/login')}
              >
                Inicia sesión aquí
              </Text>
            </Text>
          </View>

        </View>
      </ScrollView>
      <Modal visible={modalSub} transparent animationType="slide" onRequestClose={() => setModalSub(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalSub(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.precioBadge}>
              <Text style={styles.precioAmount}>29,99€</Text>
              <Text style={styles.precioMes}>/ mes</Text>
            </View>

            <Text style={styles.sheetTitle}>Suscripción QuizSloth</Text>
            <Text style={styles.sheetSub}>Al registrarte como alumno se creará una suscripción mensual.</Text>

            <View style={styles.beneficiosList}>
              {['Acceso completo a todas las clases', 'Quizzes y apuntes ilimitados', 'Participa en salas en tiempo real', 'Soporte prioritario'].map(b => (
                <View key={b} style={styles.beneficioRow}>
                  <Ionicons name="checkmark-circle" size={17} color="#24833D" />
                  <Text style={styles.beneficioText}>{b}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.checkRow} onPress={() => setAceptaTerminos(p => !p)}>
              <View style={[styles.checkbox, aceptaTerminos && styles.checkboxActive]}>
                {aceptaTerminos && <Ionicons name="checkmark" size={13} color="white" />}
              </View>
              <Text style={styles.checkLabel}>Acepto los términos y condiciones de la suscripción</Text>
            </Pressable>

            <Pressable
              style={[styles.confirmBtn, !aceptaTerminos && { opacity: 0.4 }]}
              disabled={!aceptaTerminos || isPosting}
              onPress={() => { setModalSub(false); doRegister(); }}
            >
              <Text style={styles.confirmBtnText}>
                {isPosting ? 'Creando cuenta...' : 'Aceptar y registrarse'}
              </Text>
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => setModalSub(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

    </KeyboardAvoidingView>
  );
}

function AnimatedBtn({ onPress, disabled, className, children }: {
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={disabled}>
      <Animated.View style={{ transform: [{ scale }] }} className={className}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle-outline" size={13} color="#dc2626" />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6, marginLeft: 4 },
  errorText: { color: '#dc2626', fontSize: 11, fontWeight: '500' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(65,46,46,0.2)', alignSelf: 'center', marginBottom: 20,
  },
  precioBadge: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    alignSelf: 'center', marginBottom: 8,
  },
  precioAmount: { fontSize: 40, fontWeight: '800', color: '#571D11' },
  precioMes: { fontSize: 15, fontWeight: '600', color: 'rgba(65,46,46,0.5)', paddingBottom: 6 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#412E2E', textAlign: 'center', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: 'rgba(65,46,46,0.55)', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  beneficiosList: { gap: 10, marginBottom: 20 },
  beneficioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  beneficioText: { fontSize: 14, color: '#412E2E', fontWeight: '500', flex: 1 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(65,46,46,0.04)', borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: 'rgba(65,46,46,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#571D11', borderColor: '#571D11' },
  checkLabel: { flex: 1, fontSize: 13, color: '#412E2E', fontWeight: '500', lineHeight: 18 },
  confirmBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#53b55e',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  confirmBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    height: 48, borderRadius: 14, backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
});
