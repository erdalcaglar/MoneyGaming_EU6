export type BuilderMode = 'simple' | 'question' | 'perfekt' | 'modal' | 'subordinate' | 'free';

export type WordCategory = 'fiil' | 'isim' | 'sifat';

export type RootStackParamList = {
  Home: undefined;
  Builder: { mode: BuilderMode };
  WordList: { initialCategory?: 'fiil' | 'isim' | 'sifat' | 'c1' };
  Expressions: undefined;
  AddWord: { initialCategory?: WordCategory };
};
