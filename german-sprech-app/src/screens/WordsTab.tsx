import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { Gender } from '../data/types';
import { IconButton, ScreenTitle, SearchField, Segmented } from '../components/ui';
import { speakGerman } from '../components/speak';
import { useProgress } from '../context/ProgressContext';
import { useCustomVocab } from '../context/CustomVocabContext';
import { useTheme } from '../context/SettingsContext';
import { fonts, radius, space } from '../theme';

type Category = 'fiil' | 'isim' | 'sifat' | 'c1';

interface Row {
  id: string;
  de: string;
  article?: Gender;
  tr: string;
  level: string;
  isCustom: boolean;
}

export const WordsTab: React.FC = () => {
  const t = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [category, setCategory] = useState<Category>('fiil');
  const [search, setSearch] = useState('');
  const { isFavorite, toggleFavorite } = useProgress();
  const customVocab = useCustomVocab();

  // `version` drives recomputation: the word arrays are mutated in place when a custom word is added.
  const rows = useMemo<Row[]>(() => {
    if (category === 'fiil') return verbs.map((v) => ({ id: v.id, de: v.infinitive, tr: v.tr, level: v.level, isCustom: customVocab.customVerbIds.has(v.id) }));
    if (category === 'c1') return verbsC1.map((v) => ({ id: v.id, de: v.infinitive, tr: v.tr, level: 'C1', isCustom: false }));
    if (category === 'isim') return nouns.map((n) => ({ id: n.id, de: n.noun, article: n.gender, tr: n.tr, level: n.level, isCustom: customVocab.customNounIds.has(n.id) }));
    return adjectives.map((a) => ({ id: a.id, de: a.adjective, tr: a.tr, level: a.level, isCustom: customVocab.customAdjectiveIds.has(a.id) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, customVocab.version]);

  const q = search.trim().toLowerCase();
  const filtered = q ? rows.filter((r) => r.de.toLowerCase().includes(q) || r.tr.toLowerCase().includes(q)) : rows;

  function remove(row: Row) {
    if (category === 'isim') customVocab.removeNoun(row.id);
    else if (category === 'sifat') customVocab.removeAdjective(row.id);
    else customVocab.removeVerb(row.id);
  }

  const header = (
    <View style={{ gap: space(3), paddingBottom: space(3) }}>
      <ScreenTitle
        title="Kelimeler"
        subtitle={`${filtered.length} kelime`}
        right={<IconButton icon="plus" label="Kelime ekle" color={t.c.text} onPress={() => navigation.navigate('AddWord', { initialCategory: category === 'c1' ? 'fiil' : category })} />}
      />
      <View style={{ marginTop: -space(3) }}>
        <Segmented
          value={category}
          onChange={setCategory}
          options={[
            { value: 'fiil', label: 'Fiil' },
            { value: 'isim', label: 'İsim' },
            { value: 'sifat', label: 'Sıfat' },
            { value: 'c1', label: 'C1 fiil' },
          ]}
        />
      </View>
      <SearchField value={search} onChangeText={setSearch} placeholder="Almanca ya da Türkçe ara" />
    </View>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(8) }}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={20}
      ListEmptyComponent={<Text style={{ color: t.c.textMuted, fontSize: 15, textAlign: 'center', paddingVertical: space(8) }}>Bu aramayla eşleşen kelime yok.</Text>}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 60, borderBottomWidth: 1, borderBottomColor: t.c.border, gap: space(1) }}>
          <View style={{ flex: 1, gap: 2, paddingVertical: space(2) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2), flexWrap: 'wrap' }}>
              {item.article ? (
                <View style={{ backgroundColor: t.c.tones[item.article].bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ fontFamily: fonts.deBold, fontSize: 13, color: t.c.tones[item.article].fg }}>{item.article}</Text>
                </View>
              ) : null}
              <Text style={{ fontFamily: fonts.deBold, fontSize: 17, color: t.c.text }}>{item.de}</Text>
              {item.isCustom ? (
                <View style={{ borderRadius: radius.chip, borderWidth: 1, borderColor: t.c.border, paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: t.c.textMuted }}>senin</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontSize: 14, color: t.c.textMuted }}>
              {item.tr} · {item.level}
            </Text>
          </View>
          <IconButton icon="volume" label={`${item.de} kelimesini dinle`} onPress={() => speakGerman(item.article ? `${item.article} ${item.de}` : item.de)} size={20} />
          {item.isCustom ? <IconButton icon="trash" label={`${item.de} kelimesini sil`} onPress={() => remove(item)} size={20} /> : null}
          <IconButton
            icon="star"
            label={isFavorite(item.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            onPress={() => toggleFavorite(item.id)}
            color={isFavorite(item.id) ? t.c.primary : t.c.textMuted}
            filled={isFavorite(item.id)}
            size={20}
          />
        </View>
      )}
    />
  );
};
