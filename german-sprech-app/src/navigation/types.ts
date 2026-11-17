export type BuilderMode = 'simple' | 'question' | 'perfekt' | 'modal' | 'subordinate' | 'free';

export type WordCategory = 'fiil' | 'isim' | 'sifat';

export type RootStackParamList = {
  Main: undefined;
  Builder: { mode: BuilderMode };
  AddWord: { initialCategory?: WordCategory };
};
