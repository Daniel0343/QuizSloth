import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, TextInput, Modal, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AppAlert from '@/components/AppAlert';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import {
  getCurso, getParticipantes, invitarAlumno, quitarAlumno,
  getSecciones, crearSeccion, eliminarSeccion, editarSeccion,
  crearElemento, eliminarElemento, editarElemento, uploadPdf,
} from '@/core/cursos/actions/get-cursos';
import { quizslothApi } from '@/core/auth/api/quizslothApi';
import * as DocumentPicker from 'expo-document-picker';
import { getMisQuizzes } from '@/core/quizzes/actions/get-quizzes';
import { getMisApuntes } from '@/core/apuntes/actions/apuntes';
import { QuizResumen } from '@/core/auth/interface/quiz';
import { ApunteResumen } from '@/core/auth/interface/apunte';

const resolveUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const base = (quizslothApi.defaults.baseURL ?? '').replace(/\/$/, '');
  return `${base}${url.replace(/^\/api/, '')}`;
};
import { CursoResumen, Participante, SeccionCurso, ElementoCurso } from '@/core/auth/interface/curso';

type Tab = 'curso' | 'participantes' | 'calificaciones';
type TipoElemento = 'TEXTO' | 'ENLACE' | 'PDF' | 'QUIZ' | 'APUNTE';
type ModoModal = TipoElemento | 'BIBLIOTECA';

const TIPO_ICONO: Record<TipoElemento, string> = {
  TEXTO: 'chatbox-outline',
  ENLACE: 'link-outline',
  PDF: 'document-outline',
  QUIZ: 'help-circle-outline',
  APUNTE: 'book-outline',
};

