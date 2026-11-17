import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, WordCategory } from '../navigation/types';
import { Icon } from '../components/Icon';
import { Button, Page, Segmented, TopBar } from '../components/ui';
import { useCustomVocab } from '../context/CustomVocabContext';
import { useTheme } from '../context/SettingsContext';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { Auxiliary, Gender, Level } from '../data/types';
import { fonts, radius, space } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWord'>;

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => {
  const t = useTheme();
  return (
    <View style={{ gap: space(1.5) }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: t.c.text }}>{label}</Text>
      {children}
      {hint ? <Text style={{ fontSize: 13, lineHeight: 18, color: t.c.textMuted }}>{hint}</Text> : null}
    </View>
  );
};

const Input: React.FC<{ value: string; onChangeText: (v: string) => void; placeholder?: string; german?: boolean }> = ({ value, onChangeText, placeholder, german }) => {
  const t = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.c.textMuted}
      autoCapitalize="none"
      autoCorrect={false}
      style={{
        minHeight: 48,
        backgroundColor: t.c.surface,
        borderWidth: 1,
        borderColor: t.c.border,
        borderRadius: radius.control,
        paddingHorizontal: space(3),
        color: t.c.text,
        fontSize: 16,
        fontFamily: german ? fonts.de : undefined,
      }}
    />
  );
};

