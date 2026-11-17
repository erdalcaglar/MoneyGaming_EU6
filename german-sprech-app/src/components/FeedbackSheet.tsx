import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CheckResult, Issue } from '../engine/grammar';
import { getGrammarNote } from '../engine/grammarNotes';
import { useTheme } from '../context/SettingsContext';
import { fonts, radius, space } from '../theme';
import { Icon } from './Icon';
import { speakGerman } from './speak';
import { Button, IconButton, SectionLabel, Sheet } from './ui';

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const note = getGrammarNote(issue.ruleId);
  const isTip = issue.severity === 'info';
  const label = { fontSize: 12, fontWeight: '700' as const, color: t.c.textMuted, marginTop: space(3) };
  const body = { fontSize: 14, lineHeight: 21, color: t.c.text };

  return (
    <View style={{ backgroundColor: t.c.surfaceAlt, borderRadius: radius.control, padding: space(4), gap: space(2) }}>
      <View style={{ flexDirection: 'row', gap: space(2) }}>
        <View style={{ paddingTop: 2 }}>
          <Icon name={isTip ? 'info' : 'alert'} size={18} color={isTip ? t.c.info : t.c.error} />
        </View>
        <Text style={[body, { flex: 1 }]}>{issue.message}</Text>
      </View>
      {note ? (
        <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', gap: space(1), minHeight: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: t.c.accent }}>{open ? 'Açıklamayı gizle' : 'Neden böyle?'}</Text>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} color={t.c.accent} />
        </Pressable>
      ) : null}
      {open && note ? (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: t.c.text }}>{note.title}</Text>
          <Text style={label}>KURAL</Text>
          <Text style={body}>{note.rule}</Text>
          <Text style={label}>MANTIĞI</Text>
          <Text style={body}>{note.why}</Text>
          <Text style={label}>KÖKENİ</Text>
          <Text style={body}>{note.origin}</Text>
          <Text style={label}>ÖRNEK</Text>
          <Text style={[body, { fontFamily: fonts.de }]}>{note.example}</Text>
        </View>
      ) : null}
    </View>
  );
};

const SentenceLine: React.FC<{ label: string; text: string; color: string }> = ({ label, text, color }) => (
  <View style={{ gap: space(1) }}>
    <SectionLabel>{label}</SectionLabel>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
      <Text style={{ flex: 1, fontFamily: fonts.deBold, fontSize: 21, lineHeight: 28, color }}>{text}</Text>
      <IconButton icon="volume" label={`"${text}" cümlesini dinle`} onPress={() => speakGerman(text)} />
    </View>
  </View>
);

interface Props {
  result: CheckResult | null;
  onClose: () => void;
  /** start a fresh sentence (shown when the answer was right) */
  onNext: () => void;
}

export const FeedbackSheet: React.FC<Props> = ({ result, onClose, onNext }) => {
  const t = useTheme();
  if (!result) return null;
  const errors = result.issues.filter((i) => i.severity === 'error');
  const tips = result.issues.filter((i) => i.severity === 'info');

  return (
    <Sheet visible onClose={onClose}>
      <ScrollView contentContainerStyle={{ gap: space(4) }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
          <Icon name={result.correct ? 'checkCircle' : 'alert'} size={24} color={result.correct ? t.c.success : t.c.error} />
          <Text style={{ fontSize: 20, fontWeight: '800', color: result.correct ? t.c.success : t.c.error }}>
            {result.correct ? 'Doğru' : errors.length > 1 ? `${errors.length} hata var` : 'Bir hata var'}
          </Text>
        </View>

        <SentenceLine label={result.correct ? 'Cümlen' : 'Senin cümlen'} text={result.yourSentence} color={t.c.text} />

        {!result.correct && result.correctable ? <SentenceLine label="Doğrusu" text={result.correctedSentence} color={t.c.success} /> : null}

        {!result.correct && !result.correctable ? (
          <Text style={{ fontSize: 14, lineHeight: 21, color: t.c.textMuted }}>
            Bu kelimelerle tek bir doğru cümle önerilemiyor. Aşağıdaki açıklamaya göre bir kelimeyi çıkarıp ya da değiştirip yeniden dene.
          </Text>
        ) : null}

        {[...errors, ...tips].map((issue, idx) => (
          <IssueCard key={`${issue.ruleId}_${idx}`} issue={issue} />
        ))}

        {result.correct ? <Button label="Yeni cümle" onPress={onNext} /> : <Button label="Düzelt" onPress={onClose} />}
      </ScrollView>
    </Sheet>
  );
};
