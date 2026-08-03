import { conjugatePresent, partizipII } from '../conjugate';
import { verbs } from '../../data/verbs';
import { verbsC1 } from '../../data/verbsC1';

function v(id: string) {
  const found = [...verbs, ...verbsC1].find((x) => x.id === id);
  if (!found) throw new Error(`missing verb ${id}`);
  return found;
}

describe('conjugatePresent — regular verbs', () => {
  it('conjugates sagen (weak/regular) for all persons', () => {
    const sagen = v('sagen');
    expect(conjugatePresent(sagen, 'ich')).toBe('sage');
    expect(conjugatePresent(sagen, 'du')).toBe('sagst');
    expect(conjugatePresent(sagen, 'er_sie_es')).toBe('sagt');
    expect(conjugatePresent(sagen, 'wir')).toBe('sagen');
    expect(conjugatePresent(sagen, 'ihr')).toBe('sagt');
    expect(conjugatePresent(sagen, 'sie_Sie')).toBe('sagen');
  });

  it('inserts schwa for stems ending in -t (arbeiten)', () => {
    const arbeiten = v('arbeiten');
    expect(conjugatePresent(arbeiten, 'du')).toBe('arbeitest');
    expect(conjugatePresent(arbeiten, 'er_sie_es')).toBe('arbeitet');
    expect(conjugatePresent(arbeiten, 'ihr')).toBe('arbeitet');
  });
});

describe('conjugatePresent — irregular verbs', () => {
  it('conjugates sein', () => {
    const sein = v('sein');
    expect(conjugatePresent(sein, 'ich')).toBe('bin');
    expect(conjugatePresent(sein, 'du')).toBe('bist');
    expect(conjugatePresent(sein, 'er_sie_es')).toBe('ist');
    expect(conjugatePresent(sein, 'wir')).toBe('sind');
    expect(conjugatePresent(sein, 'ihr')).toBe('seid');
    expect(conjugatePresent(sein, 'sie_Sie')).toBe('sind');
  });

  it('conjugates nehmen with stem-vowel change (du/er only)', () => {
    const nehmen = v('nehmen');
    expect(conjugatePresent(nehmen, 'ich')).toBe('nehme');
    expect(conjugatePresent(nehmen, 'du')).toBe('nimmst');
    expect(conjugatePresent(nehmen, 'er_sie_es')).toBe('nimmt');
    expect(conjugatePresent(nehmen, 'wir')).toBe('nehmen');
  });

  it('conjugates kommen (regular present, irregular participle)', () => {
    const kommen = v('kommen');
    expect(conjugatePresent(kommen, 'du')).toBe('kommst');
    expect(conjugatePresent(kommen, 'er_sie_es')).toBe('kommt');
  });
});

describe('partizipII', () => {
  it('builds regular participle: ge+stem+t', () => {
    expect(partizipII(v('sagen'))).toBe('gesagt');
    expect(partizipII(v('spielen'))).toBe('gespielt');
  });

  it('inserts -et for stems ending in -t/-d', () => {
    expect(partizipII(v('arbeiten'))).toBe('gearbeitet');
  });

  it('uses irregular override for strong verbs', () => {
    expect(partizipII(v('kommen'))).toBe('gekommen');
    expect(partizipII(v('nehmen'))).toBe('genommen');
    expect(partizipII(v('sehen'))).toBe('gesehen');
  });

  it('drops ge- for verbs with inseparable prefixes (be-/ver-/er-...)', () => {
    expect(partizipII(v('besuchen'))).toBe('besucht');
    expect(partizipII(v('verkaufen'))).toBe('verkauft');
    expect(partizipII(v('erzeugen'))).toBe('erzeugt');
  });

  it('drops ge- for -ieren verbs', () => {
    expect(partizipII(v('probieren'))).toBe('probiert');
  });

  it('places ge- after the separable prefix', () => {
    expect(partizipII(v('aufstehen'))).toBe('aufgestanden');
    expect(partizipII(v('aufwachen'))).toBe('aufgewacht');
  });

  it('handles a non-overridden separable verb via the heuristic', () => {
    expect(partizipII(v('aufhoeren'))).toBe('aufgehört');
    expect(partizipII(v('ausfuehren'))).toBe('ausgeführt');
    expect(partizipII(v('ablehnen'))).toBe('abgelehnt');
  });
});