export const AddWordScreen: React.FC<Props> = ({ route, navigation }) => {
  const t = useTheme();
  const { addVerb, addNoun, addAdjective } = useCustomVocab();
  const [category, setCategory] = useState<WordCategory>(route.params?.initialCategory ?? 'fiil');
  const [level, setLevel] = useState<Level>('A1');
  const [german, setGerman] = useState('');
  const [turkish, setTurkish] = useState('');
  const [gender, setGender] = useState<Gender>('der');
  const [auxiliary, setAuxiliary] = useState<Auxiliary>('haben');
  const [separablePrefix, setSeparablePrefix] = useState('');
  const [irregular, setIrregular] = useState(false);
  const [duForm, setDuForm] = useState('');
  const [erForm, setErForm] = useState('');
  const [partizip, setPartizip] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const alreadyThere = useMemo(() => {
    const word = german.trim().toLowerCase();
    if (!word) return false;
    if (category === 'fiil') return [...verbs, ...verbsC1].some((v) => v.infinitive.toLowerCase() === word);
    if (category === 'isim') return nouns.some((n) => n.noun.toLowerCase() === word);
    return adjectives.some((a) => a.adjective.toLowerCase() === word);
  }, [category, german]);

  function reset() {
    setGerman('');
    setTurkish('');
    setSeparablePrefix('');
    setIrregular(false);
    setDuForm('');
    setErForm('');
    setPartizip('');
  }

  function save() {
    setError(null);
    setSaved(null);
    const de = german.trim();
    const tr = turkish.trim();
    if (!de) return setError('Almanca kelimeyi yaz.');
    if (!tr) return setError('Türkçe anlamını yaz.');

    if (category === 'fiil') {
      const prefix = separablePrefix.trim().toLowerCase();
      if (!/(en|n)$/.test(de.toLowerCase())) return setError('Fiili mastar hâlinde yaz: "-en" ya da "-n" ile biter (ör. tanzen, wandern).');
      if (prefix && !de.toLowerCase().startsWith(prefix)) return setError(`Ayrılabilir ek "${prefix}", fiilin başında olmalı (ör. auf → aufstehen).`);
      const forms = { duForm: duForm.trim() || undefined, erForm: erForm.trim() || undefined, partizipII: partizip.trim() || undefined };
      addVerb({
        infinitive: de.toLowerCase(),
        tr,
        level,
        auxiliary,
        separablePrefix: prefix || undefined,
        irregular: irregular && (forms.duForm || forms.erForm || forms.partizipII) ? forms : undefined,
      });
      setSaved(de.toLowerCase());
    } else if (category === 'isim') {
      const noun = de.charAt(0).toUpperCase() + de.slice(1);
      addNoun({ gender, noun, tr, level });
      setSaved(`${gender} ${noun}`);
    } else {
      addAdjective({ adjective: de.toLowerCase(), tr, level });
      setSaved(de.toLowerCase());
    }
    reset();
  }

  const placeholders = { fiil: ['ör. tanzen', 'ör. dans etmek'], isim: ['ör. Fahrrad', 'ör. bisiklet'], sifat: ['ör. lustig', 'ör. komik'] }[category];

  return (
    <Page edges={['top', 'bottom']}>
      <TopBar title="Kelime ekle" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space(4), gap: space(5) }} keyboardShouldPersistTaps="handled">
          <Segmented<WordCategory>
            value={category}
            onChange={(c) => {
              setCategory(c);
              setError(null);
              setSaved(null);
            }}
            options={[
              { value: 'fiil', label: 'Fiil' },
              { value: 'isim', label: 'İsim' },
              { value: 'sifat', label: 'Sıfat' },
            ]}
          />

          {category === 'isim' ? (
            <Field label="Artikel">
              <Segmented<Gender> value={gender} onChange={setGender} options={[{ value: 'der', label: 'der' }, { value: 'die', label: 'die' }, { value: 'das', label: 'das' }]} />
            </Field>
          ) : null}

          <Field label={category === 'fiil' ? 'Almanca (mastar)' : category === 'isim' ? 'Almanca (artikelsiz)' : 'Almanca'} hint={alreadyThere ? 'Bu kelime bankada zaten var; eklersen iki kez görünür.' : undefined}>
            <Input value={german} onChangeText={setGerman} placeholder={placeholders[0]} german />
          </Field>
          <Field label="Türkçe anlamı">
            <Input value={turkish} onChangeText={setTurkish} placeholder={placeholders[1]} />
          </Field>

          {category === 'fiil' ? (
            <>
              <Field label="Geçmiş zamanda yardımcı fiil" hint="Yer ya da durum değişikliği bildiren fiiller (gehen, kommen, aufwachen…) sein alır; diğerleri haben.">
                <Segmented<Auxiliary> value={auxiliary} onChange={setAuxiliary} options={[{ value: 'haben', label: 'haben' }, { value: 'sein', label: 'sein' }]} />
              </Field>
              <Field label="Ayrılabilir ek (varsa)" hint='Örn. "aufstehen" için auf: "Ich stehe auf."'>
                <Input value={separablePrefix} onChangeText={setSeparablePrefix} placeholder="ör. auf" german />
              </Field>

              <Pressable onPress={() => setIrregular((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: irregular }} style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), minHeight: 44 }}>
                <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: irregular ? t.c.text : t.c.border, backgroundColor: irregular ? t.c.text : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {irregular ? <Icon name="check" size={16} color={t.c.bg} strokeWidth={3} /> : null}
                </View>
                <Text style={{ flex: 1, fontSize: 15, color: t.c.text }}>Düzensiz fiil: biçimlerini kendim yazacağım</Text>
              </Pressable>

              {irregular ? (
                <View style={{ gap: space(4) }}>
                  <Text style={{ fontSize: 13, lineHeight: 18, color: t.c.textMuted }}>Boş bıraktığın biçim düzenli kurala göre üretilir.</Text>
                  <Field label="du biçimi">
                    <Input value={duForm} onChangeText={setDuForm} placeholder="ör. nimmst" german />
                  </Field>
                  <Field label="er / sie / es biçimi">
                    <Input value={erForm} onChangeText={setErForm} placeholder="ör. nimmt" german />
                  </Field>
                  <Field label="Partizip II">
                    <Input value={partizip} onChangeText={setPartizip} placeholder="ör. genommen" german />
                  </Field>
                </View>
              ) : null}
            </>
          ) : null}

          <Field label="Seviye">
            <Segmented<Level> value={level} onChange={setLevel} options={[{ value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'B1', label: 'B1' }, { value: 'C1', label: 'C1' }]} />
          </Field>

          {error ? (
            <View style={{ flexDirection: 'row', gap: space(2), alignItems: 'center' }}>
              <Icon name="alert" size={18} color={t.c.error} />
              <Text style={{ flex: 1, fontSize: 14, color: t.c.error }}>{error}</Text>
            </View>
          ) : null}
          {saved ? (
            <View style={{ flexDirection: 'row', gap: space(2), alignItems: 'center' }}>
              <Icon name="checkCircle" size={18} color={t.c.success} />
              <Text style={{ flex: 1, fontSize: 14, color: t.c.success }}>
                <Text style={{ fontFamily: fonts.deBold }}>{saved}</Text> eklendi. Bir tane daha ekleyebilirsin.
              </Text>
            </View>
          ) : null}

          <Button label="Kaydet" onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
};
