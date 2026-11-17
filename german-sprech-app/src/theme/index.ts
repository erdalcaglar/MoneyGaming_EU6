export type Scheme = 'light' | 'dark';

/** Colour pair for a word chip: soft fill + readable text on it. */
export interface Tone {
  bg: string;
  fg: string;
}

/**
 * Word-class tones. Nouns AND their articles share a tone per gender
 * (der = blue, die = rose, das = green — the convention German course books
 * use), so a matching article/noun pair is visible at a glance.
 */
export type ToneKey = 'der' | 'die' | 'das' | 'verb' | 'adjective' | 'pronoun' | 'neutral';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  /** flag gold: the one loud colour, reserved for the main action */
  primary: string;
  onPrimary: string;
  /** text-coloured accent for links/active states (gold is unreadable on white) */
  accent: string;
  success: string;
  error: string;
  info: string;
  overlay: string;
  tones: Record<ToneKey, Tone>;
}

export const palettes: Record<Scheme, Palette> = {
  light: {
    bg: '#F3F5F8',
    surface: '#FFFFFF',
    surfaceAlt: '#E8ECF1',
    border: '#D7DDE5',
    text: '#141A22',
    textMuted: '#5A6575',
    primary: '#F5C400',
    onPrimary: '#141A22',
    accent: '#755800',
    success: '#17794B',
    error: '#C2302A',
    info: '#8A5A00',
    overlay: 'rgba(20,26,34,0.45)',
    tones: {
      der: { bg: '#DCE7FF', fg: '#1B3F99' },
      die: { bg: '#FFDDE2', fg: '#96192E' },
      das: { bg: '#DDF2D2', fg: '#2B6116' },
      verb: { bg: '#E9E0FF', fg: '#4A2A9C' },
      adjective: { bg: '#D2EFF1', fg: '#0E575E' },
      pronoun: { bg: '#141A22', fg: '#FFFFFF' },
      neutral: { bg: '#E4E8EE', fg: '#2F3946' },
    },
  },
  dark: {
    bg: '#0E1218',
    surface: '#171D26',
    surfaceAlt: '#202836',
    border: '#2C3646',
    text: '#EEF1F5',
    textMuted: '#96A2B4',
    primary: '#FFD21F',
    onPrimary: '#141A22',
    accent: '#FFD21F',
    success: '#4FC78D',
    error: '#FF7068',
    info: '#F2B550',
    overlay: 'rgba(0,0,0,0.6)',
    tones: {
      der: { bg: '#1C3063', fg: '#BDD0FF' },
      die: { bg: '#5C1F2B', fg: '#FFC4CC' },
      das: { bg: '#27481A', fg: '#C3ECAF' },
      verb: { bg: '#37266F', fg: '#D8CAFF' },
      adjective: { bg: '#0F4449', fg: '#A9E6EA' },
      pronoun: { bg: '#EEF1F5', fg: '#141A22' },
      neutral: { bg: '#283140', fg: '#D6DCE6' },
    },
  },
};

/**
 * German text is set in Atkinson Hyperlegible (letterforms built to be told
 * apart — ß/B, l/I, ä/a — which is what matters when you're learning to
 * spell). Turkish UI text stays in the platform's own system font, so the
 * two languages are visually distinct everywhere.
 */
export const fonts = {
  de: 'AtkinsonHyperlegible_400Regular',
  deBold: 'AtkinsonHyperlegible_700Bold',
};

export const space = (n: number) => n * 4;
export const radius = { chip: 10, control: 12, card: 16, sheet: 22 };
export const CONTENT_MAX_WIDTH = 720;
export const WIDE_BREAKPOINT = 900;

export interface Theme {
  scheme: Scheme;
  c: Palette;
}
