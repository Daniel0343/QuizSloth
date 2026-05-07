import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizResumen } from '@/core/auth/interface/quiz';

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: '#24833D',
  normal: '#844A31',
  dificil: '#c1623e',
  extremo: '#571D11',
};

interface Props {
  quiz: QuizResumen;
  onOpciones: (q: QuizResumen) => void;
  onJugar: (q: QuizResumen) => void;
}

export default function BibliotecaQuizCard({ quiz, onOpciones, onJugar }: Props) {
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

const styles = StyleSheet.create({
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
});
