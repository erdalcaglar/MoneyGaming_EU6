import { renderTokens } from './grammar';
import { SentenceToken } from './tokens';

/** Surface text for each token chip in the sentence strip, keyed by token uid. */
export function chipLabels(tokens: SentenceToken[]): Record<string, string> {
  const labels: Record<string, string> = {};
  renderTokens(tokens).forEach((r) => {
    labels[r.uid] = r.tail ? `${r.text} … ${r.tail}` : r.text;
  });
  return labels;
}
