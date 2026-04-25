import AppAlert from '@/components/AppAlert';
import PantallaInvitado from '@/components/PantallaInvitadoPlantilla';
import QuizOpcionesModal from '@/components/QuizOpcionesModal';
import { eliminarApunte, getMisApuntes } from '@/core/apuntes/actions/apuntes';
import { ApunteResumen } from '@/core/auth/interface/apunte';
import { QuizResumen } from '@/core/auth/interface/quiz';
import { añadirQuizAColeccion, ColeccionDTO, crearColeccion, eliminarColeccion, getMisColecciones, renombrarColeccion } from '@/core/colecciones/actions/colecciones';
import { eliminarQuiz, getMisQuizzes } from '@/core/quizzes/actions/get-quizzes';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'biblioteca' | 'colecciones';
type Filtro = 'todos' | 'quizzes' | 'apuntes';

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: '#24833D',
  normal: '#844A31',
  dificil: '#c1623e',
  extremo: '#571D11',
};

export default function BibliotecaScreen() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('biblioteca');
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [quizzes, setQuizzes] = useState<QuizResumen[]>([]);
  const [apuntes, setApuntes] = useState<ApunteResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [menuQuiz, setMenuQuiz] = useState<QuizResumen | null>(null);
  const [quizOpciones, setQuizOpciones] = useState<QuizResumen | null>(null);
  const [colecciones, setColecciones] = useState<ColeccionDTO[]>([]);
  const [modalNuevaCol, setModalNuevaCol] = useState(false);
  const [nombreNuevaCol, setNombreNuevaCol] = useState('');
  const [creandoCol, setCreandoCol] = useState(false);
  const [modalAgregarCol, setModalAgregarCol] = useState(false);
  const [menuColeccion, setMenuColeccion] = useState<ColeccionDTO | null>(null);
  const [modalRenombrar, setModalRenombrar] = useState(false);
  const [nuevoNombreCol, setNuevoNombreCol] = useState('');
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje?: string; botones?: any[] }>({ visible: false, titulo: '' });
  const cerrarAlerta = () => setAlerta(p => ({ ...p, visible: false }));

  const cargarQuizzes = useCallback(() => {
    if (!user) return;
    setCargando(true);
    Promise.all([
      getMisQuizzes().catch(() => [] as QuizResumen[]),
      getMisApuntes().catch(() => [] as ApunteResumen[]),
    ]).then(([q, a]) => {
      setQuizzes(q);
      setApuntes(a);
    }).finally(() => setCargando(false));
  }, [user]);

  const cargarColecciones = useCallback(() => {
    if (!user) return;
    getMisColecciones().then(setColecciones).catch(() => { });
  }, [user]);

  useEffect(() => {
    cargarQuizzes();
  }, [cargarQuizzes]);

  useFocusEffect(useCallback(() => {
    cargarColecciones();
  }, [cargarColecciones]));

  const handleCrearColeccion = async () => {
    if (!nombreNuevaCol.trim()) return;
    setCreandoCol(true);
    try {
      const col = await crearColeccion(nombreNuevaCol.trim());
      setColecciones(prev => [...prev, col]);
      setNombreNuevaCol('');
      setModalNuevaCol(false);
    } catch {
      Alert.alert('Error', 'No se pudo crear la colección.');
    } finally {
      setCreandoCol(false);
    }
  };

  const handleOpciones = (quiz: QuizResumen) => setMenuQuiz(quiz);
  const handleJugar = (quiz: QuizResumen) => setQuizOpciones(quiz);

  const handleEditar = () => {
    if (!menuQuiz) return;
    setMenuQuiz(null);
    router.push(`/crear-quiz/editar?id=${menuQuiz.id}`);
  };

  const handleAgregarAColeccion = async (coleccionId: number) => {
    if (!menuQuiz) return;
    try {
      await añadirQuizAColeccion(coleccionId, menuQuiz.id);
      setColecciones(prev => prev.map(c =>
        c.id === coleccionId ? { ...c, cantidad: c.cantidad + 1 } : c
      ));
      setModalAgregarCol(false);
      setMenuQuiz(null);
      Alert.alert('¡Listo!', 'Quiz añadido a la colección.');
    } catch {
      Alert.alert('Error', 'No se pudo añadir el quiz a la colección.');
    }
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

  const handleLongPressColeccion = (col: ColeccionDTO) => {
    setMenuColeccion(col);
  };

  const handleEliminarColeccion = () => {
    if (!menuColeccion) return;
    const col = menuColeccion;
    setMenuColeccion(null);
    setAlerta({
      visible: true,
      titulo: 'Eliminar colección',
      mensaje: `¿Seguro que quieres eliminar "${col.nombre}"? Se eliminará la colección pero no su contenido.`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrarAlerta },
        {
          texto: 'Eliminar', estilo: 'destructivo', onPress: async () => {
            cerrarAlerta();
            try { await eliminarColeccion(col.id); } catch { /* ignorar */ }
            setColecciones(prev => prev.filter(c => c.id !== col.id));
          },
        },
      ],
    });
  };

  const handleRenombrarColeccion = async () => {
    if (!menuColeccion || !nuevoNombreCol.trim()) return;
    try {
      const actualizada = await renombrarColeccion(menuColeccion.id, nuevoNombreCol.trim());
      setColecciones(prev => prev.map(c => c.id === actualizada.id ? actualizada : c));
      setModalRenombrar(false);
      setMenuColeccion(null);
      setNuevoNombreCol('');
    } catch {
      Alert.alert('Error', 'No se pudo renombrar la colección.');
    }
  };

  const handleEliminarApunte = (apunte: ApunteResumen) => {
    Alert.alert(
      'Eliminar apunte',
      `¿Seguro que quieres eliminar "${apunte.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try { await eliminarApunte(apunte.id); } catch { /* ignorar */ }
            setApuntes(prev => prev.filter(a => a.id !== apunte.id));
          },
        },
      ]
    );
  };

  const quizzesFiltrados = quizzes.filter(q =>
    q.titulo.toLowerCase().includes(search.toLowerCase())
  );
  const apuntesFiltrados = apuntes.filter(a =>
    a.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return (
    <PantallaInvitado
      titulo="Tu biblioteca te espera"
      mensaje="Inicia sesión para guardar tus quizzes, apuntes y colecciones."
    />
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
            apuntes={apuntesFiltrados}
            cargando={cargando}
            filtro={filtro}
            onFiltro={setFiltro}
            onOpciones={handleOpciones}
            onJugar={handleJugar}
            onEliminarApunte={handleEliminarApunte}
          />
        ) : (
          <TabColecciones
            colecciones={colecciones}
            modalVisible={modalNuevaCol}
            onAbrirModal={() => setModalNuevaCol(true)}
            onCerrarModal={() => setModalNuevaCol(false)}
            nombre={nombreNuevaCol}
            onNombre={setNombreNuevaCol}
            onCrear={handleCrearColeccion}
            creando={creandoCol}
            onLongPress={handleLongPressColeccion}
          />
        )}
      </View>

      <Modal
        visible={menuQuiz !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuQuiz(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuQuiz(null)}>
          <Pressable style={styles.bottomSheet} onPress={() => { }}>
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
            <Pressable style={styles.sheetOption} onPress={() => { setMenuQuiz(menuQuiz); setModalAgregarCol(true); }}>
              <View style={[styles.sheetIconCircle, { backgroundColor: '#e8f0e3' }]}>
                <Ionicons name="folder-open-outline" size={20} color="#24833D" />
              </View>
              <Text style={styles.sheetOptionText}>Agregar a colección</Text>
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
      {/* Menú colección (long press) */}
      <Modal visible={menuColeccion !== null} transparent animationType="slide" onRequestClose={() => setMenuColeccion(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuColeccion(null)}>
          <Pressable style={styles.bottomSheet} onPress={() => { }}>
            <View style={styles.sheetHandle} />
            {menuColeccion && <Text style={styles.sheetTitle} numberOfLines={1}>{menuColeccion.nombre}</Text>}
            <Pressable style={styles.sheetOption} onPress={() => {
              setNuevoNombreCol(menuColeccion?.nombre ?? '');
              setModalRenombrar(true);
            }}>
              <View style={[styles.sheetIconCircle, { backgroundColor: '#f0e8e3' }]}>
                <Ionicons name="create-outline" size={20} color="#571D11" />
              </View>
              <Text style={styles.sheetOptionText}>Renombrar colección</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.4)" />
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable style={styles.sheetOption} onPress={handleEliminarColeccion}>
              <View style={[styles.sheetIconCircle, { backgroundColor: '#fdecea' }]}>
                <Ionicons name="trash-outline" size={20} color="#c0392b" />
              </View>
              <Text style={[styles.sheetOptionText, { color: '#c0392b' }]}>Eliminar colección</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(192,57,43,0.4)" />
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setMenuColeccion(null)}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal renombrar */}
      <Modal visible={modalRenombrar} transparent animationType="slide" onRequestClose={() => setModalRenombrar(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalRenombrar(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => { }}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Renombrar colección</Text>
            <TextInput
              style={styles.colInput}
              placeholder="Nuevo nombre"
              placeholderTextColor="#9ca3af"
              value={nuevoNombreCol}
              onChangeText={setNuevoNombreCol}
              autoFocus
            />
            <Pressable
              style={[styles.colCrearBtn, !nuevoNombreCol.trim() && { opacity: 0.4 }]}
              onPress={handleRenombrarColeccion}
              disabled={!nuevoNombreCol.trim()}
            >
              <Text style={styles.colCrearBtnText}>Guardar</Text>
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setModalRenombrar(false)}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={modalAgregarCol}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAgregarCol(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalAgregarCol(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => { }}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Agregar a colección</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {colecciones.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#844A31', opacity: 0.7, paddingVertical: 20 }}>
                  No tienes colecciones. Créalas desde la pestaña Colecciones.
                </Text>
              ) : (
                colecciones.map(col => (
                  <Pressable key={col.id} style={styles.sheetOption} onPress={() => handleAgregarAColeccion(col.id)}>
                    <View style={[styles.sheetIconCircle, { backgroundColor: '#e8f0e3' }]}>
                      <Ionicons name="folder-outline" size={20} color="#24833D" />
                    </View>
                    <Text style={styles.sheetOptionText}>{col.nombre}</Text>
                    <Text style={{ color: '#844A31', fontSize: 13 }}>{col.cantidad}</Text>
                    <Ionicons name="chevron-forward" size={16} color="rgba(65,46,46,0.4)" />
                  </Pressable>
                ))
              )}
            </ScrollView>
            <Pressable style={styles.sheetCancel} onPress={() => setModalAgregarCol(false)}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <AppAlert
        visible={alerta.visible}
        variante="peligro"
        titulo={alerta.titulo}
        mensaje={alerta.mensaje}
        botones={alerta.botones}
        onClose={cerrarAlerta}
      />
      <QuizOpcionesModal
        visible={quizOpciones !== null}
        quizId={quizOpciones?.id ?? null}
        quizTitulo={quizOpciones?.titulo}
        esCreador
        onClose={() => setQuizOpciones(null)}
      />
    </SafeAreaView>
  );
}

function TabBiblioteca({
  quizzes, apuntes, cargando, filtro, onFiltro, onOpciones, onJugar, onEliminarApunte,
}: {
  quizzes: QuizResumen[];
  apuntes: ApunteResumen[];
  cargando: boolean;
  filtro: Filtro;
  onFiltro: (f: Filtro) => void;
  onOpciones: (q: QuizResumen) => void;
  onJugar: (q: QuizResumen) => void;
  onEliminarApunte: (a: ApunteResumen) => void;
}) {
  const showQuizzes = filtro === 'todos' || filtro === 'quizzes';
  const showApuntes = filtro === 'todos' || filtro === 'apuntes';
  const empty = (showQuizzes ? quizzes.length : 0) + (showApuntes ? apuntes.length : 0) === 0;

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
      ) : empty ? (
        <EmptyState
          message={filtro === 'apuntes' ? 'No tienes apuntes aún' : 'No tienes nada aún en la biblioteca'}
          sub={filtro === 'apuntes' ? 'Crea tu primer apunte desde el botón central' : 'Aquí aparecerán tus quizzes y apuntes cuando los crees'}
          showFindButton={filtro !== 'apuntes'}
        />
      ) : (
        <>
          {showQuizzes && quizzes.map(q => (
            <QuizCard key={`quiz-${q.id}`} quiz={q} onOpciones={onOpciones} onJugar={onJugar} />
          ))}
          {showApuntes && apuntes.map(a => (
            <ApunteCard key={`apunte-${a.id}`} apunte={a} onEliminar={onEliminarApunte} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function ApunteCard({ apunte, onEliminar }: { apunte: ApunteResumen; onEliminar: (a: ApunteResumen) => void }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/crear-apunte/editar?id=${apunte.id}` as any)}>
      <View style={[styles.cardThumb, { backgroundColor: 'rgba(83,181,94,0.15)', alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="document-text-outline" size={28} color="#24833D" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{apunte.titulo}</Text>
        <View style={styles.cardMetaRow}>
          <Ionicons name="sparkles-outline" size={11} color="#53b55e" />
          <Text style={[styles.cardMetaTag, { color: '#24833D' }]}>Apuntes</Text>
        </View>
      </View>
      <Pressable
        style={styles.cardMenu}
        onPress={() => Alert.alert(apunte.titulo, '¿Qué quieres hacer?', [
          { text: 'Editar', onPress: () => router.push(`/crear-apunte/editar?id=${apunte.id}` as any) },
          { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(apunte) },
          { text: 'Cancelar', style: 'cancel' },
        ])}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#412E2E" />
      </Pressable>
    </Pressable>
  );
}

function QuizCard({ quiz, onOpciones, onJugar }: { quiz: QuizResumen; onOpciones: (q: QuizResumen) => void; onJugar: (q: QuizResumen) => void }) {
  const dificultadColor = DIFICULTAD_COLOR[quiz.dificultad] ?? '#844A31';

  return (
    <Pressable style={styles.card} onPress={() => onJugar(quiz)}>
      <Image source={require('@/assets/imagen-quizz-foto.png')} style={styles.cardThumb} />

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
        onPress={(e) => { e.stopPropagation(); onOpciones(quiz); }}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#412E2E" />
      </Pressable>
    </Pressable>
  );
}

function TabColecciones({
  colecciones, modalVisible, onAbrirModal, onCerrarModal,
  nombre, onNombre, onCrear, creando, onLongPress,
}: {
  colecciones: ColeccionDTO[];
  modalVisible: boolean;
  onAbrirModal: () => void;
  onCerrarModal: () => void;
  nombre: string;
  onNombre: (v: string) => void;
  onCrear: () => void;
  creando: boolean;
  onLongPress: (col: ColeccionDTO) => void;
}) {
  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.createRow} onPress={onAbrirModal}>
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
          colecciones.map(col => <ColeccionRow key={col.id} col={col} onLongPress={onLongPress} />)
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={onCerrarModal}>
        <Pressable style={styles.modalOverlay} onPress={onCerrarModal}>
          <Pressable style={styles.bottomSheet} onPress={() => { }}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Nueva colección</Text>
            <TextInput
              style={styles.colInput}
              placeholder="Nombre de la colección"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={onNombre}
              autoFocus
            />
            <Pressable
              style={[styles.colCrearBtn, !nombre.trim() && { opacity: 0.4 }]}
              onPress={onCrear}
              disabled={!nombre.trim() || creando}
            >
              {creando
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={styles.colCrearBtnText}>Crear colección</Text>
              }
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={onCerrarModal}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ColeccionRow({ col, onLongPress }: { col: ColeccionDTO; onLongPress: (col: ColeccionDTO) => void }) {
  return (
    <Pressable
      style={styles.colRow}
      onPress={() => router.push({ pathname: '/(stack)/coleccion/[id]', params: { id: col.id, nombre: col.nombre } } as any)}
      onLongPress={() => onLongPress(col)}
    >
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
    overflow: 'hidden',
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
  colInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(65,46,46,0.2)',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#412E2E',
    marginBottom: 12,
  },
  colCrearBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#571D11',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  colCrearBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
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
