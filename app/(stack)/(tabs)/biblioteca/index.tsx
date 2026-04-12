import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ItemBiblioteca } from '@/core/auth/interface/biblioteca';
import { Coleccion } from '@/core/auth/interface/biblioteca';

type Tab = 'biblioteca' | 'colecciones';

const ITEMS_BIBLIOTECA: ItemBiblioteca[] = [];
const COLECCIONES: Coleccion[] = [];

export default function BibliotecaScreen() {
  const [tab, setTab]       = useState<Tab>('biblioteca');
  const [search, setSearch] = useState('');

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
        {tab === 'biblioteca'
          ? <TabBiblioteca items={ITEMS_BIBLIOTECA} />
          : <TabColecciones colecciones={COLECCIONES} />
        }
      </View>
    </SafeAreaView>
  );
}

function TabBiblioteca({ items }: { items: ItemBiblioteca[] }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable style={styles.createRow}>
        <View style={styles.createIcon}>
          <Ionicons name="add-outline" size={20} color="#412E2E" />
        </View>
        <Text style={styles.createLabel}>Crear uno nuevo</Text>
      </Pressable>
      <View style={styles.divider} />

      {items.length === 0 ? (
        <EmptyState
          message="No tienes nada aún en la biblioteca"
          sub="Aquí aparecerán tus quizzes y apuntes cuando los crees"
          showFindButton
        />
      ) : (
        items.map((item) => <BibliotecaCard key={item.id} item={item} />)
      )}
    </ScrollView>
  );
}

function BibliotecaCard({ item }: { item: ItemBiblioteca }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardThumb} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.cardMeta}>{item.dificultad} • {item.categoria}</Text>
        <Text style={styles.cardMeta}>{item.numPreguntas} preguntas • {item.intentos} intentos</Text>
      </View>
      <Pressable style={styles.cardMenu}>
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
        colecciones.map((col) => <ColeccionRow key={col.id} col={col} />)
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
          <Text style={styles.btnSecondaryText}>Encontrar lecciones o Exámenes</Text>
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
  // Fila "Crear"
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
  // Tarjeta biblioteca
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(65,46,46,0.08)',
  },
  cardThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: 'rgba(65,46,46,0.2)',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: '#412E2E',
    fontSize: 14,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#844A31',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
  cardMenu: {
    padding: 4,
  },
  // Fila colección
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
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 32,
    gap: 12,
  },
  sloth: {
    width: 180,
    height: 135,
    marginBottom: 8,
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
});
