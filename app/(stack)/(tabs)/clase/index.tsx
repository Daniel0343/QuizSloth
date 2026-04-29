import AppAlert from '@/components/AppAlert';
import PantallaInvitado from '@/components/PantallaInvitadoPlantilla';
import {
  actualizarCurso,
  crearCurso,
  CursoResumen,
  eliminarCurso,
  getMisCursos,
} from '@/core/cursos/actions/get-cursos';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useThemeStore } from '@/presentation/theme/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

const COLORES = ['#24833D', '#571D11', '#1a6fa8', '#7c3aed', '#b45309', '#c1623e'];

export default function ClaseScreen() {
  const { user } = useAuthStore();
  const { primaryColor } = useThemeStore();
  const esProfesor = user?.rol === 'profesor';
  const [clases, setClases] = useState<CursoResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<CursoResumen | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState(COLORES[0]);
  const [guardando, setGuardando] = useState(false);
  const [menuClase, setMenuClase] = useState<CursoResumen | null>(null);
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje?: string; botones?: any[] }>({ visible: false, titulo: '' });
  const cerrarAlerta = () => setAlerta(p => ({ ...p, visible: false }));

  const cargar = useCallback(() => {
    if (!user) return;
    setCargando(true);
    getMisCursos().then(setClases).catch(() => setClases([])).finally(() => setCargando(false));
  }, [user]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const abrirCrear = () => {
    setNombre(''); setDescripcion(''); setColor(COLORES[0]);
    setModalCrear(true);
  };

  const abrirEditar = (clase: CursoResumen) => {
    setNombre(clase.nombre);
    setDescripcion(clase.descripcion ?? '');
    setColor(clase.color ?? COLORES[0]);
    setMenuClase(null);
    setModalEditar(clase);
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      const nueva = await crearCurso(nombre.trim(), descripcion.trim(), color);
      setClases(prev => [...prev, nueva]);
      setModalCrear(false);
    } catch { /* ignorar */ }
    finally { setGuardando(false); }
  };

  const handleEditar = async () => {
    if (!modalEditar || !nombre.trim()) return;
    setGuardando(true);
    try {
      const actualizada = await actualizarCurso(modalEditar.id, nombre.trim(), descripcion.trim(), color);
      setClases(prev => prev.map(c => c.id === actualizada.id ? actualizada : c));
      setModalEditar(null);
    } catch { /* ignorar */ }
    finally { setGuardando(false); }
  };

  const handleEliminar = (clase: CursoResumen) => {
    setMenuClase(null);
    setAlerta({
      visible: true,
      titulo: 'Eliminar clase',
      mensaje: `¿Seguro que quieres eliminar "${clase.nombre}"? Se perderá todo su contenido.`,
      botones: [
        { texto: 'Cancelar', estilo: 'cancelar', onPress: cerrarAlerta },
        {
          texto: 'Eliminar', estilo: 'destructivo', onPress: async () => {
            cerrarAlerta();
            try { await eliminarCurso(clase.id); } catch { /* ignorar */ }
            setClases(prev => prev.filter(c => c.id !== clase.id));
          }
        },
      ],
    });
  };

  if (!user) return (
    <PantallaInvitado
      titulo="Accede a tus clases"
      mensaje="Inicia sesión para ver las clases en las que participas o crea las tuyas como profesor."
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.bannerHeader, { backgroundColor: primaryColor }]}>
        <View style={styles.bannerCircle1} />
        <View style={styles.bannerCircle2} />
        <View style={styles.bannerCircle3} />
        <View style={styles.bannerTopRow}>
          <View>
            <Text style={styles.bannerTitle}>Mis clases</Text>
            <Text style={styles.bannerSub}>
              {cargando ? 'Cargando...' : clases.length === 0
                ? 'Sin clases aún'
                : `${clases.length} ${clases.length === 1 ? 'clase activa' : 'clases activas'}`}
            </Text>
          </View>
          <View style={styles.bannerIconBox}>
            <Ionicons name="school" size={28} color="rgba(255,255,255,0.9)" />
          </View>
        </View>

      </View>

      <View style={styles.contentArea}>
        {cargando ? (
          <ActivityIndicator style={{ marginTop: 60 }} color="#844A31" size="large" />
        ) : esProfesor ? (
          <VistaProfesor
            clases={clases}
            onCrear={abrirCrear}
            onMenu={setMenuClase}
            onTap={id => router.push(`/clase/${id}` as any)}
          />
        ) : (
          <VistaAlumno
            clases={clases}
            onTap={id => router.push(`/clase/${id}` as any)}
          />
        )}
      </View>

      {/* Modal crear / editar */}
      <Modal
        visible={modalCrear || modalEditar !== null}
        transparent
        animationType="slide"
        onRequestClose={() => { setModalCrear(false); setModalEditar(null); }}
      >
        <Pressable style={styles.overlay} onPress={() => { setModalCrear(false); setModalEditar(null); }}>
          <Pressable style={styles.sheet} onPress={() => { }}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{modalEditar ? 'Editar clase' : 'Nueva clase'}</Text>

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la clase"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={setNombre}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Breve descripción"
              placeholderTextColor="#9ca3af"
              value={descripcion}
              onChangeText={setDescripcion}
              maxLength={200}
            />

            <Text style={styles.inputLabel}>Color del banner</Text>
            <View style={styles.colorRow}>
              {COLORES.map(c => (
                <Pressable
                  key={c}
                  style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleActive]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Pressable
              style={[styles.confirmBtn, { backgroundColor: color }, !nombre.trim() && { opacity: 0.4 }]}
              onPress={modalEditar ? handleEditar : handleCrear}
              disabled={!nombre.trim() || guardando}
            >
              {guardando
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={styles.confirmBtnText}>{modalEditar ? 'Guardar cambios' : 'Crear clase'}</Text>
              }
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => { setModalCrear(false); setModalEditar(null); }}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Menú opciones tarjeta */}
      <Modal visible={menuClase !== null} transparent animationType="slide" onRequestClose={() => setMenuClase(null)}>
        <Pressable style={styles.overlay} onPress={() => setMenuClase(null)}>
          <Pressable style={styles.sheet} onPress={() => { }}>
            <View style={styles.handle} />
            {menuClase && <Text style={styles.sheetTitle} numberOfLines={1}>{menuClase.nombre}</Text>}
            <Pressable style={styles.menuOption} onPress={() => menuClase && abrirEditar(menuClase)}>
              <Ionicons name="create-outline" size={20} color="#571D11" />
              <Text style={styles.menuOptionText}>Editar clase</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuOption} onPress={() => menuClase && handleEliminar(menuClase)}>
              <Ionicons name="trash-outline" size={20} color="#c0392b" />
              <Text style={[styles.menuOptionText, { color: '#c0392b' }]}>Eliminar clase</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => setMenuClase(null)}>
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
    </SafeAreaView>
  );
}

