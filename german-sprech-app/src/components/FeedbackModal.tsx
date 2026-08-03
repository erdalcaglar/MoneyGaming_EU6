import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { CheckResult } from '../engine/grammar';
import { getGrammarNote } from '../engine/grammarNotes';
import { colors, spacing } from '../theme';

interface Props {
  result: CheckResult | null;
  onClose: () => void;
}

const IssueRow: React.FC<{ ruleId: string; message: string }> = ({ ruleId, message }) => {
  const [open, setOpen] = useState(false);
  const note = getGrammarNote(ruleId);
  return (
    <View style={styles.issueBox}>
      <Text style={styles.issueMessage}>{message}</Text>
      {note ? (
        <Pressable onPress={() => setOpen((o) => !o)}>
          <Text style={styles.whyLink}>{open ? '▲ Gizle' : '▼ Neden? (kural + köken)'}</Text>
        </Pressable>
      ) : null}
      {open && note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteLabel}>Kural</Text>
          <Text style={styles.noteText}>{note.rule}</Text>
          <Text style={styles.noteLabel}>Neden böyle?</Text>
          <Text style={styles.noteText}>{note.why}</Text>
          <Text style={styles.noteLabel}>Kökeni</Text>
          <Text style={styles.noteText}>{note.origin}</Text>
          <Text style={styles.noteLabel}>Örnek</Text>
          <Text style={styles.noteExample}>{note.example}</Text>
        </View>
      ) : null}
    </View>
  );
};

export const FeedbackModal: React.FC<Props> = ({ result, onClose }) => {
  if (!result) return null;
  const speak = (text: string) => Speech.speak(text, { language: 'de-DE' });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={[styles.headline, { color: result.correct ? colors.success : colors.error }]}>
            {result.correct ? '✅ Doğru!' : '❌ Gramatik hata var'}
          </Text>

          <View style={styles.sentenceBox}>
            <Text style={styles.sentenceLabel}>Senin cümlen</Text>
            <View style={styles.sentenceRow}>
              <Text style={styles.sentenceText}>{result.yourSentence}</Text>
              <Pressable onPress={() => speak(result.yourSentence)}>
                <Text style={styles.speakIcon}>🔊</Text>
              </Pressable>
            </View>
          </View>

          {!result.correct ? (
            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceLabel}>Doğrusu</Text>
              <View style={styles.sentenceRow}>
                <Text style={[styles.sentenceText, { color: colors.success }]}>{result.correctedSentence}</Text>
                <Pressable onPress={() => speak(result.correctedSentence)}>
                  <Text style={styles.speakIcon}>🔊</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <ScrollView style={styles.issuesList}>
            {result.issues.map((issue, idx) => (
              <IssueRow key={`${issue.ruleId}_${idx}`} ruleId={issue.ruleId} message={issue.message} />
            ))}
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Devam et</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing(2.5), maxHeight: '85%' },
  headline: { fontSize: 22, fontWeight: '800', marginBottom: spacing(1.5) },
  sentenceBox: { marginBottom: spacing(1.5) },
  sentenceLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  sentenceRow: { flexDirection: 'row', alignItems: 'center' },
  sentenceText: { color: colors.text, fontSize: 17, fontWeight: '600', flexShrink: 1 },
  speakIcon: { fontSize: 20, marginLeft: spacing(1) },
  issuesList: { marginTop: spacing(1) },
  issueBox: { backgroundColor: colors.cardAlt, borderRadius: 12, padding: spacing(1.5), marginBottom: spacing(1) },
  issueMessage: { color: colors.text, fontSize: 14, lineHeight: 20 },
  whyLink: { color: colors.accent, marginTop: spacing(1), fontWeight: '600' },
  noteBox: { marginTop: spacing(1), borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(1) },
  noteTitle: { color: colors.accent, fontWeight: '700', fontSize: 15, marginBottom: spacing(0.5) },
  noteLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginTop: spacing(1), textTransform: 'uppercase' },
  noteText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  noteExample: { color: colors.success, fontSize: 13, fontStyle: 'italic' },
  closeBtn: { backgroundColor: colors.accentDark, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: spacing(2) },
  closeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
