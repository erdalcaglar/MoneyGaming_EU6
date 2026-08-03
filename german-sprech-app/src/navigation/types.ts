export type BuilderMode = 'simple' | 'question' | 'perfekt' | 'modal' | 'subordinate' | 'free';

export type RootStackParamList = {
  Home: undefined;
  Builder: { mode: BuilderMode };
  WordList: { initialCategory?: 'fiil' | 'isim' | 'sifat' | 'c1' };
  Expressions: undefined;
};
