import { View, Text, StyleSheet, Pressable } from 'react-native';
import { QuizResumen } from '@/core/auth/interface/quiz';

export const CARD_COLORS = [
  '#E8B84B', '#E05C9A', '#7DC95E', '#C4A576',
  '#E07B3F', '#5B9BD5', '#4EC9C9', '#9B6DB5',
];
const STRIPES = Array.from({ length: 12 });

interface Props {
  quiz: QuizResumen;
  idx: number;
  onPress: () => void;
}

export default function QuizCard({ quiz, idx, onPress }: Props) {
  const color = quiz.color || CARD_COLORS[idx % CARD_COLORS.length];
  return (
    <Pressable style={[styles.quizCard, { backgroundColor: color }]} onPress={onPress}>
      <View style={styles.stripesWrap}>
        {STRIPES.map((_, i) => <View key={i} style={styles.stripe} />)}
      </View>
      <View style={styles.quizCircle} />
      <View style={styles.quizCircle2} />
      <View style={styles.quizCardContent}>
        {quiz.categoria?.nombre ? (
          <Text style={styles.quizCardCat} numberOfLines={1}>{quiz.categoria.nombre.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.quizTitle} numberOfLines={4}>{quiz.titulo}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quizCard: {
    width: 122,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.28)',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  stripesWrap: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    transform: [{ rotate: '40deg' }],
    flexDirection: 'row',
  },
  stripe: {
    width: 9,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginRight: 9,
  },
  quizCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.13)',
    top: -26,
    right: -22,
  },
  quizCircle2: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.09)',
    bottom: -12,
    left: -10,
  },
  quizCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
  },
  quizCardCat: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginBottom: 5,
  },
  quizTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
});
