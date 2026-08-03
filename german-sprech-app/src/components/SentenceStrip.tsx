import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WordChip } from './WordChip';
import { SentenceToken } from '../engine/tokens';
import { tokenChipLabel } from '../engine/display';
import { Person } from '../engine/conjugate';
import { colors, spacing } from '../theme';

const KIND_COLOR: Record<string, string> = {
  pronoun: colors.chipPronoun,
  verb: colors.chipVerb,
  article: colors.chipArticle,
  noun: colors.chipNoun,
  adjective: colors.chipAdjective,
  question: colors.chipQuestion,
  connector: colors.chipConnector,
  freetext: colors.chipDefault,
};

interface Props {
  tokens: SentenceToken[];
  subjectPerson: Person | null;
  onTokenPress: (token: SentenceToken) => void;
  onTokenRemove: (token: SentenceToken) => void;
}

export const SentenceStrip: React.FC<Props> = ({ tokens, subjectPerson, onTokenPress, onTokenRemove }) => {
  if (tokens.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aşağıdan kelime seçerek cümleni oluştur ↓</Text>
      </View>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      {tokens.map((t) => (
        <WordChip
          key={t.uid}
          label={tokenChipLabel(t, subjectPerson)}
          color={KIND_COLOR[t.kind]}
          onPress={() => onTokenPress(t)}
          onLongPress={() => onTokenRemove(t)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(1), paddingHorizontal: spacing(1) },
  empty: { padding: spacing(2), alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontStyle: 'italic' },
});
