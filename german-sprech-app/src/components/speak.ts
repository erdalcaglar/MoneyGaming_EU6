import * as Speech from 'expo-speech';

/** Reads German text aloud; silently does nothing where speech isn't available. */
export function speakGerman(text: string): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'de-DE', rate: 0.92 });
  } catch {
    // speech synthesis unavailable (e.g. sandboxed browser) — not worth surfacing
  }
}