function VistaProfesor({ clases, onCrear, onMenu, onTap }: {
  clases: CursoResumen[];
  onCrear: () => void;
  onMenu: (c: CursoResumen) => void;
  onTap: (id: number) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Pressable style={styles.actionBtn} onPress={onCrear}>
        <Ionicons name="add-outline" size={16} color="#412E2E" />
        <Text style={styles.actionBtnText}>Crear una clase nueva</Text>
      </Pressable>

      {clases.length === 0 ? (
        <EmptyState mensaje="No tienes ninguna clase creada" sub="Crea tu primera clase para empezar" />
      ) : (
        <View style={styles.grid}>
          {clases.map(c => (
            <TarjetaProfesor key={c.id} clase={c} onMenu={() => onMenu(c)} onTap={() => onTap(c.id)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function VistaAlumno({ clases, onTap }: { clases: CursoResumen[]; onTap: (id: number) => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {clases.length === 0 ? (
        <EmptyState mensaje="No estás en ninguna clase" sub="Tu profesor te invitará cuando cree una clase" />
      ) : (
        <>
          <Text style={styles.listaHeader}>
            {clases.length} {clases.length === 1 ? 'clase' : 'clases'} asignadas
          </Text>
          <View style={styles.list}>
            {clases.map(c => (
              <TarjetaAlumno key={c.id} clase={c} onTap={() => onTap(c.id)} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function TarjetaProfesor({ clase, onMenu, onTap }: { clase: CursoResumen; onMenu: () => void; onTap: () => void }) {
  return (
    <Pressable style={styles.cardProfesor} onPress={onTap}>
      <View style={[styles.cardProfesorTop, { backgroundColor: clase.color ?? '#24833D' }]}>
        <Pressable style={styles.cardMenu} onPress={onMenu} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={16} color="white" />
        </Pressable>
      </View>
      <View style={styles.cardProfesorBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>{clase.nombre}</Text>
        <Text style={styles.cardDescripcion} numberOfLines={1}>{clase.descripcion ?? ''}</Text>
        <View style={styles.cardEstudiantes}>
          <Ionicons name="people-outline" size={13} color="#6a7282" />
          <Text style={styles.cardEstudiantesText}>{clase.numAlumnos} estudiantes</Text>
        </View>
      </View>
    </Pressable>
  );
}

function TarjetaAlumno({ clase, onTap }: { clase: CursoResumen; onTap: () => void }) {
  const iniciales = clase.nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <Pressable style={styles.cardAlumno} onPress={onTap}>
      <View style={[styles.cardAlumnoTop, { backgroundColor: clase.color ?? '#24833D' }]}>
        <View style={styles.cardAlumnoIniciales}>
          <Text style={styles.cardAlumnoInicialesText}>{iniciales}</Text>
        </View>
        <View style={styles.cardAlumnoChip}>
          <Ionicons name="arrow-forward" size={12} color="white" />
          <Text style={styles.cardAlumnoChipText}>Ver clase</Text>
        </View>
      </View>
      <View style={styles.cardAlumnoBody}>
        <Text style={styles.cardAlumnoNombre} numberOfLines={1}>{clase.nombre}</Text>
        {clase.descripcion ? (
          <Text style={styles.cardDescripcion} numberOfLines={2}>{clase.descripcion}</Text>
        ) : null}
        <View style={styles.cardAlumnoSeparador} />
        <View style={styles.cardAlumnoFooter}>
          <View style={styles.cardAlumnoFooterItem}>
            <Ionicons name="person-outline" size={13} color="#6a7282" />
            <Text style={styles.cardAlumnoFooterText}>{clase.profesor?.nombre ?? 'Desconocido'}</Text>
          </View>
          <View style={styles.cardAlumnoFooterItem}>
            <Ionicons name="people-outline" size={13} color="#6a7282" />
            <Text style={styles.cardAlumnoFooterText}>{clase.numAlumnos} {clase.numAlumnos === 1 ? 'estudiante' : 'estudiantes'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ mensaje, sub }: { mensaje: string; sub: string }) {
  return (
    <View style={styles.emptyState}>
      <Image source={require('@/assets/sloth-triste.png')} style={styles.sloth} resizeMode="contain" />
      <Text style={styles.emptyTitle}>{mensaje}</Text>
      <Text style={styles.emptySubtitle}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7b59f' },
  bannerHeader: {
    backgroundColor: '#571D11',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 20,
    padding: 20,
    paddingBottom: 18,
    overflow: 'hidden',
    shadowColor: 'rgba(87,29,17,0.5)',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bannerCircle1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -30,
  },
  bannerCircle2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)', bottom: -20, left: 20,
  },
  bannerCircle3: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)', top: 10, right: 90,
  },
  bannerTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bannerTitle: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  bannerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  bannerIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  bannerStats: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)',
  },
  bannerStat: { flex: 1, alignItems: 'center' },
  bannerStatNum: { color: 'white', fontSize: 20, fontWeight: '800' },
  bannerStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  bannerStatDiv: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },
  contentArea: { flex: 1, backgroundColor: 'rgba(217,217,217,1)' },
  scrollContent: { padding: 16, gap: 16 },
  actionBtn: {
    flexDirection: 'row', height: 44, justifyContent: 'center', alignItems: 'center',
    gap: 8, alignSelf: 'stretch', borderRadius: 999, backgroundColor: 'white',
  },
  actionBtnText: { color: '#412E2E', fontSize: 13, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  list: { gap: 10 },
  cardProfesor: { width: '47.5%', borderRadius: 12, backgroundColor: 'white', overflow: 'hidden' },
  cardProfesorTop: { height: 72, alignItems: 'flex-end', paddingTop: 10, paddingRight: 10 },
  cardMenu: { padding: 4 },
  cardProfesorBody: { padding: 10, gap: 2 },
  cardNombre: { color: '#412E2E', fontSize: 14, fontWeight: '600' },
  cardDescripcion: { color: '#4a5565', fontSize: 12 },
  cardEstudiantes: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardEstudiantesText: { color: '#6a7282', fontSize: 12 },
  listaHeader: { color: '#412E2E', fontSize: 13, fontWeight: '600', opacity: 0.6, marginBottom: 2 },
  cardAlumno: { borderRadius: 12, backgroundColor: 'white', overflow: 'hidden', alignSelf: 'stretch' },
  cardAlumnoTop: { height: 100, justifyContent: 'space-between', padding: 12 },
  cardAlumnoIniciales: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center',
  },
  cardAlumnoInicialesText: { color: 'white', fontSize: 18, fontWeight: '700' },
  cardAlumnoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  cardAlumnoChipText: { color: 'white', fontSize: 11, fontWeight: '600' },
  cardAlumnoBody: { padding: 14, gap: 5 },
  cardAlumnoNombre: { color: '#412E2E', fontSize: 17, fontWeight: '700' },
  cardAlumnoSeparador: { height: 1, backgroundColor: 'rgba(65,46,46,0.08)', marginVertical: 6 },
  cardAlumnoFooter: { flexDirection: 'row', gap: 16 },
  cardAlumnoFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardAlumnoFooterText: { color: '#6a7282', fontSize: 12 },
  cardProfesorNombre: { color: '#4a5565', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32, gap: 10 },
  sloth: { width: 220, height: 165 },
  emptyTitle: { color: '#412E2E', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: '#844A31', fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 18, opacity: 0.8 },
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
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#412E2E', marginBottom: 6 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1.5,
    borderColor: 'rgba(65,46,46,0.2)', paddingHorizontal: 12,
    fontSize: 14, color: '#412E2E', marginBottom: 14,
  },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
  colorCircleActive: { borderWidth: 3, borderColor: '#412E2E' },
  confirmBtn: {
    height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  confirmBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    height: 46, borderRadius: 12, backgroundColor: 'rgba(65,46,46,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#412E2E' },
  menuOption: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  menuOptionText: { fontSize: 15, fontWeight: '600', color: '#412E2E' },
  menuDivider: { height: 1, backgroundColor: 'rgba(65,46,46,0.08)', marginBottom: 4 },
});