export default function ClaseDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cursoId = Number(id);
  const { user } = useAuthStore();

  const [tab, setTab] = useState<Tab>('curso');
  const [clase, setClase] = useState<CursoResumen | null>(null);
  const [secciones, setSecciones] = useState<SeccionCurso[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tienePermisosEdicion, setTienePermisosEdicion] = useState(false);

  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje?: string; botones?: any[] }>({ visible: false, titulo: '' });
  const cerrarAlerta = () => setAlerta(p => ({ ...p, visible: false }));

  // Modal nueva sección
  const [modalSeccion, setModalSeccion] = useState(false);
  const [tituloSeccion, setTituloSeccion] = useState('');
  const [guardandoSec, setGuardandoSec] = useState(false);

  // Modal editar sección
  const [modalEditarSec, setModalEditarSec] = useState<SeccionCurso | null>(null);
  const [tituloEditarSec, setTituloEditarSec] = useState('');
  const [guardandoEditSec, setGuardandoEditSec] = useState(false);

  // Modal editar elemento (solo TEXTO)
  const [modalEditarElem, setModalEditarElem] = useState<{ elem: ElementoCurso; secId: number } | null>(null);
  const [tituloEditarElem, setTituloEditarElem] = useState('');
  const [contenidoEditarElem, setContenidoEditarElem] = useState('');
  const [guardandoEditElem, setGuardandoEditElem] = useState(false);

  // Modal nuevo elemento
  const [modalElemento, setModalElemento] = useState<number | null>(null); // seccionId
  const [modoModal, setModoModal] = useState<ModoModal>('TEXTO');
  const [tipoElemento, setTipoElemento] = useState<TipoElemento>('TEXTO');
  const [tituloElemento, setTituloElemento] = useState('');
  const [contenidoElemento, setContenidoElemento] = useState('');
  const [guardandoElem, setGuardandoElem] = useState(false);
  const [pdfNombre, setPdfNombre] = useState('');
  const [subiendoPdf, setSubiendoPdf] = useState(false);

  // Biblioteca picker
  const [bibQuizzes, setBibQuizzes] = useState<QuizResumen[]>([]);
  const [bibApuntes, setBibApuntes] = useState<ApunteResumen[]>([]);
  const [cargandoBib, setCargandoBib] = useState(false);
  const [bibSeleccionado, setBibSeleccionado] = useState<{ tipo: 'QUIZ' | 'APUNTE'; id: number; titulo: string } | null>(null);

  // Modal invitar alumno
  const [modalInvitar, setModalInvitar] = useState(false);
  const [emailInvitar, setEmailInvitar] = useState('');
  const [invitando, setInvitando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [c, s, p] = await Promise.all([
          getCurso(cursoId),
          getSecciones(cursoId),
          getParticipantes(cursoId),
        ]);
        setClase(c);
        setSecciones(s);
        setParticipantes(p);
        setTienePermisosEdicion(user?.rol === 'profesor');
      } catch { /* ignorar */ }
      finally { setCargando(false); }
    };
    cargar();
  }, [cursoId]);

  // -- Editar sección --
  const abrirEditarSec = (sec: SeccionCurso) => {
    setTituloEditarSec(sec.titulo);
    setModalEditarSec(sec);
  };

  const handleEditarSeccion = async () => {
    if (!modalEditarSec || !tituloEditarSec.trim()) return;
    setGuardandoEditSec(true);
    try {
      const actualizada = await editarSeccion(modalEditarSec.id, tituloEditarSec.trim());
      setSecciones(prev => prev.map(s => s.id === modalEditarSec!.id ? { ...s, titulo: actualizada.titulo } : s));
      setModalEditarSec(null);
    } catch {
      setAlerta({ visible: true, titulo: 'Error', mensaje: 'No se pudo guardar la sección.' });
    } finally {
      setGuardandoEditSec(false);
    }
  };

  // -- Editar elemento (TEXTO) --
  const abrirEditarElem = (elem: ElementoCurso, secId: number) => {
    setTituloEditarElem(elem.titulo);
    setContenidoEditarElem(elem.contenido ?? '');
    setModalEditarElem({ elem, secId });
  };

  const handleEditarElemento = async () => {
    if (!modalEditarElem || !tituloEditarElem.trim()) return;
    setGuardandoEditElem(true);
    try {
      const actualizado = await editarElemento(modalEditarElem.elem.id, tituloEditarElem.trim(), contenidoEditarElem.trim());
      const secId = modalEditarElem.secId;
      const elemId = modalEditarElem.elem.id;
      setSecciones(prev => prev.map(s =>
        s.id === secId
          ? { ...s, elementos: s.elementos.map(e => e.id === elemId ? actualizado : e) }
          : s
      ));
      setModalEditarElem(null);
    } catch {
      setAlerta({ visible: true, titulo: 'Error', mensaje: 'No se pudo guardar el elemento.' });
    } finally {
      setGuardandoEditElem(false);
    }
  };

  // -- Secciones --
  const handleCrearSeccion = async () => {
    if (!tituloSeccion.trim()) return;
    setGuardandoSec(true);
    try {
      const nueva = await crearSeccion(cursoId, tituloSeccion.trim());
      setSecciones(prev => [...prev, nueva]);
      setModalSeccion(false);
      setTituloSeccion('');
    } catch { /* ignorar */ }
    finally { setGuardandoSec(false); }
  };

  const handleEliminarSeccion = (sec: SeccionCurso) => {
    setAlerta({
      visible: true,
      titulo: 'Eliminar sección',
      mensaje: `¿Eliminar la sección "${sec.titulo}" y todo su contenido?`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrarAlerta },
        { texto: 'Eliminar', estilo: 'destructivo', onPress: async () => {
          cerrarAlerta();
          try { await eliminarSeccion(sec.id); } catch { /* ignorar */ }
          setSecciones(prev => prev.filter(s => s.id !== sec.id));
        }},
      ],
    });
  };

  // -- Biblioteca --
  const cargarBiblioteca = async () => {
    if (bibQuizzes.length > 0 || bibApuntes.length > 0) return;
    setCargandoBib(true);
    try {
      const [q, a] = await Promise.all([getMisQuizzes(), getMisApuntes()]);
      setBibQuizzes(q);
      setBibApuntes(a);
    } catch { /* ignorar */ }
    finally { setCargandoBib(false); }
  };

  // -- Subir PDF --
  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setSubiendoPdf(true);
      const url = await uploadPdf(asset.uri, asset.name);
      setContenidoElemento(url);
      setPdfNombre(asset.name);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'Error desconocido';
      setAlerta({ visible: true, titulo: 'Error al subir', mensaje: msg });
    } finally {
      setSubiendoPdf(false);
    }
  };

  // -- Elementos --
  const handleCrearElemento = async () => {
    if (modalElemento === null) return;
    let tipo = tipoElemento;
    let titulo = tituloElemento.trim() || pdfNombre || 'Sin título';
    let contenido = contenidoElemento.trim();
    if (modoModal === 'BIBLIOTECA') {
      if (!bibSeleccionado) return;
      tipo = bibSeleccionado.tipo;
      titulo = bibSeleccionado.titulo;
      contenido = String(bibSeleccionado.id);
    } else {
      if (!titulo && tipo !== 'PDF') return;
      if (tipo === 'PDF' && !contenido) return;
    }
    setGuardandoElem(true);
    try {
      const nuevo = await crearElemento(modalElemento, tipo, titulo, contenido);
      setSecciones(prev => prev.map(s =>
        s.id === modalElemento ? { ...s, elementos: [...s.elementos, nuevo] } : s
      ));
      setModalElemento(null);
      setTituloElemento('');
      setContenidoElemento('');
    } catch { /* ignorar */ }
    finally { setGuardandoElem(false); }
  };

  const handleEliminarElemento = (elem: ElementoCurso, seccionId: number) => {
    setAlerta({
      visible: true,
      titulo: 'Eliminar elemento',
      mensaje: `¿Eliminar "${elem.titulo}"?`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrarAlerta },
        { texto: 'Eliminar', estilo: 'destructivo', onPress: async () => {
          cerrarAlerta();
          try { await eliminarElemento(elem.id); } catch { /* ignorar */ }
          setSecciones(prev => prev.map(s =>
            s.id === seccionId ? { ...s, elementos: s.elementos.filter(e => e.id !== elem.id) } : s
          ));
        }},
      ],
    });
  };

  // -- Participantes --
  const handleInvitar = async () => {
    if (!emailInvitar.trim()) return;
    setInvitando(true);
    try {
      await invitarAlumno(cursoId, emailInvitar.trim());
      const actualizados = await getParticipantes(cursoId);
      setParticipantes(actualizados);
      setClase(prev => prev ? { ...prev, numAlumnos: actualizados.length } : prev);
      setModalInvitar(false);
      setEmailInvitar('');
    } catch (e: any) {
      setAlerta({ visible: true, titulo: 'Error', mensaje: e?.response?.data?.error ?? 'No se encontró el alumno.' });
    } finally { setInvitando(false); }
  };

  const handleQuitarAlumno = (p: Participante) => {
    setAlerta({
      visible: true,
      titulo: 'Quitar alumno',
      mensaje: `¿Quitar a ${p.nombre} de la clase?`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrarAlerta },
        { texto: 'Quitar', estilo: 'destructivo', onPress: async () => {
          cerrarAlerta();
          try { await quitarAlumno(cursoId, p.id); } catch { /* ignorar */ }
          setParticipantes(prev => prev.filter(a => a.id !== p.id));
          setClase(prev => prev ? { ...prev, numAlumnos: prev.numAlumnos - 1 } : prev);
        }},
      ],
    });
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d7b59f' }}>
        <ActivityIndicator size="large" color="#571D11" />
      </View>
    );
  }

  return (
    <>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#412E2E" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{clase?.nombre ?? 'Clase'}</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: clase?.color ?? '#24833D' }]}>
        <Text style={styles.bannerNombre}>{clase?.nombre ?? ''}</Text>
        {clase?.descripcion ? <Text style={styles.bannerDesc}>{clase.descripcion}</Text> : null}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['curso', 'participantes', 'calificaciones'] as Tab[]).map(t => (
          <Pressable key={t} style={styles.tabItem} onPress={() => setTab(t)}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {tab === t && <View style={styles.tabBar} />}
          </Pressable>
        ))}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {tab === 'curso' && (
          <TabCurso
            secciones={secciones}
            tienePermisosEdicion={tienePermisosEdicion}
            onAddSeccion={() => setModalSeccion(true)}
            onEditSeccion={abrirEditarSec}
            onDeleteSeccion={handleEliminarSeccion}
            onAddElemento={secId => { setModalElemento(secId); setModoModal('TEXTO'); setTipoElemento('TEXTO'); setTituloElemento(''); setContenidoElemento(''); setPdfNombre(''); setBibSeleccionado(null); }}
            onEditElemento={abrirEditarElem}
            onDeleteElemento={handleEliminarElemento}
          />
        )}
        {tab === 'participantes' && (
          <TabParticipantes
            participantes={participantes}
            tienePermisosEdicion={tienePermisosEdicion}
            onInvitar={() => setModalInvitar(true)}
            onQuitar={handleQuitarAlumno}
          />
        )}
        {tab === 'calificaciones' && <TabCalificaciones />}
      </View>
    </SafeAreaView>

    {/* Modal nueva sección */}
    <Modal visible={modalSeccion} transparent animationType="slide" onRequestClose={() => setModalSeccion(false)}>
      <Pressable style={styles.overlay} onPress={() => setModalSeccion(false)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Nueva sección</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la sección"
            placeholderTextColor="#9ca3af"
            value={tituloSeccion}
            onChangeText={setTituloSeccion}
            autoFocus
          />
          <Pressable
            style={[styles.confirmBtn, { backgroundColor: clase?.color ?? '#24833D' }, !tituloSeccion.trim() && { opacity: 0.4 }]}
            onPress={handleCrearSeccion}
            disabled={!tituloSeccion.trim() || guardandoSec}
          >
            {guardandoSec
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmBtnText}>Crear sección</Text>
            }
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => setModalSeccion(false)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Modal nuevo elemento */}
    <Modal visible={modalElemento !== null} transparent animationType="slide" onRequestClose={() => setModalElemento(null)}>
      <Pressable style={styles.overlay} onPress={() => setModalElemento(null)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Nuevo elemento</Text>

          <View style={styles.tipoRow}>
            {(['TEXTO', 'ENLACE', 'PDF'] as ModoModal[]).map(t => (
              <Pressable
                key={t}
                style={[styles.tipoChip, modoModal === t && { backgroundColor: clase?.color ?? '#24833D', borderColor: clase?.color ?? '#24833D' }]}
                onPress={() => { setModoModal(t); setTipoElemento(t as TipoElemento); setBibSeleccionado(null); }}
              >
                <Ionicons name={TIPO_ICONO[t as TipoElemento] as any} size={14} color={modoModal === t ? 'white' : '#412E2E'} />
                <Text style={[styles.tipoChipText, modoModal === t && { color: 'white' }]}>{t}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.tipoChip, modoModal === 'BIBLIOTECA' && { backgroundColor: clase?.color ?? '#24833D', borderColor: clase?.color ?? '#24833D' }]}
              onPress={() => { setModoModal('BIBLIOTECA'); cargarBiblioteca(); }}
            >
              <Ionicons name="library-outline" size={14} color={modoModal === 'BIBLIOTECA' ? 'white' : '#412E2E'} />
              <Text style={[styles.tipoChipText, modoModal === 'BIBLIOTECA' && { color: 'white' }]}>Biblioteca</Text>
            </Pressable>
          </View>

          {modoModal !== 'PDF' && modoModal !== 'BIBLIOTECA' && (
            <TextInput
              style={styles.input}
              placeholder="Título"
              placeholderTextColor="#9ca3af"
              value={tituloElemento}
              onChangeText={setTituloElemento}
            />
          )}

          {modoModal === 'ENLACE' && (
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#9ca3af"
              value={contenidoElemento}
              onChangeText={setContenidoElemento}
              keyboardType="url"
              autoCapitalize="none"
            />
          )}
          {modoModal === 'TEXTO' && (
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Escribe el mensaje..."
              placeholderTextColor="#9ca3af"
              value={contenidoElemento}
              onChangeText={setContenidoElemento}
              multiline
            />
          )}
          {modoModal === 'PDF' && (
            <Pressable style={styles.pdfDropZone} onPress={handlePickPdf} disabled={subiendoPdf}>
              {subiendoPdf ? (
                <>
                  <ActivityIndicator color="#571D11" />
                  <Text style={styles.pdfDropSub}>Subiendo archivo...</Text>
                </>
              ) : pdfNombre ? (
                <>
                  <Ionicons name="document-text" size={28} color="#571D11" />
                  <Text style={styles.pdfNombre} numberOfLines={2}>{pdfNombre}</Text>
                  <Text style={styles.pdfCambiar}>Toca para cambiar</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={32} color="rgba(87,29,17,0.4)" />
                  <Text style={styles.pdfDropLabel}>Arrastra o toca para importar</Text>
                  <Text style={styles.pdfDropSub}>PDF desde tus archivos o Google Drive</Text>
                </>
              )}
            </Pressable>
          )}
          {modoModal === 'BIBLIOTECA' && (
            <View style={styles.bibContainer}>
              {cargandoBib ? (
                <ActivityIndicator color="#571D11" style={{ marginVertical: 20 }} />
              ) : (
                <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                  {bibQuizzes.length > 0 && (
                    <>
                      <View style={styles.bibGrupoHeader}>
                        <Ionicons name="help-circle-outline" size={13} color="#571D11" />
                        <Text style={styles.bibGrupoLabel}>Quizzes</Text>
                      </View>
                      {bibQuizzes.map(q => (
                        <Pressable
                          key={`quiz-${q.id}`}
                          style={[styles.bibItem, bibSeleccionado?.id === q.id && bibSeleccionado?.tipo === 'QUIZ' && styles.bibItemSeleccionado]}
                          onPress={() => setBibSeleccionado({ tipo: 'QUIZ', id: q.id, titulo: q.titulo })}
                        >
                          <Ionicons name="help-circle-outline" size={16} color="#571D11" />
                          <Text style={styles.bibItemTitulo} numberOfLines={1}>{q.titulo}</Text>
                          {bibSeleccionado?.id === q.id && bibSeleccionado?.tipo === 'QUIZ' && (
                            <Ionicons name="checkmark-circle" size={16} color={clase?.color ?? '#24833D'} />
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                  {bibApuntes.length > 0 && (
                    <>
                      <View style={styles.bibGrupoHeader}>
                        <Ionicons name="book-outline" size={13} color="#24833D" />
                        <Text style={[styles.bibGrupoLabel, { color: '#24833D' }]}>Apuntes</Text>
                      </View>
                      {bibApuntes.map(a => (
                        <Pressable
                          key={`apunte-${a.id}`}
                          style={[styles.bibItem, bibSeleccionado?.id === a.id && bibSeleccionado?.tipo === 'APUNTE' && styles.bibItemSeleccionado]}
                          onPress={() => setBibSeleccionado({ tipo: 'APUNTE', id: a.id, titulo: a.titulo })}
                        >
                          <Ionicons name="book-outline" size={16} color="#24833D" />
                          <Text style={styles.bibItemTitulo} numberOfLines={1}>{a.titulo}</Text>
                          {bibSeleccionado?.id === a.id && bibSeleccionado?.tipo === 'APUNTE' && (
                            <Ionicons name="checkmark-circle" size={16} color={clase?.color ?? '#24833D'} />
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                  {bibQuizzes.length === 0 && bibApuntes.length === 0 && (
                    <Text style={styles.bibVacio}>No tienes quizzes ni apuntes en tu biblioteca</Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}

          <Pressable
            style={[styles.confirmBtn, { backgroundColor: clase?.color ?? '#24833D' },
              !(modoModal === 'BIBLIOTECA' ? bibSeleccionado : (tituloElemento.trim() || (modoModal === 'PDF' && contenidoElemento))) && { opacity: 0.4 }]}
            onPress={handleCrearElemento}
            disabled={!(modoModal === 'BIBLIOTECA' ? bibSeleccionado : (tituloElemento.trim() || (modoModal === 'PDF' && contenidoElemento))) || guardandoElem}
          >
            {guardandoElem
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmBtnText}>Añadir</Text>
            }
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => setModalElemento(null)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Modal invitar alumno */}
    <Modal visible={modalInvitar} transparent animationType="slide" onRequestClose={() => setModalInvitar(false)}>
      <Pressable style={styles.overlay} onPress={() => setModalInvitar(false)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Invitar alumno</Text>
          <Text style={styles.invitarSub}>Introduce el email del alumno registrado en la app</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#9ca3af"
            value={emailInvitar}
            onChangeText={setEmailInvitar}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          <Pressable
            style={[styles.confirmBtn, { backgroundColor: clase?.color ?? '#24833D' }, !emailInvitar.trim() && { opacity: 0.4 }]}
            onPress={handleInvitar}
            disabled={!emailInvitar.trim() || invitando}
          >
            {invitando
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmBtnText}>Invitar</Text>
            }
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => setModalInvitar(false)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Modal editar sección */}
    <Modal visible={modalEditarSec !== null} transparent animationType="slide" onRequestClose={() => setModalEditarSec(null)}>
      <Pressable style={styles.overlay} onPress={() => setModalEditarSec(null)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Editar sección</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la sección"
            placeholderTextColor="#9ca3af"
            value={tituloEditarSec}
            onChangeText={setTituloEditarSec}
            autoFocus
          />
          <Pressable
            style={[styles.confirmBtn, { backgroundColor: clase?.color ?? '#24833D' }, !tituloEditarSec.trim() && { opacity: 0.4 }]}
            onPress={handleEditarSeccion}
            disabled={!tituloEditarSec.trim() || guardandoEditSec}
          >
            {guardandoEditSec
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmBtnText}>Guardar</Text>
            }
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => setModalEditarSec(null)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Modal editar elemento TEXTO */}
    <Modal visible={modalEditarElem !== null} transparent animationType="slide" onRequestClose={() => setModalEditarElem(null)}>
      <Pressable style={styles.overlay} onPress={() => setModalEditarElem(null)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Editar texto</Text>
          <TextInput
            style={styles.input}
            placeholder="Título"
            placeholderTextColor="#9ca3af"
            value={tituloEditarElem}
            onChangeText={setTituloEditarElem}
          />
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Contenido..."
            placeholderTextColor="#9ca3af"
            value={contenidoEditarElem}
            onChangeText={setContenidoEditarElem}
            multiline
          />
          <Pressable
            style={[styles.confirmBtn, { backgroundColor: clase?.color ?? '#24833D' }, !tituloEditarElem.trim() && { opacity: 0.4 }]}
            onPress={handleEditarElemento}
            disabled={!tituloEditarElem.trim() || guardandoEditElem}
          >
            {guardandoEditElem
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmBtnText}>Guardar</Text>
            }
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => setModalEditarElem(null)}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
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
    </>
  );
}

function TabCurso({ secciones, tienePermisosEdicion, onAddSeccion, onEditSeccion, onDeleteSeccion, onAddElemento, onEditElemento, onDeleteElemento }: {
  secciones: SeccionCurso[];
  tienePermisosEdicion: boolean;
  onAddSeccion: () => void;
  onEditSeccion: (s: SeccionCurso) => void;
  onDeleteSeccion: (s: SeccionCurso) => void;
  onAddElemento: (seccionId: number) => void;
  onEditElemento: (e: ElementoCurso, seccionId: number) => void;
  onDeleteElemento: (e: ElementoCurso, seccionId: number) => void;
}) {
  const [colapsadas, setColapsadas] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const layoutsRef = useRef<Record<number, number>>({});
  const toggle = (id: number) => setColapsadas(p => ({ ...p, [id]: !p[id] }));

  const resultados = search.length >= 3
    ? secciones.filter(s => s.titulo.toLowerCase().includes(search.toLowerCase()))
    : [];

  const irASeccion = (sec: SeccionCurso) => {
    setSearch('');
    setColapsadas(p => ({ ...p, [sec.id]: false }));
    const y = layoutsRef.current[sec.id] ?? 0;
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 50);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.seccionSearchWrap}>
        <View style={styles.seccionSearchBar}>
          <Ionicons name="search-outline" size={16} color="rgba(65,46,46,0.4)" />
          <TextInput
            style={styles.seccionSearchInput}
            placeholder="Buscar sección..."
            placeholderTextColor="rgba(65,46,46,0.35)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="rgba(65,46,46,0.35)" />
            </Pressable>
          )}
        </View>
        {resultados.length > 0 && (
          <View style={styles.seccionDropdown}>
            {resultados.map(sec => (
              <Pressable key={sec.id} style={styles.seccionDropRow} onPress={() => irASeccion(sec)}>
                <Ionicons name="folder-outline" size={15} color="#571D11" />
                <Text style={styles.seccionDropTitulo} numberOfLines={1}>{sec.titulo}</Text>
                <Text style={styles.seccionDropSub}>{sec.elementos.length} elem.</Text>
              </Pressable>
            ))}
          </View>
        )}
        {search.length >= 3 && resultados.length === 0 && (
          <View style={styles.seccionDropdown}>
            <Text style={styles.seccionDropVacio}>Sin resultados</Text>
          </View>
        )}
      </View>

    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {secciones.length === 0 && !tienePermisosEdicion && (
        <View style={styles.emptyTab}>
          <Ionicons name="folder-open-outline" size={40} color="rgba(65,46,46,0.2)" />
          <Text style={styles.emptyTabText}>El profesor aún no ha añadido contenido</Text>
        </View>
      )}

      {secciones.map(sec => (
        <View key={sec.id} style={styles.seccionCard}
          onLayout={e => { layoutsRef.current[sec.id] = e.nativeEvent.layout.y; }}>
          <Pressable style={styles.seccionHeader} onPress={() => toggle(sec.id)}>
            <Ionicons
              name={colapsadas[sec.id] ? 'chevron-forward' : 'chevron-down'}
              size={16} color="#412E2E"
            />
            <Text style={styles.seccionTitulo}>{sec.titulo}</Text>
            {tienePermisosEdicion && (
              <View style={styles.seccionAcciones}>
                <Pressable onPress={() => onEditSeccion(sec)} hitSlop={8}>
                  <Ionicons name="pencil-outline" size={16} color="#571D11" />
                </Pressable>
                <Pressable onPress={() => onDeleteSeccion(sec)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color="#c0392b" />
                </Pressable>
              </View>
            )}
          </Pressable>

          {!colapsadas[sec.id] && (
            <>
              {sec.elementos.map(elem => (
                <Pressable
                  key={elem.id}
                  style={styles.elemRow}
                  onPress={() => {
                    if (elem.tipo === 'TEXTO' && tienePermisosEdicion) {
                      onEditElemento(elem, sec.id);
                    } else if (elem.contenido && (elem.tipo === 'ENLACE' || elem.tipo === 'PDF')) {
                      Linking.openURL(resolveUrl(elem.contenido));
                    } else if (elem.tipo === 'QUIZ' && elem.contenido) {
                      router.push(`/crear-quiz/editar?id=${elem.contenido}` as any);
                    } else if (elem.tipo === 'APUNTE' && elem.contenido) {
                      router.push(`/apunte/${elem.contenido}` as any);
                    }
                  }}
                >
                  <View style={styles.elemIconBox}>
                    <Ionicons name={TIPO_ICONO[elem.tipo] as any} size={18} color="#571D11" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.elemTitulo}>{elem.titulo}</Text>
                    {elem.tipo === 'TEXTO' && elem.contenido
                      ? <Text style={styles.elemContenido} numberOfLines={3}>{elem.contenido}</Text>
                      : null
                    }
                  </View>
                  {tienePermisosEdicion && (
                    <Pressable onPress={() => onDeleteElemento(elem, sec.id)} hitSlop={8}>
                      <Ionicons name="close-circle-outline" size={18} color="#c0392b" />
                    </Pressable>
                  )}
                </Pressable>
              ))}

              {tienePermisosEdicion && (
                <Pressable style={styles.addElemBtn} onPress={() => onAddElemento(sec.id)}>
                  <Ionicons name="add" size={15} color="#571D11" />
                  <Text style={styles.addElemText}>Añadir elemento</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      ))}

      {tienePermisosEdicion && (
        <Pressable style={styles.addSeccionBtn} onPress={onAddSeccion}>
          <Ionicons name="add-circle-outline" size={18} color="#571D11" />
          <Text style={styles.addSeccionText}>Nueva sección</Text>
        </Pressable>
      )}
    </ScrollView>
    </View>
  );
}

function TabParticipantes({ participantes, tienePermisosEdicion, onInvitar, onQuitar }: {
  participantes: Participante[];
  tienePermisosEdicion: boolean;
  onInvitar: () => void;
  onQuitar: (p: Participante) => void;
}) {
  const profesores = participantes.filter(p => p.rol === 'profesor');
  const alumnos = participantes.filter(p => p.rol === 'alumno');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {tienePermisosEdicion && (
        <Pressable style={styles.invitarBtn} onPress={onInvitar}>
          <Ionicons name="person-add-outline" size={16} color="#412E2E" />
          <Text style={styles.invitarBtnText}>Invitar participante</Text>
        </Pressable>
      )}

      {profesores.length > 0 && (
        <>
          <View style={styles.grupoHeader}>
            <Ionicons name="school-outline" size={14} color="#571D11" />
            <Text style={styles.grupoLabel}>Profesores ({profesores.length})</Text>
          </View>
          {profesores.map(p => (
            <FilaParticipante key={p.id} p={p} tienePermisosEdicion={tienePermisosEdicion} onQuitar={onQuitar} color="#571D11" />
          ))}
        </>
      )}

      {alumnos.length > 0 && (
        <>
          <View style={styles.grupoHeader}>
            <Ionicons name="people-outline" size={14} color="#24833D" />
            <Text style={[styles.grupoLabel, { color: '#24833D' }]}>Alumnos ({alumnos.length})</Text>
          </View>
          {alumnos.map(p => (
            <FilaParticipante key={p.id} p={p} tienePermisosEdicion={tienePermisosEdicion} onQuitar={onQuitar} color="#24833D" />
          ))}
        </>
      )}

      {participantes.length === 0 && (
        <View style={styles.emptyTab}>
          <Ionicons name="people-outline" size={40} color="rgba(65,46,46,0.2)" />
          <Text style={styles.emptyTabText}>No hay participantes en esta clase</Text>
        </View>
      )}
    </ScrollView>
  );
}

function FilaParticipante({ p, tienePermisosEdicion, onQuitar, color }: {
  p: Participante;
  tienePermisosEdicion: boolean;
  onQuitar: (p: Participante) => void;
  color: string;
}) {
  return (
    <View style={styles.participanteRow}>
      <View style={[styles.participanteAvatar, { backgroundColor: color }]}>
        <Text style={styles.participanteIniciales}>
          {p.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.participanteNombre}>{p.nombre}</Text>
        <Text style={styles.participanteEmail}>{p.email}</Text>
      </View>
      {tienePermisosEdicion && (
        <Pressable onPress={() => onQuitar(p)} hitSlop={8}>
          <Ionicons name="remove-circle-outline" size={22} color="#c0392b" />
        </Pressable>
      )}
    </View>
  );
}

function TabCalificaciones() {
  return (
    <View style={styles.emptyTab}>
      <Ionicons name="stats-chart-outline" size={40} color="rgba(65,46,46,0.2)" />
      <Text style={styles.emptyTabText}>Calificaciones próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7b59f' },
  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, gap: 8,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#412E2E', textAlign: 'center' },
  banner: {
    paddingHorizontal: 20, paddingVertical: 20, gap: 4,
  },
  bannerNombre: { fontSize: 20, fontWeight: '800', color: 'white' },
  bannerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  tabRow: {
    flexDirection: 'row', backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: 'rgba(65,46,46,0.1)',
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4 },
  tabLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(65,46,46,0.45)' },
  tabLabelActive: { color: '#571D11' },
  tabBar: { height: 2, width: '60%', borderRadius: 2, backgroundColor: '#571D11' },
  content: { flex: 1, backgroundColor: '#f5f0eb' },
  seccionCard: {
    backgroundColor: 'white', marginHorizontal: 12, marginTop: 12, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(65,46,46,0.08)',
  },
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: 'rgba(65,46,46,0.03)',
  },
  seccionTitulo: { fontSize: 14, fontWeight: '700', color: '#412E2E', flex: 1 },
  seccionAcciones: { flexDirection: 'row', alignItems: 'center', gap: 14, marginLeft: 'auto' },
  elemRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(65,46,46,0.06)',
  },
  elemIconBox: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: 'rgba(87,29,17,0.07)', alignItems: 'center', justifyContent: 'center',
  },
  elemTitulo: { fontSize: 13, fontWeight: '600', color: '#412E2E' },
  elemContenido: { fontSize: 12, color: '#555', lineHeight: 18, marginTop: 2 },
  addElemBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(65,46,46,0.06)',
  },
  addElemText: { fontSize: 12, color: '#571D11', fontWeight: '600' },
  addSeccionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 12, marginTop: 12, paddingVertical: 14,
    borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: 'rgba(87,29,17,0.25)',
  },
  addSeccionText: { fontSize: 14, fontWeight: '600', color: '#571D11' },
  grupoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 8,
  },
  grupoLabel: {
    fontSize: 11, fontWeight: '700', color: '#571D11',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  invitarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 12, height: 44, borderRadius: 999, backgroundColor: 'white',
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.2)',
  },
  invitarBtnText: { fontSize: 13, fontWeight: '600', color: '#412E2E' },
  participanteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'white', marginHorizontal: 12, marginTop: 8, borderRadius: 12,
  },
  participanteAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#571D11', alignItems: 'center', justifyContent: 'center',
  },
  participanteIniciales: { color: 'white', fontSize: 14, fontWeight: '700' },
  participanteNombre: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  participanteEmail: { fontSize: 12, color: '#6a7282', marginTop: 1 },
  emptyTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyTabText: { fontSize: 14, color: 'rgba(65,46,46,0.5)', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 32, paddingTop: 12, paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(65,46,46,0.2)', alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#412E2E', marginBottom: 16 },
  invitarSub: { fontSize: 13, color: '#844A31', marginTop: -10, marginBottom: 14, opacity: 0.8 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1.5,
    borderColor: 'rgba(65,46,46,0.2)', paddingHorizontal: 12,
    fontSize: 14, color: '#412E2E', marginBottom: 12,
  },
  pdfDropZone: {
    borderWidth: 1.5, borderColor: 'rgba(87,29,17,0.25)', borderStyle: 'dashed',
    borderRadius: 14, paddingVertical: 28, alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(87,29,17,0.03)', marginBottom: 12,
  },
  pdfDropLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(87,29,17,0.6)' },
  pdfDropSub: { fontSize: 12, color: 'rgba(87,29,17,0.4)' },
  pdfNombre: { fontSize: 13, fontWeight: '600', color: '#412E2E', textAlign: 'center', paddingHorizontal: 16 },
  pdfCambiar: { fontSize: 11, color: '#844A31', marginTop: 2 },
  tipoRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  tipoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.2)',
  },
  tipoChipText: { fontSize: 12, fontWeight: '600', color: '#412E2E' },
  confirmBtn: {
    height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  confirmBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    height: 46, borderRadius: 12, backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  bibContainer: {
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.15)', borderRadius: 12,
    marginBottom: 12, overflow: 'hidden', backgroundColor: 'rgba(65,46,46,0.02)',
  },
  bibGrupoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4,
  },
  bibGrupoLabel: {
    fontSize: 11, fontWeight: '700', color: '#571D11',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  bibItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(65,46,46,0.06)',
  },
  bibItemSeleccionado: { backgroundColor: 'rgba(65,46,46,0.07)' },
  bibItemTitulo: { flex: 1, fontSize: 13, color: '#412E2E', fontWeight: '500' },
  bibVacio: { fontSize: 13, color: 'rgba(65,46,46,0.45)', textAlign: 'center', paddingVertical: 20 },
  seccionSearchWrap: { marginHorizontal: 12, marginTop: 12, marginBottom: 4, zIndex: 10 },
  seccionSearchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'white', borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.15)',
    paddingHorizontal: 12, paddingVertical: 11,
  },
  seccionSearchInput: { flex: 1, fontSize: 14, color: '#412E2E', paddingVertical: 0 },
  seccionDropdown: {
    backgroundColor: 'white', borderRadius: 12, marginTop: 6,
    borderWidth: 1.5, borderColor: 'rgba(65,46,46,0.12)',
    shadowColor: '#412E2E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    overflow: 'hidden',
  },
  seccionDropRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(65,46,46,0.06)',
  },
  seccionDropTitulo: { flex: 1, fontSize: 13, fontWeight: '600', color: '#412E2E' },
  seccionDropSub: { fontSize: 12, color: 'rgba(65,46,46,0.38)', fontWeight: '500' },
  seccionDropVacio: { fontSize: 13, color: 'rgba(65,46,46,0.4)', textAlign: 'center', paddingVertical: 14 },
});
