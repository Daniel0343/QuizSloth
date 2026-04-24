import PantallaInvitado from '@/components/PantallaInvitadoPlantilla';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated, Image,
  Modal, Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type SubType = 'prediseñados' | 'texto-ia' | 'url' | 'texto-pdf' | 'sloth-ia' | null;

const QUIZ_OPTIONS = [
  { key: 'prediseñados' as SubType, icon: 'grid-outline', label: 'Prediseñados', sub: 'Plantillas listas', color: '#53b55e', bg: 'rgba(83,181,94,0.10)' },
  { key: 'texto-ia' as SubType, icon: 'document-text-outline', label: 'Con texto', sub: 'Pega contenido', color: '#c1623e', bg: 'rgba(193,98,62,0.10)' },
] as const;

const NOTES_OPTIONS = [
  { key: 'texto-pdf' as SubType, icon: 'document-attach-outline', label: 'Texto o PDF', sub: 'Con ayuda IA', color: '#844A31', bg: 'rgba(132,74,49,0.08)' },
  { key: 'sloth-ia' as SubType, icon: 'sparkles-outline', label: 'Sloth IA', sub: 'Deja a Sloth ayudar', color: '#53b55e', bg: 'rgba(83,181,94,0.10)' },
] as const;

const SUB_CONFIG: Record<string, { title: string; desc: string; icon: string; color: string }> = {
  url: {
    title: 'Importar desde URL',
    desc: 'Pega la URL de un documento o artículo y generaremos un quiz automáticamente con IA.',
    icon: 'link-outline', color: '#571D11',
  },
  'prediseñados': {
    title: 'Plantillas prediseñadas',
    desc: 'Selecciona una plantilla ya preparada para tu asignatura y personalízala a tu gusto.',
    icon: 'grid-outline', color: '#53b55e',
  },
  'texto-ia': {
    title: 'Crear con texto',
    desc: 'Pega o escribe el contenido y la IA generará preguntas tipo test automáticamente.',
    icon: 'document-text-outline', color: '#844A31',
  },
  'texto-pdf': {
    title: 'Texto o PDF con IA',
    desc: 'Sube un archivo PDF o pega texto para generar apuntes estructurados con ayuda de la IA.',
    icon: 'document-attach-outline', color: '#844A31',
  },
  'sloth-ia': {
    title: 'Dejar a Sloth ayudar',
    desc: 'Indica el tema y Sloth generará apuntes completos utilizando inteligencia artificial.',
    icon: 'sparkles-outline', color: '#53b55e',
  },
};

export default function CrearModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user } = useAuthStore();
  const [sub, setSub] = useState<SubType>(null);

  const handleClose = () => {
    setSub(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      {!user ? (
        <View style={{ flex: 1 }}>
          <Pressable style={styles.modalCloseTop} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#412E2E" />
          </Pressable>
          <PantallaInvitado
            titulo="Crea con Sloth"
            mensaje="Inicia sesión para generar quizzes y apuntes con inteligencia artificial."
          />
        </View>
      ) : (
        <Pressable style={styles.backdropFull} onPress={handleClose}>
          <Pressable style={styles.backdrop} onPress={handleClose}>
            <Pressable style={styles.sheet} onPress={() => { }}>

              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Image
                    source={require('@/assets/sloth-sintexto.png')}
                    style={{ width: 65, height: 65 }}
                    resizeMode="contain"
                  />
                  <View>
                    <Text style={styles.headerTitle}>Crear con Sloth</Text>
                    <Text style={styles.headerSub}>Quizzes y apuntes con IA</Text>
                  </View>
                </View>
                <Pressable style={styles.closeBtn} onPress={handleClose}>
                  <Ionicons name="close" size={18} color="#844A31" />
                </Pressable>
              </View>

              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: '#844A31' }]}>
                  <Ionicons name="add" size={14} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Crear Quiz con IA</Text>
              </View>

              <View style={styles.cardRow}>
                {QUIZ_OPTIONS.map(opt => (
                  <OptionCard
                    key={opt.key as string}
                    opt={opt}
                    onPress={() => {
                      if (opt.key === 'texto-ia') {
                        handleClose();
                        router.push(`/crear-quiz?tipo=${opt.key}`);
                      } else if (opt.key === 'prediseñados') {
                        handleClose();
                        router.push('/plantillas' as any);
                      } else {
                        setSub(opt.key);
                      }
                    }}
                  />
                ))}
              </View>

              <View style={styles.divider} />

              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: '#844A31' }]}>
                  <Ionicons name="book-outline" size={14} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Crear Apuntes con ayuda IA</Text>
              </View>

              <View style={styles.cardRowTwo}>
                {NOTES_OPTIONS.map(opt => (
                  <OptionCard
                    key={opt.key as string}
                    opt={opt}
                    onPress={() => {
                      handleClose();
                      if (opt.key === 'texto-pdf') {
                        router.push('/crear-apunte?modo=pdf' as any);
                      } else {
                        router.push('/crear-apunte?modo=texto' as any);
                      }
                    }}
                  />
                ))}
              </View>

            </Pressable>
          </Pressable>

          {sub !== null && (
            <SubModal type={sub} onClose={() => setSub(null)} onDismiss={handleClose} />
          )}
        </Pressable>
      )}
    </Modal>
  );
}

