import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { WordChip } from './WordChip';
import { SentenceToken } from '../engine/tokens';
import { chipLabels } from '../engine/display';
import { isQuestionSentence } from '../engine/grammar';
import { nouns } from '../data/nouns';
import { useTheme } from '../context/SettingsContext';
import { fonts, radius, space, ToneKey } from '../theme';

export function toneOfToken(token: SentenceToken): ToneKey {
  switch (token.kind) {
    case 'pronoun':
      return 'pronoun';
    case 'verb':
      return 'verb';
    case 'article':
      return token.gender;
    case 'noun':
      return nouns.find((n) => n.id === token.nounId)?.gender ?? 'neutral';
    case 'adjective':
      return 'adjective';
    default:
      return 'neutral';
  }
}

interface Props {
  tokens: SentenceToken[];
  selectedUid: string | null;
  onSelect: (token: SentenceToken) => void;
}

export const SentenceStrip: React.FC<Props> = ({ tokens, selectedUid, onSelect }) => {
  const t = useTheme();
  const labels = useMemo(() => chipLabels(tokens), [tokens]);

  return (
    <View
      style={{
        minHeight: 96,
        backgroundColor: t.c.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: t.c.border,
        padding: space(4),
        justifyContent: 'center',
      }}
    >
      {tokens.length === 0 ? (
        <Text style={{ color: t.c.textMuted, fontSize: 15, textAlign: 'center' }}>Aşağıdan kelime seç; cümlen burada oluşur.</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space(2) }}>
          {tokens.map((token) => (
            <WordChip key={token.uid} label={labels[token.uid] ?? '?'} tone={toneOfToken(token)} selected={token.uid === selectedUid} onPress={() => onSelect(token)} />
          ))}
          <Text style={{ fontFamily: fonts.deBold, fontSize: 22, color: t.c.textMuted }}>{isQuestionSentence(tokens) ? '?' : '.'}</Text>
        </View>
      )}
    </View>
  );
};
