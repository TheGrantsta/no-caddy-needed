import { describeWindEffect } from '../../utils/windEffectDescription';
import type { WindEffect } from '../../service/WeatherService';

const effect = (overrides: Partial<WindEffect>): WindEffect => ({
    alongComponentMph: 0,
    crossComponentMph: 0,
    playsLongerPercent: 0,
    category: 'calm',
    crossDirection: null,
    ...overrides,
});

describe('describeWindEffect', () => {
    it('shouldSayPlaysShorterWhenWindIsHelping', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 3, category: 'tailwind' }));

        expect(result.title).toBe('Plays shorter');
    });

    it('shouldSayPlaysLongerWhenWindIsHurting', () => {
        const result = describeWindEffect(effect({ alongComponentMph: -4, category: 'headwind' }));

        expect(result.title).toBe('Plays longer');
    });

    it('shouldSayPlaysAboutTheSameWhenWindIsOnlyCrossing', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 0, crossComponentMph: 5, crossDirection: 'left', category: 'crosswind' }));

        expect(result.title).toBe('Plays about the same');
    });

    it('shouldSayPlaysAboutTheSameInCalmWindEvenWhenAComponentIsSmall', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 2, category: 'calm' }));

        expect(result.title).toBe('Plays about the same');
        expect(result.rows).toEqual([]);
    });

    it('shouldShowAHelpingRowWithTheRoundedMphWhenWindIsHelping', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 3.4, category: 'tailwind' }));

        expect(result.rows).toContainEqual({ label: 'Helping', value: '3 mph' });
    });

    it('shouldShowAHurtingRowWithTheMagnitudeWhenWindIsHurting', () => {
        const result = describeWindEffect(effect({ alongComponentMph: -4.6, category: 'headwind' }));

        expect(result.rows).toContainEqual({ label: 'Hurting', value: '5 mph' });
    });

    it('shouldShowALeftToRightRowWhenWindComesFromTheLeft', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 3, crossComponentMph: 5, crossDirection: 'left', category: 'tailwind' }));

        expect(result.rows).toContainEqual({ label: 'Left to right', value: '5 mph' });
    });

    it('shouldShowARightToLeftRowWhenWindComesFromTheRight', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 0, crossComponentMph: -2, crossDirection: 'right', category: 'crosswind' }));

        expect(result.rows).toContainEqual({ label: 'Right to left', value: '2 mph' });
    });

    it('shouldOmitTheCrossRowWhenThereIsNoCrossWind', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 3, crossDirection: null, category: 'tailwind' }));

        expect(result.rows.map(r => r.label)).toEqual(['Helping']);
    });

    it('shouldJoinTheHelpingAndCrossWordsIntoTheSubtitle', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 3, crossComponentMph: 5, crossDirection: 'left', category: 'tailwind' }));

        expect(result.subtitle).toBe('Helping, left to right');
    });

    it('shouldShowAHurtingSubtitleForAHeadwind', () => {
        const result = describeWindEffect(effect({ alongComponentMph: -4, category: 'headwind' }));

        expect(result.subtitle).toBe('Hurting');
    });

    it('shouldShowALightWindSubtitleWhenThereIsNoEffectToReport', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 0.2, category: 'calm' }));

        expect(result.subtitle).toBe('Little or no wind effect');
    });

    it('shouldNotRepeatTheCrossWindInTheSubtitleWhenThereIsNoAlongWind', () => {
        const result = describeWindEffect(effect({ alongComponentMph: 0, crossComponentMph: -2, crossDirection: 'right', category: 'crosswind' }));

        expect(result.title).toBe('Plays about the same');
        expect(result.subtitle).toBe('');
        expect(result.rows).toContainEqual({ label: 'Right to left', value: '2 mph' });
    });
});
