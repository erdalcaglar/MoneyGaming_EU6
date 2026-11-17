import React from 'react';
import { Text, View } from 'react-native';
import { allVerbs } from '../data';
import { ALL_PERSONS, conjugatePresent, partizipII, Person, PERSON_PRONOUN } from '../engine/conjugate';
import { VerbToken } from '../engine/tokens';
import { useTheme } from '../context/SettingsContext';
import { fonts, space } from '../theme';
import { SectionLabel, Sheet, Button } from './ui';
import { WordChip } from './WordChip';

interface Props {
  token: VerbToken | null;
  /** person of the sentence's current subject, used for the "follow the subject" option */
  subjectPerson: Person;
  onClose: () => void;
  onChange: (next: VerbToken) => void;
}

export const VerbTokenEditor: React.FC<Props> = ({ token, subjectPerson, onClose, onChange }) => {
  const t = useTheme();
  const verb = token ? allVerbs.find((v) => v.id === token.verbId) : undefined;
  if (!token || !verb) return null;

  const pick = (next: VerbToken) => {
    onChange(next);
    onClose();
  };
  const isAuto = token.mode === 'finite' && !token.chosenPerson;

  return (
    <Sheet visible onClose={onClose}>
      <View style={{ gap: space(4) }}>
        <View>
          <Text style={{ fontFamily: fonts.deBold, fontSize: 24, color: t.c.text }}>{verb.infinitive}</Text>
          <Text style={{ fontSize: 14, color: t.c.textMuted }}>{verb.tr}</Text>
        </View>

        <View style={{ gap: space(2) }}>
          <SectionLabel>Şimdiki zaman</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
            <WordChip
              label={conjugatePresent(verb, subjectPerson)}
              sub="özneye uy"
              tone={isAuto ? 'verb' : undefined}
              selected={isAuto}
              onPress={() => pick({ ...token, mode: 'finite', chosenPerson: undefined })}
            />
            {ALL_PERSONS.map((p) => {
              const active = token.mode === 'finite' && token.chosenPerson === p;
              return (
                <WordChip
                  key={p}
                  label={conjugatePresent(verb, p)}
                  sub={PERSON_PRONOUN[p]}
                  tone={active ? 'verb' : undefined}
                  selected={active}
                  onPress={() => pick({ ...token, mode: 'finite', chosenPerson: p })}
                />
              );
            })}
          </View>
        </View>

        <View style={{ gap: space(2) }}>
          <SectionLabel>Diğer biçimler</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
            <WordChip
              label={partizipII(verb)}
              sub="Partizip II (geçmiş zaman)"
              tone={token.mode === 'partizip' ? 'verb' : undefined}
              selected={token.mode === 'partizip'}
              onPress={() => pick({ ...token, mode: 'partizip', chosenPerson: undefined })}
            />
            <WordChip
              label={verb.infinitive}
              sub="Mastar (modal fiille)"
              tone={token.mode === 'infinitiv' ? 'verb' : undefined}
              selected={token.mode === 'infinitiv'}
              onPress={() => pick({ ...token, mode: 'infinitiv', chosenPerson: undefined })}
            />
          </View>
        </View>

        <Button label="Kapat" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
};
