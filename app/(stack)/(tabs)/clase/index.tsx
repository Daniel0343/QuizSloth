import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { ClaseProfesor, ClaseAlumno } from '@/core/auth/interface/clase';

const CLASES_PROFESOR: ClaseProfesor[] = [];
const CLASES_ALUMNO: ClaseAlumno[] = [];

export default function ClaseScreen() {
  const { user } = useAuthStore();
  const esProfesor = user?.rol === 'profesor';
  const [search, setSearch] = useState('');

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
        {esProfesor
          ? <VistaProfesor clases={CLASES_PROFESOR} />
          : <VistaAlumno clases={CLASES_ALUMNO} />
        }
      </View>
    </SafeAreaView>
  );
}

function VistaProfesor({ clases }: { clases: ClaseProfesor[] }) {
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

function VistaAlumno({ clases }: { clases: ClaseAlumno[] }) {
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

function TarjetaProfesor({ clase }: { clase: ClaseProfesor }) {
  return (
    <View style={styles.cardProfesor}>
      <View style={styles.cardProfesorTop}>
        <Pressable style={styles.cardMenu}>
          <Ionicons name="ellipsis-vertical" size={16} color="white" />
        </Pressable>
      </View>
      <View style={styles.cardProfesorBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>{clase.nombre}</Text>
        <Text style={styles.cardDescripcion} numberOfLines={1}>{clase.descripcion}</Text>
        <View style={styles.cardEstudiantes}>
          <Ionicons name="people-outline" size={13} color="#6a7282" />
          <Text style={styles.cardEstudiantesText}>{clase.numEstudiantes} estudiantes</Text>
        </View>
      </View>
    </View>
  );
}

function TarjetaAlumno({ clase }: { clase: ClaseAlumno }) {
  return (
    <View style={styles.cardAlumno}>
      <View style={styles.cardAlumnoLeft} />
      <View style={styles.cardAlumnoBody}>
        <Text style={styles.cardNombreAlumno} numberOfLines={1}>{clase.nombre}</Text>
        <Text style={styles.cardProfesorNombre}>Profesor: {clase.nombreProfesor}</Text>
      </View>
      {clase.quizzesPendientes > 0 && (
        <View style={styles.cardAlumnoFooter}>
          <Pressable style={styles.cardMenuAlumno}>
            <Ionicons name="ellipsis-vertical" size={16} color="white" />
          </Pressable>
          <View style={styles.badgePendientes}>
            <Text style={styles.badgeText}>{clase.quizzesPendientes} Quizz pendientes</Text>
          </View>
        </View>
      )}
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
  cardAlumnoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    backgroundColor: '#24833D',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardMenuAlumno: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePendientes: {
    backgroundColor: '#fb2c36',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    rowGap: 10,
  },
  sloth: {
    width: 200,
    height: 150,
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
