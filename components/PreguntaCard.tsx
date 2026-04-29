import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreguntaDetalle } from '@/core/auth/interface/quiz';

const DIFICULTADES = ['facil', 'normal', 'dificil', 'extremo'] as const;
const OPCIONES: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

interface Props {
  pregunta: PreguntaDetalle;
  idx: number;
  total: number;
  expandida: boolean;
  onToggle: () => void;
  onChange: (campos: Partial<PreguntaDetalle>) => void;
  onSubir: () => void;
  onBajar: () => void;
  onEliminar: () => void;
}

export default function PreguntaCard({
  pregunta, idx, total, expandida, onToggle, onChange, onSubir, onBajar, onEliminar,
}: Props) {
  const opcionKey = { A: 'opcionA', B: 'opcionB', C: 'opcionC', D: 'opcionD' } as const;

  return (
    <View style={styles.preguntaCard}>
      <Pressable style={styles.preguntaHeader} onPress={onToggle}>
        <View style={styles.preguntaHeaderLeft}>
          <View style={styles.numBadge}>
            <Text style={styles.numBadgeText}>{idx + 1}</Text>
          </View>
          <Text style={styles.preguntaResumen} numberOfLines={expandida ? undefined : 1}>
            {pregunta.enunciado}
          </Text>
        </View>
        <View style={styles.preguntaHeaderRight}>
          <View style={styles.ordenBtns}>
            <Pressable onPress={onSubir} disabled={idx === 0} style={styles.ordenBtn}>
              <Ionicons name="chevron-up" size={14} color={idx === 0 ? '#d1d5db' : '#844A31'} />
            </Pressable>
            <Pressable onPress={onBajar} disabled={idx === total - 1} style={styles.ordenBtn}>
              <Ionicons name="chevron-down" size={14} color={idx === total - 1 ? '#d1d5db' : '#844A31'} />
            </Pressable>
          </View>
          <Pressable onPress={onEliminar} style={styles.deleteBtn} hitSlop={6}>
            <Ionicons name="trash-outline" size={16} color="#e53935" />
          </Pressable>
          <Ionicons name={expandida ? 'chevron-up' : 'chevron-down'} size={18} color="#9ca3af" />
        </View>
      </Pressable>

      {expandida && (
        <View style={styles.preguntaBody}>
          <Text style={styles.fieldLabel}>Enunciado</Text>
          <TextInput
            style={styles.fieldInput}
            value={pregunta.enunciado}
            onChangeText={v => onChange({ enunciado: v })}
            multiline
            textAlignVertical="top"
          />

          {OPCIONES.map(letra => (
            <View key={letra}>
              <Text style={styles.fieldLabel}>Opción {letra}</Text>
              <View style={styles.opcionRow}>
                <Pressable
                  style={[
                    styles.correctaBtn,
                    pregunta.respuestaCorrecta === letra && styles.correctaBtnActive,
                  ]}
                  onPress={() => onChange({ respuestaCorrecta: letra })}
                >
                  <Ionicons
                    name={pregunta.respuestaCorrecta === letra ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={pregunta.respuestaCorrecta === letra ? '#53b55e' : '#d1d5db'}
                  />
                </Pressable>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  value={pregunta[opcionKey[letra]]}
                  onChangeText={v => onChange({ [opcionKey[letra]]: v } as Partial<PreguntaDetalle>)}
                />
              </View>
            </View>
          ))}

          <View style={styles.preguntaFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Dificultad</Text>
              <View style={styles.chips}>
                {DIFICULTADES.map(d => (
                  <Pressable
                    key={d}
                    style={[styles.chipSm, pregunta.dificultad === d && styles.chipSmActive]}
                    onPress={() => onChange({ dificultad: d })}
                  >
                    <Text style={[styles.chipSmText, pregunta.dificultad === d && styles.chipSmTextActive]}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.pesoBox}>
              <Text style={styles.fieldLabel}>Valor</Text>
              <View style={styles.pesoControls}>
                <Pressable
                  style={styles.pesoBtn}
                  onPress={() => onChange({ peso: Math.max(0.5, Number((pregunta.peso - 0.5).toFixed(1))) })}
                >
                  <Ionicons name="remove" size={16} color="#844A31" />
                </Pressable>
                <Text style={styles.pesoValue}>{pregunta.peso}</Text>
                <Pressable
                  style={styles.pesoBtn}
                  onPress={() => onChange({ peso: Number((pregunta.peso + 0.5).toFixed(1)) })}
                >
                  <Ionicons name="add" size={16} color="#844A31" />
                </Pressable>
              </View>
            </View>
            <View style={styles.pesoBox}>
              <Text style={styles.fieldLabel}>Tiempo</Text>
              <View style={styles.pesoControls}>
                <Pressable
                  style={styles.pesoBtn}
                  onPress={() => onChange({ segundos: Math.max(5, (pregunta.segundos ?? 30) - 5) })}
                >
                  <Ionicons name="remove" size={16} color="#844A31" />
                </Pressable>
                <Text style={styles.pesoValue}>{pregunta.segundos ?? 30}s</Text>
                <Pressable
                  style={styles.pesoBtn}
                  onPress={() => onChange({ segundos: Math.min(300, (pregunta.segundos ?? 30) + 5) })}
                >
                  <Ionicons name="add" size={16} color="#844A31" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  preguntaCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(87,29,17,0.06)',
    overflow: 'hidden',
  },
  preguntaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  preguntaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#fff3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    color: '#844A31',
    fontSize: 12,
    fontWeight: '700',
  },
  preguntaResumen: {
    flex: 1,
    color: '#412E2E',
    fontSize: 13,
    fontWeight: '500',
  },
  preguntaHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordenBtns: {
    flexDirection: 'row',
    gap: 2,
  },
  ordenBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(132,74,49,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(229,57,53,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preguntaBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(87,29,17,0.06)',
    paddingTop: 14,
    gap: 4,
  },
  fieldLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
    marginTop: 10,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(87,29,17,0.10)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#412E2E',
    backgroundColor: '#fafafa',
  },
  opcionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correctaBtn: {
    padding: 2,
  },
  correctaBtnActive: {},
  preguntaFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipSm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(132,74,49,0.2)',
  },
  chipSmActive: {
    backgroundColor: '#844A31',
    borderColor: '#844A31',
  },
  chipSmText: { color: '#844A31', fontSize: 11, fontWeight: '500' },
  chipSmTextActive: { color: 'white' },
  pesoBox: {
    alignItems: 'center',
  },
  pesoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  pesoBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(132,74,49,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pesoValue: {
    color: '#412E2E',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
});
