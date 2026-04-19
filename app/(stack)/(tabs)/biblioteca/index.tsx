import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal,
  TextInput, Pressable, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { getMisQuizzes, eliminarQuiz } from '@/core/quizzes/actions/get-quizzes';
import { QuizResumen } from '@/core/auth/interface/quiz';
import { Coleccion } from '@/core/auth/interface/biblioteca';

type Tab = 'biblioteca' | 'colecciones';
type Filtro = 'todos' | 'quizzes' | 'apuntes';

const COLECCIONES: Coleccion[] = [];

const DIFICULTAD_COLOR: Record<string, string> = {
  facil:   '#24833D',
  normal:  '#844A31',
  dificil: '#c1623e',
  extremo: '#571D11',
};

export default function BibliotecaScreen() {
  const { user } = useAuthStore();
  const [tab, setTab]       = useState<Tab>('biblioteca');
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [quizzes, setQuizzes] = useState<QuizResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [menuQuiz, setMenuQuiz] = useState<QuizResumen | null>(null);

  const cargarQuizzes = useCallback(() => {
    if (!user) return;
    setCargando(true);
    getMisQuizzes()
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setCargando(false));
  }, [user]);

  useEffect(() => {
    cargarQuizzes();
  }, [cargarQuizzes]);

  const handleOpciones = (quiz: QuizResumen) => setMenuQuiz(quiz);

  const handleEditar = () => {
    if (!menuQuiz) return;
    setMenuQuiz(null);
    router.push(`/crear-quiz/editar?id=${menuQuiz.id}`);
  };

  const handleEliminar = () => {
    if (!menuQuiz) return;
    const quiz = menuQuiz;
    setMenuQuiz(null);
    Alert.alert(
      'Eliminar quiz',
      `¿Seguro que quieres eliminar "${quiz.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await eliminarQuiz(quiz.id);
            } catch { /* si ya no existe en el servidor, ignorar */ }
            setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
          },
        },
      ]
    );
  };

  const quizzesFiltrados = quizzes.filter(q =>
    q.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi biblioteca</Text>
      </View>

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

      <View style={styles.tabRow}>
        <Pressable style={styles.tabItem} onPress={() => setTab('biblioteca')}>
          <Text style={[styles.tabLabel, tab === 'biblioteca' && styles.tabLabelActive]}>
            Mi biblioteca
          </Text>
          {tab === 'biblioteca' && <View style={styles.tabBar} />}
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => setTab('colecciones')}>
          <Text style={[styles.tabLabel, tab === 'colecciones' && styles.tabLabelActive]}>
            Colecciones
          </Text>
          {tab === 'colecciones' && <View style={styles.tabBar} />}
        </Pressable>
      </View>

      <View style={styles.contentArea}>
        {tab === 'biblioteca' ? (
          <TabBiblioteca
            quizzes={quizzesFiltrados}
            cargando={cargando}
            filtro={filtro}
            onFiltro={setFiltro}
            onOpciones={handleOpciones}
          />
        ) : (
          <TabColecciones colecciones={COLECCIONES} />
        )}
      </View>

      <Modal
        visible={menuQuiz !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuQuiz(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuQuiz(null)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            {menuQuiz && (
              <Text style={styles.sheetTitle} numberOfLines={2}>
                {menuQuiz.titulo}
              </Text>
            )}
            <Pressable style={styles.sheetOption} onPress={handleEditar}>
              <View style={[styles.sheetIconCircle, { backgroundColor: '#f0e8e3' }]}>
                <Ionicons name="create-outline" size={20} color="#571D11" />
              </View>
              <Text style={styles.sheetOptionText}>Editar quiz</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.4)" />
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable style={styles.sheetOption} onPress={handleEliminar}>
              <View style={[styles.sheetIconCircle, { backgroundColor: '#fdecea' }]}>
                <Ionicons name="trash-outline" size={20} color="#c0392b" />
              </View>
              <Text style={[styles.sheetOptionText, { color: '#c0392b' }]}>Eliminar quiz</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(192,57,43,0.4)" />
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setMenuQuiz(null)}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function TabBiblioteca({
  quizzes, cargando, filtro, onFiltro, onOpciones,
}: {
  quizzes: QuizResumen[];
  cargando: boolean;
  filtro: Filtro;
  onFiltro: (f: Filtro) => void;
  onOpciones: (q: QuizResumen) => void;
}) {
  const items = filtro === 'apuntes' ? [] : filtro === 'quizzes' ? quizzes : quizzes;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.filtroRow}>
        {(['todos', 'quizzes', 'apuntes'] as Filtro[]).map(f => (
          <Pressable
            key={f}
            style={[styles.filtroChip, filtro === f && styles.filtroChipActive]}
            onPress={() => onFiltro(f)}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#844A31" />
      ) : filtro === 'apuntes' ? (
        <EmptyState
          message="No tienes apuntes aún"
          sub="Crea tu primer apunte desde el botón central"
        />
      ) : items.length === 0 ? (
        <EmptyState
          message="No tienes nada aún en la biblioteca"
          sub="Aquí aparecerán tus quizzes y apuntes cuando los crees"
          showFindButton
        />
      ) : (
        items.map(q => (
          <QuizCard key={q.id} quiz={q} onOpciones={onOpciones} />
        ))
      )}
    </ScrollView>
  );
}

function QuizCard({ quiz, onOpciones }: { quiz: QuizResumen; onOpciones: (q: QuizResumen) => void }) {
  const dificultadColor = DIFICULTAD_COLOR[quiz.dificultad] ?? '#844A31';

  return (
    <View style={styles.card}>
      <View style={styles.cardThumb}>
        <Ionicons name="help-circle-outline" size={28} color="rgba(255,255,255,0.6)" />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{quiz.titulo}</Text>
        <View style={styles.cardMetaRow}>
          <Text style={[styles.cardMetaTag, { color: dificultadColor }]}>
            {quiz.dificultad}
          </Text>
          <Text style={styles.cardDot}>•</Text>
          <Text style={styles.cardMetaTag}>
            {quiz.categoria?.nombre ?? 'Sin categoría'}
          </Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMetaTag}>
            {quiz.numPreguntas ?? 0} preguntas
          </Text>
          <Text style={styles.cardDot}>•</Text>
        </View>
      </View>

      <Pressable
        style={styles.cardMenu}
        onPress={() => onOpciones(quiz)}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#412E2E" />
      </Pressable>
    </View>
  );
}

function TabColecciones({ colecciones }: { colecciones: Coleccion[] }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable style={styles.createRow}>
        <View style={styles.createIcon}>
          <Ionicons name="add-outline" size={20} color="#412E2E" />
        </View>
        <Text style={styles.createLabel}>Crear una nueva colección</Text>
      </Pressable>
      <View style={styles.divider} />

      {colecciones.length === 0 ? (
        <EmptyState
          message="No tienes ninguna colección aún"
          sub="Agrupa tus quizzes y apuntes para organizarlos mejor"
        />
      ) : (
        colecciones.map(col => <ColeccionRow key={col.id} col={col} />)
      )}
    </ScrollView>
  );
}

function ColeccionRow({ col }: { col: Coleccion }) {
  return (
    <Pressable style={styles.colRow}>
      <Text style={styles.colNombre}>{col.nombre}</Text>
      <View style={styles.colRight}>
        <Text style={styles.colCount}>{col.cantidad}</Text>
        <Ionicons name="chevron-forward" size={16} color="#412E2E" />
      </View>
    </Pressable>
  );
}

function EmptyState({ message, sub, showFindButton }: {
  message: string;
  sub: string;
  showFindButton?: boolean;
}) {
  return (
    <View style={styles.emptyState}>
      <Image
        source={require('@/assets/sloth-triste.png')}
        style={styles.sloth}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>{message}</Text>
      <Text style={styles.emptySubtitle}>{sub}</Text>
      {showFindButton && (
        <Pressable style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Explorar quizzes</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#d7b59f',
  },
  header: {
    height: 52,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#412E2E',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
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
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(87,29,17,0.15)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(87,29,17,0.45)',
  },
  tabLabelActive: {
    color: '#571D11',
  },
  tabBar: {
    height: 2,
    width: '60%',
    borderRadius: 2,
    backgroundColor: '#571D11',
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'rgba(217,217,217,1)',
  },
  filtroRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  filtroChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(65,46,46,0.25)',
    backgroundColor: 'transparent',
  },
  filtroChipActive: {
    backgroundColor: '#571D11',
    borderColor: '#571D11',
  },
  filtroText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#412E2E',
  },
  filtroTextActive: {
    color: 'white',
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  createIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#412E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createLabel: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(65,46,46,0.12)',
    marginHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(65,46,46,0.08)',
    backgroundColor: 'rgba(217,217,217,1)',
  },
  cardThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#6b6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardMetaTag: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
  cardDot: {
    color: '#555',
    fontSize: 12,
  },
  cardMenu: {
    padding: 4,
  },
  colRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(65,46,46,0.08)',
  },
  colNombre: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '600',
  },
  colRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colCount: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 32,
    gap: 10,
  },
  sloth: {
    width: 220,
    height: 165,
  },
  emptyTitle: {
    color: '#412E2E',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#844A31',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  btnSecondary: {
    marginTop: 4,
    height: 40,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#571D11',
  },
  btnSecondaryText: {
    color: '#571D11',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(65,46,46,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#412E2E',
    marginBottom: 16,
    opacity: 0.7,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#412E2E',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(65,46,46,0.08)',
  },
  sheetCancel: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#412E2E',
  },
});
