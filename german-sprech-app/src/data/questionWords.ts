export interface QuestionWordDef {
  word: string;
  tr: string;
}

export const questionWords: QuestionWordDef[] = [
  { word: 'wer', tr: 'kim' },
  { word: 'was', tr: 'ne' },
  { word: 'wo', tr: 'nerede' },
  { word: 'wohin', tr: 'nereye' },
  { word: 'woher', tr: 'nereden' },
  { word: 'wann', tr: 'ne zaman' },
  { word: 'warum', tr: 'neden' },
  { word: 'wie', tr: 'nasıl' },
  { word: 'welche', tr: 'hangi' },
  { word: 'wie viel', tr: 'ne kadar' },
];

export interface ConnectorDef {
  word: 'weil' | 'dass' | 'und' | 'aber' | 'oder' | 'denn';
  tr: string;
  verbFinal: boolean;
}

export const connectors: ConnectorDef[] = [
  { word: 'weil', tr: 'çünkü', verbFinal: true },
  { word: 'dass', tr: 'ki / -diğini', verbFinal: true },
  { word: 'und', tr: 've', verbFinal: false },
  { word: 'aber', tr: 'ama', verbFinal: false },
  { word: 'oder', tr: 'veya', verbFinal: false },
  { word: 'denn', tr: 'çünkü (resmi)', verbFinal: false },
];

export interface FreeTextDef {
  text: string;
  tr: string;
  category: 'zeit' | 'ort';
}

export const timePlaceWords: FreeTextDef[] = [
  { text: 'heute', tr: 'bugün', category: 'zeit' },
  { text: 'morgen', tr: 'yarın', category: 'zeit' },
  { text: 'gestern', tr: 'dün', category: 'zeit' },
  { text: 'jetzt', tr: 'şimdi', category: 'zeit' },
  { text: 'oft', tr: 'sık sık', category: 'zeit' },
  { text: 'immer', tr: 'her zaman', category: 'zeit' },
  { text: 'nie', tr: 'asla', category: 'zeit' },
  { text: 'hier', tr: 'burada', category: 'ort' },
  { text: 'dort', tr: 'orada', category: 'ort' },
  { text: 'zu Hause', tr: 'evde', category: 'ort' },
  { text: 'in der Schule', tr: 'okulda', category: 'ort' },
];
