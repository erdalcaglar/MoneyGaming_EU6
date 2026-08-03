export const colors = {
  bg: '#0f1720',
  card: '#1a2433',
  cardAlt: '#22304a',
  accent: '#4fc3f7',
  accentDark: '#0288d1',
  success: '#4caf50',
  error: '#ef5350',
  info: '#ffb74d',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#2c3b52',
  chipDefault: '#243247',
  chipPronoun: '#3d5a80',
  chipVerb: '#7b4fa6',
  chipArticle: '#b06a3a',
  chipNoun: '#2c7a5f',
  chipAdjective: '#a94f6d',
  chipQuestion: '#c9a227',
  chipConnector: '#5c6b73',
};

export const spacing = (n: number) => n * 8;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '600' as const, color: colors.textMuted },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
};
