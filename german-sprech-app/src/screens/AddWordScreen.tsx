import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, WordCategory } from '../navigation/types';
import { useCustomVocab } from '../context/CustomVocabContext';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { Level, Gender, Auxiliary } from '../data/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWord'>;

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'C1'];
const GENDERS: Gender[] = ['der', 'die', 'das'];

function Segmented<T extends string>({ options, value, onChange, labels }: { options: T[]; value: T; onChange: (v: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <View style={styles.segmentRow}>
      {options.map((opt) => (
        <Pressable key={opt} onPress={() => onChange(opt)} style={[styles.segment, value === opt && styles.segmentActive]}>
          <Text style={[styles.segmentText, value === opt && styles.segmentTextActive]}>{labels?.[opt] ?? opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export const AddWordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { addVerb, addNoun, addAdjective } = useCustomVocab();
  const [category, setCategory] = useState<WordCategory>(route.params?.initialCategory ?? 'fiil');
  const [level, setLevel] = useState<Level>('A1');
  const [success, setSuccess] = useState<string | null>(null);

  // Fiil fields
  const [infinitive, setInfinitive] = useState('');
  const [verbTr, setVerbTr] = useState('');
  const [auxiliary, setAuxiliary] = useState<Auxiliary>('haben');
  const [separablePrefix, setSeparablePrefix] = useState('');
  const [irregular, setIrregular] = useState(false);
  const [duForm, setDuForm] = useState('');
  const [erForm, setErForm] = useState('');
  const [partizip, setPartizip] = useState('');

  // İsim fields
  const [gender, setGender] = useState<Gender>('der');
  const [nounText, setNounText] = useState('');
  const [nounTr, setNounTr] = useState('');

  // Sıfat fields
  const [adjectiveText, setAdjectiveText] = useState('');
  const [adjectiveTr, setAdjectiveTr] = useState('');

  const [error, setError] = useState<string | null>(null);

  const duplicateWarning = useMemo(() => {
    if (category === 'fiil' && infinitive.trim()) {
      const exists = [...verbs, ...verbsC1].some((v) => v.infinitive.toLowerCase() === infinitive.trim().toLowerCase());
      return exists ? `"${infinitive.trim()}" zaten kelime bankasında var — yine de ekleyebilirsin, tekrar oluşur.` : null;
    }
    if (category === 'isim' && nounText.trim()) {
      const exists = nouns.some((n) => n.noun.toLowerCase() === nounText.trim().toLowerCase());
      return exists ? `"${nounText.trim()}" zaten kelime bankasında var.` : null;
    }
    if (category === 'sifat' && adjectiveText.trim()) {
      const exists = adjectives.some((a) => a.adjective.toLowerCase() === adjectiveText.trim().toLowerCase());
      return exists ? `"${adjectiveText.trim()}" zaten kelime bankasında var.` : null;
    }
    return null;
  }, [category, infinitive, nounText, adjectiveText]);

  function resetVerbFields() {
    setInfinitive('');
    setVerbTr('');
    setAuxiliary('haben');
    setSeparablePrefix('');
    setIrregular(false);
    setDuForm('');
    setErForm('');
    setPartizip('');
  }
  function resetNounFields() {
    setNounText('');
    setNounTr('');
  }
  function resetAdjectiveFields() {
    setAdjectiveText('');
    setAdjectiveTr('');
  }

  function handleSave() {
    setError(null);
    setSuccess(null);

    if (category === 'fiil') {
      const inf = infinitive.trim();
      const tr = verbTr.trim();
      if (!inf) return setError('Mastar (Almanca fiil) boş olamaz.');
      if (!tr) return setError('Türkçe anlamı boş olamaz.');
      const prefix = separablePrefix.trim();
      if (prefix && !inf.toLowerCase().startsWith(prefix.toLowerCase())) {
        return setError(`Ayrılabilir önek ("${prefix}"), fiilin ("${inf}") başında olmalı.`);
      }
      const entry = addVerb({
        infinitive: inf,
        tr,
        level,
        auxiliary,
        separablePrefix: prefix || undefined,
        irregular:
          irregular && (duForm.trim() || erForm.trim() || partizip.trim())
            ? { duForm: duForm.trim() || undefined, erForm: erForm.trim() || undefined, partizipII: partizip.trim() || undefined }
            : undefined,
      });
      setSuccess(`"${entry.infinitive}" fiil bankasına eklendi ✓`);
      resetVerbFields();
      return;
    }

    if (category === 'isim') {
      const n = nounText.trim();
      const tr = nounTr.trim();
      if (!n) return setError('İsim (Almanca) boş olamaz.');
      if (!tr) return setError('Türkçe anlamı boş olamaz.');
      const entry = addNoun({ gender, noun: n, tr, level });
      setSuccess(`"${entry.gender} ${entry.noun}" isim bankasına eklendi ✓`);
      resetNounFields();
      return;
    }

    const a = adjectiveText.trim();
    const tr = adjectiveTr.trim();
    if (!a) return setError('Sıfat (Almanca) boş olamaz.');
    if (!tr) return setError('Türkçe anlamı boş olamaz.');
    const entry = addAdjective({ adjective: a, tr, level });
    setSuccess(`"${entry.adjective}" sıfat bankasına eklendi ✓`);
    resetAdjectiveFields();
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Kelime Ekle</Text>
          <Text style={styles.subtitle}>Kendi kelimeni ekle, hemen Cümle Kur ve Kelime Bankası'nda görün.</Text>

          <FormField label="Kategori">
            <Segmented
              options={['fiil', 'isim', 'sifat'] as WordCategory[]}
              value={category}
              onChange={(c) => {
                setCategory(c);
                setError(null);
                setSuccess(null);
              }}
              labels={{ fiil: 'Fiil', isim: 'İsim', sifat: 'Sıfat' }}
            />
          </FormField>

          <FormField label="Seviye">
            <Segmented options={LEVELS} value={level} onChange={setLevel} />
          </FormField>

          {category === 'fiil' && (
            <>
              <FormField label="Mastar (Almanca) *">
                <TextInput style={styles.input} placeholder="ör. tanzen" placeholderTextColor={colors.textMuted} value={infinitive} onChangeText={setInfinitive} autoCapitalize="none" />
              </FormField>
              <FormField label="Türkçe anlamı *">
                <TextInput style={styles.input} placeholder="ör. dans etmek" placeholderTextColor={colors.textMuted} value={verbTr} onChangeText={setVerbTr} />
              </FormField>
              <FormField label="Perfekt'te yardımcı fiil">
                <Segmented options={['haben', 'sein'] as Auxiliary[]} value={auxiliary} onChange={setAuxiliary} />
              </FormField>
              <FormField label="Ayrılabilir önek (opsiyonel)">
                <TextInput style={styles.input} placeholder="ör. auf (aufstehen için)" placeholderTextColor={colors.textMuted} value={separablePrefix} onChangeText={setSeparablePrefix} autoCapitalize="none" />
              </FormField>

              <Pressable style={styles.toggleRow} onPress={() => setIrregular((v) => !v)}>
                <View style={[styles.checkbox, irregular && styles.checkboxActive]}>{irregular ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                <Text style={styles.toggleLabel}>Düzensiz (güçlü) fiil — du/er ve Partizip II'yi elle gir</Text>
              </Pressable>

              {irregular && (
                <View style={styles.irregularBox}>
                  <Text style={styles.irregularHint}>Boş bıraktığın alanlar için uygulama düzenli çekim kuralını uygular — bu yanlış olabilir, biliyorsan doldur.</Text>
                  <FormField label="du hâli (ör. nimmst)">
                    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} value={duForm} onChangeText={setDuForm} autoCapitalize="none" />
                  </FormField>
                  <FormField label="er/sie/es hâli (ör. nimmt)">
                    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} value={erForm} onChangeText={setErForm} autoCapitalize="none" />
                  </FormField>
                  <FormField label="Partizip II (ör. genommen)">
                    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} value={partizip} onChangeText={setPartizip} autoCapitalize="none" />
                  </FormField>
                </View>
              )}
            </>
          )}

          {category === 'isim' && (
            <>
              <FormField label="Cinsiyet (Artikel) *">
                <Segmented options={GENDERS} value={gender} onChange={setGender} />
              </FormField>
              <FormField label="İsim (Almanca, artikelsiz) *">
                <TextInput style={styles.input} placeholder="ör. Fahrrad" placeholderTextColor={colors.textMuted} value={nounText} onChangeText={setNounText} />
              </FormField>
              <FormField label="Türkçe anlamı *">
                <TextInput style={styles.input} placeholder="ör. bisiklet" placeholderTextColor={colors.textMuted} value={nounTr} onChangeText={setNounTr} />
              </FormField>
            </>
          )}

          {category === 'sifat' && (
            <>
              <FormField label="Sıfat (Almanca) *">
                <TextInput style={styles.input} placeholder="ör. lustig" placeholderTextColor={colors.textMuted} value={adjectiveText} onChangeText={setAdjectiveText} autoCapitalize="none" />
              </FormField>
              <FormField label="Türkçe anlamı *">
                <TextInput style={styles.input} placeholder="ör. komik" placeholderTextColor={colors.textMuted} value={adjectiveTr} onChangeText={setAdjectiveTr} />
              </FormField>
            </>
          )}

          {duplicateWarning ? <Text style={styles.warningText}>⚠️ {duplicateWarning}</Text> : null}
          {error ? <Text style={styles.errorText}>❌ {error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Kaydet</Text>
          </Pressable>
          <Pressable style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneText}>Bitti, geri dön</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(2.5), paddingBottom: spacing(6) },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing(0.5), fontSize: 14, marginBottom: spacing(2) },
  field: { marginBottom: spacing(1.75) },
  fieldLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: spacing(0.75), textTransform: 'uppercase' },
  input: { backgroundColor: colors.card, color: colors.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  segmentRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.accentDark },
  segmentText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  segmentTextActive: { color: '#fff' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, marginRight: spacing(1.25), alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.accentDark, borderColor: colors.accentDark },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 14 },
  toggleLabel: { color: colors.text, fontSize: 13, flexShrink: 1 },
  irregularBox: { backgroundColor: colors.card, borderRadius: 14, padding: spacing(1.5), marginBottom: spacing(1.5) },
  irregularHint: { color: colors.info, fontSize: 12, marginBottom: spacing(1), lineHeight: 17 },
  warningText: { color: colors.info, fontSize: 13, marginBottom: spacing(1) },
  errorText: { color: colors.error, fontSize: 13, marginBottom: spacing(1), fontWeight: '600' },
  successText: { color: colors.success, fontSize: 14, marginBottom: spacing(1), fontWeight: '700' },
  saveBtn: { backgroundColor: colors.accentDark, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: spacing(1) },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneText: { color: colors.textMuted, fontWeight: '600' },
});
