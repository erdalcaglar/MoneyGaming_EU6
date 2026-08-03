import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { allVerbs } from '../data';
import { ALL_PERSONS, PERSON_PRONOUN, conjugatePresent, partizipII } from '../engine/conjugate';
import { VerbToken } from '../engine/tokens';
import { colors, spacing } from '../theme';

interface Props {
  token: VerbToken | null;
  onClose: () => void;
  onChange: (next: VerbToken) => void;
  onRemove: () => void;
}

export const VerbTokenEditor: React.FC<Props> = ({ token, onClose, onChange, onRemove }) => {
  if (!token) return null;
  const verb = allVerbs.find((v) => v.id === token.verbId);
  if (!verb) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{verb.infinitive}</Text>
          <Text style={styles.subtitle}>{verb.tr}</Text>

          <Text style={styles.sectionTitle}>Şimdiki zaman (kişiye göre çekimle)</Text>
          <View style={styles.row}>
            {ALL_PERSONS.map((p) => (
              <Pressable
                key={p}
                style={[styles.option, token.mode === 'finite' && token.chosenPerson === p && styles.optionActive]}
                onPress={() => onChange({ ...token, mode: 'finite', chosenPerson: p })}
              >
                <Text style={styles.optionText}>{PERSON_PRONOUN[p]}</Text>
                <Text style={styles.optionSub}>{conjugatePresent(verb, p)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Diğer biçimler</Text>
          <View style={styles.row}>
            <Pressable style={[styles.option, token.mode === 'partizip' && styles.optionActive]} onPress={() => onChange({ ...token, mode: 'partizip' })}>
              <Text style={styles.optionText}>Partizip II</Text>
              <Text style={styles.optionSub}>{partizipII(verb)}</Text>
            </Pressable>
            <Pressable style={[styles.option, token.mode === 'infinitiv' && styles.optionActive]} onPress={() => onChange({ ...token, mode: 'infinitiv' })}>
              <Text style={styles.optionText}>Mastar</Text>
              <Text style={styles.optionSub}>{verb.infinitive}</Text>
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Pressable style={styles.removeBtn} onPress={onRemove}>
              <Text style={styles.removeText}>Kelimeyi çıkar</Text>
            </Pressable>
            <Pressable style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneText}>Tamam</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing(2.5) },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginBottom: spacing(1.5) },
  sectionTitle: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: spacing(1.5), marginBottom: spacing(1) },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { backgroundColor: colors.chipDefault, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, marginRight: 8, marginBottom: 8, minWidth: 90 },
  optionActive: { borderWidth: 2, borderColor: colors.accent },
  optionText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  optionSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing(2) },
  removeBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  removeText: { color: colors.error, fontWeight: '600' },
  doneBtn: { backgroundColor: colors.accentDark, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12 },
  doneText: { color: '#fff', fontWeight: '700' },
});