function OptionCard({ opt, onPress }: { opt: typeof QUIZ_OPTIONS[number] | typeof NOTES_OPTIONS[number]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.cardWrapper}>
      <Animated.View style={[styles.card, { backgroundColor: opt.bg, borderColor: opt.color + '30', transform: [{ scale }] }]}>
        <View style={[styles.cardIconBox, { backgroundColor: opt.color + '18' }]}>
          <Ionicons name={opt.icon as any} size={22} color={opt.color} />
        </View>
        <Text style={styles.cardLabel}>{opt.label}</Text>
        <Text style={styles.cardSub}>{opt.sub}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SubModal({ type, onClose, onDismiss }: { type: SubType; onClose: () => void; onDismiss: () => void }) {
  const cfg = SUB_CONFIG[type as string];
  if (!cfg) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.subBackdrop} onPress={onClose}>
        <Pressable style={styles.subCard} onPress={() => { }}>

          <View style={styles.subIconWrap}>
            <View style={[styles.subIconBox, { backgroundColor: cfg.color + '15' }]}>
              <Ionicons name={cfg.icon as any} size={30} color={cfg.color} />
            </View>
          </View>

          <Text style={styles.subTitle}>{cfg.title}</Text>
          <Text style={styles.subDesc}>{cfg.desc}</Text>

          <SubContent type={type} />

          <View style={styles.subBtns}>
            <Pressable style={styles.subCancelBtn} onPress={onClose}>
              <Text style={styles.subCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.subConfirmBtn, { backgroundColor: cfg.color }]} onPress={onDismiss}>
              <Text style={styles.subConfirmText}>Continuar</Text>
            </Pressable>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SubContent({ type }: { type: SubType }) {
  if (type === 'url') {
    return (
      <View style={styles.inputRow}>
        <Ionicons name="link-outline" size={16} color="#844A31" />
        <TextInput
          style={styles.inputField}
          placeholder="https://..."
          placeholderTextColor="#9ca3af"
        />
      </View>
    );
  }

  if (type === 'prediseñados') {
    return (
      <View style={styles.templateList}>
        {['Biología General', 'Historia de España', 'Matemáticas Básicas'].map(t => (
          <Pressable key={t} style={styles.templateRow}>
            <View style={styles.templateDot} />
            <Text style={styles.templateText}>{t}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (type === 'texto-ia' || type === 'texto-pdf') {
    return (
      <View style={styles.dropZone}>
        <Ionicons name="cloud-upload-outline" size={30} color="#844A31" style={{ opacity: 0.45 }} />
        <Text style={styles.dropText}>Toca para seleccionar archivo o pegar texto</Text>
      </View>
    );
  }

  if (type === 'sloth-ia') {
    return (
      <View style={styles.textAreaBox}>
        <TextInput
          style={styles.textAreaField}
          placeholder="Describe el tema..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  backdropFull: { flex: 1 },
  modalCloseTop: {
    position: 'absolute', top: 52, right: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(65,46,46,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(65,46,46,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fdfaf7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.08)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(87,29,17,0.15)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#d7b59f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#412E2E',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: '#844A31',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.65,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(87,29,17,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionDot: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  cardRowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: '#412E2E',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardSub: {
    color: '#844A31',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(87,29,17,0.07)',
    marginVertical: 18,
  },
  subBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(65,46,46,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  subCard: {
    backgroundColor: '#fdfaf7',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.06)',
  },
  subIconWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  subIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    color: '#412E2E',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subDesc: {
    color: '#844A31',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.7,
    marginBottom: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(87,29,17,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.10)',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputField: {
    flex: 1,
    color: '#412E2E',
    fontSize: 14,
  },
  templateList: {
    gap: 8,
    marginBottom: 20,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(83,181,94,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(83,181,94,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  templateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#53b55e',
  },
  templateText: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '500',
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(132,74,49,0.25)',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(132,74,49,0.02)',
    marginBottom: 20,
  },
  dropText: {
    color: '#844A31',
    fontSize: 13,
    opacity: 0.65,
    textAlign: 'center',
  },
  textAreaBox: {
    backgroundColor: 'rgba(83,181,94,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(83,181,94,0.14)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
    marginBottom: 20,
  },
  textAreaField: {
    color: '#412E2E',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  subBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  subCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 500,
    backgroundColor: 'rgba(87,29,17,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCancelText: {
    color: '#844A31',
    fontSize: 14,
    fontWeight: '600',
  },
  subConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subConfirmText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
