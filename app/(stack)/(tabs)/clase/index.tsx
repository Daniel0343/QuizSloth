import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { getMisCursos, CursoResumen } from '@/core/cursos/actions/get-cursos';

export default function ClaseScreen() {
  const { user } = useAuthStore();
  const esProfesor = user?.rol === 'profesor';
  const [search, setSearch] = useState('');
  const [clases, setClases] = useState<CursoResumen[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!user) return;
    setCargando(true);
    getMisCursos()
      .then(setClases)
      .catch(() => setClases([]))
      .finally(() => setCargando(false));
  }, [user]);

  const clasesFiltradas = clases.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis clases</Text>
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

      <View style={styles.contentArea}>
        {cargando ? (
          <ActivityIndicator style={{ marginTop: 60 }} color="#844A31" size="large" />
        ) : esProfesor ? (
          <VistaProfesor clases={clasesFiltradas} />
        ) : (
          <VistaAlumno clases={clasesFiltradas} />
        )}
      </View>
    </SafeAreaView>
  );
}

function VistaProfesor({ clases }: { clases: CursoResumen[] }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.actionBtn}>
        <Ionicons name="add-outline" size={16} color="#412E2E" />
        <Text style={styles.actionBtnText}>Crear una clase nueva</Text>
      </View>

      {clases.length === 0 ? (
        <EmptyState mensaje="No tienes ninguna clase creada" sub="Crea tu primera clase para empezar" />
      ) : (
        <View style={styles.grid}>
          {clases.map(c => <TarjetaProfesor key={c.id} clase={c} />)}
        </View>
      )}
    </ScrollView>
  );
}

function VistaAlumno({ clases }: { clases: CursoResumen[] }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.actionBtn}>
        <Ionicons name="add-outline" size={16} color="#412E2E" />
        <Text style={styles.actionBtnText}>Unirse a una clase</Text>
      </View>

      {clases.length === 0 ? (
        <EmptyState mensaje="No estás en ninguna clase" sub="Únete a una clase con el código que te dé tu profesor" />
      ) : (
        <View style={styles.list}>
          {clases.map(c => <TarjetaAlumno key={c.id} clase={c} />)}
        </View>
      )}
    </ScrollView>
  );
}

function TarjetaProfesor({ clase }: { clase: CursoResumen }) {
  return (
    <View style={styles.cardProfesor}>
      <View style={styles.cardProfesorTop}>
        <Pressable style={styles.cardMenu}>
          <Ionicons name="ellipsis-vertical" size={16} color="white" />
        </Pressable>
      </View>
      <View style={styles.cardProfesorBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>{clase.nombre}</Text>
        <Text style={styles.cardDescripcion} numberOfLines={1}>{clase.descripcion ?? ''}</Text>
        <View style={styles.cardEstudiantes}>
          <Ionicons name="people-outline" size={13} color="#6a7282" />
          <Text style={styles.cardEstudiantesText}>0 estudiantes</Text>
        </View>
      </View>
    </View>
  );
}

function TarjetaAlumno({ clase }: { clase: CursoResumen }) {
  return (
    <View style={styles.cardAlumno}>
      <View style={styles.cardAlumnoLeft} />
      <View style={styles.cardAlumnoBody}>
        <Text style={styles.cardNombreAlumno} numberOfLines={1}>{clase.nombre}</Text>
        <Text style={styles.cardProfesorNombre}>
          Profesor: {clase.profesor?.nombre ?? 'Desconocido'}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ mensaje, sub }: { mensaje: string; sub: string }) {
  return (
    <View style={styles.emptyState}>
      <Image
        source={require('@/assets/sloth-triste.png')}
        style={styles.sloth}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>{mensaje}</Text>
      <Text style={styles.emptySubtitle}>{sub}</Text>
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
  contentArea: {
    flex: 1,
    backgroundColor: 'rgba(217,217,217,1)',
  },
  scrollContent: {
    paddingTop: 24,
    paddingLeft: 16,
    paddingBottom: 24,
    paddingRight: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: 24,
    columnGap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 8,
    columnGap: 8,
    flexShrink: 0,
    alignSelf: 'stretch',
    borderRadius: 33554400,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  actionBtnText: {
    color: '#412E2E',
    fontSize: 13,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  list: {},
  cardProfesor: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardProfesorTop: {
    height: 72,
    backgroundColor: '#24833D',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: 10,
  },
  cardMenu: {
    padding: 4,
  },
  cardProfesorBody: {
    padding: 10,
    gap: 2,
  },
  cardNombre: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardDescripcion: {
    color: '#4a5565',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  cardEstudiantes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardEstudiantesText: {
    color: '#6a7282',
    fontSize: 12,
  },
  cardAlumno: {
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  cardAlumnoLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#24833D',
  },
  cardAlumnoBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 4,
  },
  cardNombreAlumno: {
    color: '#412E2E',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  cardProfesorNombre: {
    color: '#4a5565',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
  },
  emptyState: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    rowGap: 10,
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
});
