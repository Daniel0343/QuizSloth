import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, Image, ImageBackground,
  Modal, ActivityIndicator, FlatList,
} from 'react-native';
import AppAlert from '@/components/AppAlert';
import QrScanner from '@/components/QrScanner';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useThemeStore } from '@/presentation/theme/useThemeStore';
import { getCategorias, crearCategoria, eliminarCategoria } from '@/core/categorias/actions/get-categorias';
import { getQuizzes } from '@/core/quizzes/actions/get-quizzes';
import { getMisCursos } from '@/core/cursos/actions/get-cursos';
import { Categoria } from '@/core/auth/interface/categoria';
import { QuizResumen } from '@/core/auth/interface/quiz';
import { CursoResumen } from '@/core/auth/interface/curso';
import QuizOpcionesModal from '@/components/QuizOpcionesModal';
import QuizCard, { CARD_COLORS } from '@/components/QuizCard';
import ClassCard from '@/components/ClassCard';

export default function HomePrincipal() {
  const { user } = useAuthStore();
  const esProfesor = user?.rol === 'profesor';

  const [search,        setSearch]        = useState('');
  const [code,          setCode]          = useState('');
  const [qrVisible,     setQrVisible]     = useState(false);
  const [selectedCat,   setSelectedCat]   = useState<number | null>(null);
  const [categories,    setCategories]    = useState<Categoria[]>([]);
  const [cursos,        setCursos]        = useState<CursoResumen[]>([]);
  const [quizzes,       setQuizzes]       = useState<QuizResumen[]>([]);
  const [modalCat,      setModalCat]      = useState(false);
  const [nuevaCat,      setNuevaCat]      = useState('');
  const [guardandoCat,  setGuardandoCat]  = useState(false);
  const [eliminandoCat, setEliminandoCat] = useState<number | null>(null);
  const [quizOpciones, setQuizOpciones] = useState<QuizResumen | null>(null);
  const [todosLosQuizzes, setTodosLosQuizzes] = useState<QuizResumen[]>([]);
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje?: string; variante?: 'peligro'|'exito'|'info'; botones?: any[] }>({ visible: false, titulo: '' });
  const cerrar = () => setAlerta(p => ({ ...p, visible: false }));

  useFocusEffect(useCallback(() => {
    getCategorias().then(setCategories).catch(() => {});
    if (user) getMisCursos().then(setCursos).catch(() => {});
    getQuizzes().then(qs => { setQuizzes(qs); setTodosLosQuizzes(qs); }).catch(() => {});
  }, []));

  const resultadosBusqueda = search.length >= 3
    ? todosLosQuizzes.filter(q => q.titulo.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleCrearCategoria = async () => {
    if (!nuevaCat.trim()) return;
    setGuardandoCat(true);
    const cat = await crearCategoria(nuevaCat.trim());
    setGuardandoCat(false);
    if (cat) {
      setCategories(prev => [...prev, cat]);
      setNuevaCat('');
      setModalCat(false);
    } else {
      setAlerta({ visible: true, variante: 'peligro', titulo: 'Error', mensaje: 'No se pudo crear la categoría. Puede que ya exista.' });
    }
  };

  const handleEliminarCategoria = (cat: Categoria) => {
    setAlerta({
      visible: true, variante: 'peligro',
      titulo: 'Eliminar categoría',
      mensaje: `¿Eliminar "${cat.nombre}"? Los quizzes que la usen quedarán sin categoría.`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrar },
        { texto: 'Eliminar', estilo: 'destructivo', onPress: async () => {
          cerrar();
          setEliminandoCat(cat.id);
          const ok = await eliminarCategoria(cat.id);
          setEliminandoCat(null);
          if (ok) {
            setCategories(prev => prev.filter(c => c.id !== cat.id));
            if (selectedCat === cat.id) handleCatSelect(null);
          } else {
            setAlerta({ visible: true, variante: 'peligro', titulo: 'Error', mensaje: 'No se pudo eliminar la categoría.' });
          }
        }},
      ],
    });
  };

  const handleCatSelect = (id: number | null) => {
    setSelectedCat(id);
    getQuizzes(id ?? undefined).then(setQuizzes).catch(() => {});
  };

  const { primaryColor } = useThemeStore();
  const displayName = user?.nombre ?? (esProfesor ? 'Profesor' : 'Alumno');
  const rolLabel    = esProfesor ? 'Profesor' : 'Alumno';

  return (
    <>
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
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.searchWrap}>
            <View style={[styles.searchBar, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
              <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar quizzes..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={17} color="rgba(255,255,255,0.5)" />
                </Pressable>
              )}
            </View>

            {resultadosBusqueda.length > 0 && (
              <View style={styles.searchDropdown}>
                {resultadosBusqueda.map(q => (
                  <Pressable
                    key={q.id}
                    style={styles.searchResultRow}
                    onPress={() => { setSearch(''); setQuizOpciones(q); }}
                  >
                    <View style={[styles.searchResultIcon, { backgroundColor: q.color || CARD_COLORS[q.id % CARD_COLORS.length] }]}>
                      <Text style={styles.searchResultInicialText}>
                        {q.titulo.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>{q.titulo}</Text>
                      {q.categoria?.nombre && (
                        <Text style={styles.searchResultCat}>{q.categoria.nombre}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="rgba(65,46,46,0.3)" />
                  </Pressable>
                ))}
              </View>
            )}

            {search.length >= 3 && resultadosBusqueda.length === 0 && (
              <View style={styles.searchDropdown}>
                <Text style={styles.searchEmpty}>Sin resultados para "{search}"</Text>
              </View>
            )}
          </View>

          <View style={[styles.quizzesSection, { backgroundColor: primaryColor, shadowColor: primaryColor }]}>
            <View style={styles.catsTitleRow}>
              <Text style={styles.catsTitle}>Categorías</Text>
              {esProfesor && (
                <Pressable style={styles.catsAddBtn} onPress={() => setModalCat(true)}>
                  <Ionicons name="add" size={16} color="#412E2E" />
                </Pressable>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
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
                quizzes.map((q, i) => <QuizCard key={q.id} quiz={q} idx={i} onPress={() => setQuizOpciones(q)} />)
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
              <Pressable onPress={() => setQrVisible(true)} hitSlop={8}>
                <Ionicons name="qr-code-outline" size={20} color="#844A31" />
              </Pressable>
            </View>
            <Pressable
              style={[styles.joinButton, !code.trim() && { opacity: 0.5 }]}
              onPress={() => { if (code.trim()) router.push(`/sala/${code.trim().toUpperCase()}` as any); }}
              disabled={!code.trim()}
            >
              <Text style={styles.joinButtonText}>Unirse al juego</Text>
            </Pressable>
          </View>

          <View style={styles.classesSection}>
            <View style={styles.classesSectionHeader}>
              <Text style={styles.classesSectionTitle}>Tus clases</Text>
              {cursos.length > 0 && (
                <Pressable onPress={() => router.push('/(stack)/(tabs)/clase' as any)}>
                  <Text style={styles.classesSectionVerTodas}>Ver todas →</Text>
                </Pressable>
              )}
            </View>
            {cursos.length === 0 ? (
              <View style={styles.emptyClases}>
                <Ionicons name="school-outline" size={32} color="rgba(132,74,49,0.35)" />
                <Text style={styles.emptyDark}>Sin clases asignadas</Text>
                <Pressable
                  style={styles.emptyClasesBtn}
                  onPress={() => router.push('/(stack)/(tabs)/clase' as any)}
                >
                  <Ionicons name="add" size={15} color="white" />
                  <Text style={styles.emptyClasesBtnText}>
                    {esProfesor ? 'Crear una clase' : 'Ver clases'}
                  </Text>
                </Pressable>
              </View>
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

    <Modal visible={modalCat} transparent animationType="fade" onRequestClose={() => setModalCat(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setModalCat(false)}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>Categorías</Text>

          {/* Nueva categoría */}
          <View style={styles.newCatRow}>
            <TextInput
              style={styles.newCatInput}
              placeholder="Nueva categoría..."
              placeholderTextColor="#9ca3af"
              value={nuevaCat}
              onChangeText={setNuevaCat}
            />
            <Pressable
              style={[styles.newCatBtn, !nuevaCat.trim() && { opacity: 0.45 }]}
              onPress={handleCrearCategoria}
              disabled={guardandoCat || !nuevaCat.trim()}
            >
              {guardandoCat
                ? <ActivityIndicator size="small" color="white" />
                : <Ionicons name="add" size={20} color="white" />
              }
            </Pressable>
          </View>

          {/* Lista de categorías existentes */}
          {categories.length > 0 && (
            <FlatList
              data={categories}
              keyExtractor={c => String(c.id)}
              style={styles.catList}
              scrollEnabled={categories.length > 4}
              renderItem={({ item }) => (
                <View style={styles.catRow}>
                  <Text style={styles.catRowName} numberOfLines={1}>{item.nombre}</Text>
                  {item.creadoPorEmail === user?.email && (
                    <Pressable
                      onPress={() => handleEliminarCategoria(item)}
                      disabled={eliminandoCat === item.id}
                      style={styles.catDeleteBtn}
                    >
                      {eliminandoCat === item.id
                        ? <ActivityIndicator size="small" color="#c1623e" />
                        : <Ionicons name="trash-outline" size={16} color="#c1623e" />
                      }
                    </Pressable>
                  )}
                </View>
              )}
            />
          )}

          <Pressable style={styles.modalCancelBtn} onPress={() => { setModalCat(false); setNuevaCat(''); }}>
            <Text style={styles.modalCancelText}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>

    <QuizOpcionesModal
      visible={quizOpciones !== null}
      quizId={quizOpciones?.id ?? null}
      quizTitulo={quizOpciones?.titulo}
      onClose={() => setQuizOpciones(null)}
    />
    <AppAlert
      visible={alerta.visible}
      variante={alerta.variante}
      titulo={alerta.titulo}
      mensaje={alerta.mensaje}
      botones={alerta.botones}
      onClose={cerrar}
    />
    <QrScanner
      visible={qrVisible}
      onClose={() => setQrVisible(false)}
      onScanned={(data) => setCode(data)}
    />
    </>
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
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 12,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
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
  searchDropdown: {
    backgroundColor: '#fdfaf7',
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.08)',
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(87,29,17,0.06)',
  },
  searchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultInicialText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  searchResultTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#412E2E',
  },
  searchResultCat: {
    fontSize: 11,
    color: '#844A31',
    opacity: 0.7,
    marginTop: 1,
  },
  searchEmpty: {
    textAlign: 'center',
    color: 'rgba(65,46,46,0.5)',
    fontSize: 13,
    paddingVertical: 16,
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
  catsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  catsAddBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catsTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  chipsContent: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
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
  classesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  classesSectionTitle: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  classesSectionVerTodas: {
    color: '#844A31',
    fontSize: 12,
    fontWeight: '600',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  classCard: {
    width: '47%',
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  classCardBanner: {
    height: 60,
    justifyContent: 'flex-end',
    padding: 8,
  },
  classCardIniciales: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classCardInicialesText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  classCardBody: {
    padding: 8,
    gap: 2,
  },
  classCardName: {
    color: '#412E2E',
    fontSize: 12,
    fontWeight: '700',
  },
  classCardSub: {
    color: '#6a7282',
    fontSize: 11,
  },
  emptyDark: {
    color: '#844A31',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 4,
    opacity: 0.7,
  },
  emptyClases: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  emptyClasesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#571D11',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyClasesBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(65,46,46,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#fdfaf7',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.08)',
  },
  modalTitle: {
    color: '#412E2E',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#412E2E',
    marginBottom: 16,
  },
  newCatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  newCatInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.15)',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#412E2E',
  },
  newCatBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#53b55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(87,29,17,0.07)',
  },
  catRowName: {
    flex: 1,
    fontSize: 14,
    color: '#412E2E',
    fontWeight: '500',
  },
  catDeleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#844A31',
    fontSize: 14,
    fontWeight: '600',
  },
});
