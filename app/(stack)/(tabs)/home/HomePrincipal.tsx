import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, Image, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { getCategorias } from '@/core/categorias/actions/get-categorias';
import { getQuizzes } from '@/core/quizzes/actions/get-quizzes';
import { getCursos, getCursosByProfesor } from '@/core/cursos/actions/get-cursos';
import { Categoria } from '@/core/auth/interface/categoria';
import { QuizResumen } from '@/core/auth/interface/quiz';
import { CursoResumen } from '@/core/auth/interface/curso';

const ACCENT_COLORS = ['#53B55E', '#844A31', '#571D11', '#2D7A3A', '#6B2A1A'];
const ACCENT_BG    = [
  'rgba(83,181,94,0.1)', 'rgba(132,74,49,0.1)',
  'rgba(87,29,17,0.1)',  'rgba(45,122,58,0.1)', 'rgba(107,42,26,0.1)',
];
const QUIZ_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'leaf-outline', 'time-outline', 'calculator-outline', 'planet-outline', 'shield-outline',
];
const CLASS_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'book-outline', 'school-outline', 'flask-outline', 'stats-chart-outline',
];

function QuizCard({ quiz, idx }: { quiz: QuizResumen; idx: number }) {
  const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
  const bg    = ACCENT_BG[idx % ACCENT_BG.length];
  const icon  = QUIZ_ICONS[idx % QUIZ_ICONS.length];
  return (
    <View style={styles.quizCard}>
      <View style={[styles.quizIconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.quizInfo}>
        <Text style={styles.quizTitle} numberOfLines={2}>{quiz.titulo}</Text>
        <Text style={styles.quizSub} numberOfLines={1}>
          {quiz.categoria?.nombre ?? '—'}
        </Text>
      </View>
      <View style={[styles.quizBar, { backgroundColor: color }]} />
    </View>
  );
}

function ClassCard({ curso, idx }: { curso: CursoResumen; idx: number }) {
  const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
  const bg    = ACCENT_BG[idx % ACCENT_BG.length];
  const icon  = CLASS_ICONS[idx % CLASS_ICONS.length];
  return (
    <View style={styles.classCard}>
      <View style={styles.classCardDivider} />
      <Text style={styles.classCardName} numberOfLines={2}>{curso.nombre}</Text>
      <View style={[styles.classCardFooter, { backgroundColor: bg }]}>
        <View style={[styles.classCardIcon, { backgroundColor: color + '33' }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
      </View>
    </View>
  );
}

export default function HomePrincipal() {
  const { user } = useAuthStore();
  const esProfesor = user?.rol === 'profesor';

  const [search,      setSearch]      = useState('');
  const [code,        setCode]        = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [categories,  setCategories]  = useState<Categoria[]>([]);
  const [cursos,      setCursos]      = useState<CursoResumen[]>([]);
  const [quizzes,     setQuizzes]     = useState<QuizResumen[]>([]);

  useEffect(() => {
    getCategorias().then(setCategories).catch(() => {});
    if (esProfesor && user?.id) {
      getCursosByProfesor(user.id).then(setCursos).catch(() => {});
    } else {
      getCursos().then(setCursos).catch(() => {});
    }
    getQuizzes().then(setQuizzes).catch(() => {});
  }, []);

  const handleCatSelect = (id: number | null) => {
    setSelectedCat(id);
    getQuizzes(id ?? undefined).then(setQuizzes).catch(() => {});
  };

  const displayName = user?.nombre ?? (esProfesor ? 'Profesor' : 'Alumno');
  const rolLabel    = esProfesor ? 'Profesor' : 'Alumno';

  return (
    <ImageBackground
      source={require('@/assets/sloth.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ opacity: 0.55 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Image
                source={require('@/assets/icono-perfil.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.headerName}>{displayName}</Text>
              <Text style={styles.headerRole}>{rolLabel}</Text>
            </View>
          </View>
          <Ionicons name="notifications-outline" size={22} color="#571D11" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscador"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.quizzesSection}>
            <Text style={styles.catsTitle}>Categorías</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContent}
            >
              <Pressable
                onPress={() => handleCatSelect(null)}
                style={[styles.chip, selectedCat === null ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={styles.chipText}>Todas</Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCatSelect(cat.id)}
                  style={[styles.chip, selectedCat === cat.id ? styles.chipActive : styles.chipInactive]}
                >
                  <Text style={styles.chipText}>{cat.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quizCardsContent}
            >
              {quizzes.length === 0 ? (
                <Text style={styles.emptyLight}>Sin quizzes en esta categoría</Text>
              ) : (
                quizzes.map((q, i) => <QuizCard key={q.id} quiz={q} idx={i} />)
              )}
            </ScrollView>
          </View>

          <View style={styles.codeSection}>
            <View style={styles.codeInputRow}>
              <TextInput
                style={styles.codeInput}
                placeholder="Introducir código de participación"
                placeholderTextColor="rgba(132,74,49,0.5)"
                value={code}
                onChangeText={setCode}
              />
              <Ionicons name="qr-code-outline" size={20} color="#844A31" />
            </View>
            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Unirse al juego</Text>
            </Pressable>
          </View>

          <View style={styles.classesSection}>
            <Text style={styles.classesSectionTitle}>Tus clases</Text>
            {cursos.length === 0 ? (
              <Text style={styles.emptyDark}>Sin clases asignadas</Text>
            ) : (
              <View style={styles.classGrid}>
                {cursos.slice(0, 4).map((c, i) => (
                  <ClassCard key={c.id} curso={c} idx={i} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#d7b59f',
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerName: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  headerRole: {
    color: '#844A31',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(132,74,49,1)',
    borderWidth: 2,
    borderColor: 'rgba(83,181,94,0.7)',
  },
  searchBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    height: 38,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#571D11',
    shadowColor: 'rgba(87,29,17,0.35)',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quizzesSection: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#571D11',
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: 'rgba(87,29,17,0.3)',
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  catsTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  chipsContent: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'center',
    height: 34,
    marginBottom: 10,
  },
  chip: {
    height: 28,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: 'rgba(87,17,17,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipInactive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quizCardsContent: {
    paddingHorizontal: 14,
    gap: 10,
  },
  quizCard: {
    width: 120,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(253,250,247,0.95)',
    overflow: 'hidden',
    padding: 8,
    justifyContent: 'space-between',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  quizIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizInfo: {
    flex: 1,
    paddingTop: 2,
  },
  quizTitle: {
    color: '#412E2E',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
  },
  quizSub: {
    color: '#844A31',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 2,
  },
  quizBar: {
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: -8,
    marginBottom: -8,
  },
  emptyLight: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  codeSection: {
    marginHorizontal: 40,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(232,210,192,0.92)',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
    shadowColor: 'rgba(87,29,17,0.2)',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  codeInputRow: {
    flexDirection: 'row',
    height: 42,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(132,74,49,0.3)',
    backgroundColor: 'rgba(255,245,238,0.7)',
  },
  codeInput: {
    flex: 1,
    height: '100%',
    color: '#412E2E',
    fontSize: 13,
  },
  joinButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(87,29,17,1)',
  },
  joinButtonText: {
    color: 'rgba(234,243,246,1)',
    fontSize: 14,
    fontWeight: '600',
  },
  classesSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(248,238,238,0.85)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: 'rgba(87,29,17,0.06)',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  classesSectionTitle: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  classCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(207,194,183,0.5)',
    backgroundColor: 'rgba(232,221,213,1)',
    overflow: 'hidden',
  },
  classCardDivider: {
    height: 1,
    marginHorizontal: 8,
    backgroundColor: 'rgba(207,194,183,0.5)',
  },
  classCardName: {
    color: '#412E2E',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
    lineHeight: 16.5,
  },
  classCardFooter: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDark: {
    color: '#844A31',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
    opacity: 0.7,
  },
});
