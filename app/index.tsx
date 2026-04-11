import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => router.replace('/(stack)/(tabs)/home'), 300);
    });
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#d7b59f', alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="dark" />

      {/* Blob superior izquierda */}
      <View style={{
        position: 'absolute', top: -40, left: -40,
        width: 160, height: 100, borderRadius: 80,
        backgroundColor: '#24833D', opacity: 0.25, transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{
        position: 'absolute', top: -20, left: -20,
        width: 120, height: 75, borderRadius: 60,
        backgroundColor: '#53b55e', opacity: 0.2, transform: [{ rotate: '-30deg' }],
      }} />

      {/* Blob superior derecha */}
      <View style={{
        position: 'absolute', top: -30, right: -30,
        width: 130, height: 80, borderRadius: 65,
        backgroundColor: '#1D802C', opacity: 0.2, transform: [{ rotate: '30deg' }],
      }} />

      {/* Rama superior */}
      <View style={{
        position: 'absolute', top: 55, left: 0, right: 0, height: 10,
        backgroundColor: '#571D11', borderRadius: 5,
      }} />

      {/* Hoja colgante izquierda */}
      <View style={{ position: 'absolute', top: 60, left: width * 0.28, alignItems: 'center' }}>
        <View style={{ width: 2, height: 30, backgroundColor: '#24833D' }} />
        <View style={{ width: 28, height: 16, borderRadius: 14, backgroundColor: '#53b55e', transform: [{ rotate: '-15deg' }] }} />
      </View>

      {/* Hoja colgante derecha */}
      <View style={{ position: 'absolute', top: 55, left: width * 0.62, alignItems: 'center' }}>
        <View style={{ width: 2, height: 25, backgroundColor: '#24833D' }} />
        <View style={{ width: 28, height: 16, borderRadius: 14, backgroundColor: '#1D802C', transform: [{ rotate: '15deg' }] }} />
      </View>

      {/* Logo central */}
      <Image
        source={require('@/assets/sloth-texto.png')}
        style={{ width: 280, height: 210 }}
        resizeMode="contain"
      />

      {/* Blob inferior izquierda */}
      <View style={{
        position: 'absolute', bottom: 60, left: -40,
        width: 140, height: 90, borderRadius: 70,
        backgroundColor: '#24833D', opacity: 0.2, transform: [{ rotate: '120deg' }],
      }} />

      {/* Blob inferior derecha */}
      <View style={{
        position: 'absolute', bottom: -30, right: -30,
        width: 160, height: 100, borderRadius: 80,
        backgroundColor: '#53b55e', opacity: 0.25, transform: [{ rotate: '225deg' }],
      }} />

      {/* Puntos decorativos */}
      <View style={{ position: 'absolute', top: '25%', left: 30, width: 12, height: 12, borderRadius: 6, backgroundColor: '#53b55e', opacity: 0.4 }} />
      <View style={{ position: 'absolute', top: '33%', right: 48, width: 8, height: 8, borderRadius: 4, backgroundColor: '#24833D', opacity: 0.5 }} />
      <View style={{ position: 'absolute', bottom: '25%', left: 64, width: 10, height: 10, borderRadius: 5, backgroundColor: '#1D802C', opacity: 0.45 }} />
      <View style={{ position: 'absolute', bottom: '33%', right: 32, width: 12, height: 12, borderRadius: 6, backgroundColor: '#53b55e', opacity: 0.35 }} />

      {/* Barra de carga */}
      <View style={{ position: 'absolute', bottom: 120, width: 256 }}>
        <View style={{ height: 8, backgroundColor: 'rgba(65,46,46,0.2)', borderRadius: 4, overflow: 'hidden' }}>
          <Animated.View style={{
            height: '100%',
            width: barWidth,
            backgroundColor: '#53b55e',
            borderRadius: 4,
          }} />
        </View>
        <Text style={{ textAlign: 'center', color: '#571D11', fontSize: 11, fontWeight: '500', marginTop: 8 }}>
          Cargando...
        </Text>
      </View>
    </View>
  );
}
