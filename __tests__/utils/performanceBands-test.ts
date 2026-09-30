import { resolveBand, BandComparator, BandDefinition } from '../../utils/performanceBands';

describe('resolveBand', () => {
    const bandLadderGte: BandDefinition<string>[] = [
        { key: 'elite', threshold: 90 },
        { key: 'pro', threshold: 75 },
        { key: 'scratch', threshold: 0 },
    ];

    const bandLadderLte: BandDefinition<string>[] = [
        { key: 'makes', threshold: 1 },
        { key: 'twoshots', threshold: 2 },
        { key: 'threeshots', threshold: 3 },
        { key: 'fourplus', threshold: 100 },
    ];

    describe('gte comparator (highest-priority match wins)', () => {
        it('returns first band when value clears highest threshold', () => {
            expect(resolveBand(95, bandLadderGte, 'gte')).toBe('elite');
        });

        it('returns second band when value clears middle threshold but not first', () => {
            expect(resolveBand(80, bandLadderGte, 'gte')).toBe('pro');
        });

        it('returns last band when value does not clear any threshold above zero', () => {
            expect(resolveBand(50, bandLadderGte, 'gte')).toBe('scratch');
        });

        it('returns first band when value equals threshold exactly', () => {
            expect(resolveBand(90, bandLadderGte, 'gte')).toBe('elite');
        });

        it('returns last band when value is zero', () => {
            expect(resolveBand(0, bandLadderGte, 'gte')).toBe('scratch');
        });
    });

    describe('lte comparator (first band value is under or at threshold)', () => {
        it('returns first band when value equals threshold', () => {
            expect(resolveBand(1, bandLadderLte, 'lte')).toBe('makes');
        });

        it('returns first band when value is under threshold', () => {
            expect(resolveBand(0, bandLadderLte, 'lte')).toBe('makes');
        });

        it('returns second band when value is between thresholds', () => {
            expect(resolveBand(1.5, bandLadderLte, 'lte')).toBe('twoshots');
        });

        it('returns third band when value is at third threshold', () => {
            expect(resolveBand(3, bandLadderLte, 'lte')).toBe('threeshots');
        });

        it('returns last band when value exceeds all thresholds', () => {
            expect(resolveBand(200, bandLadderLte, 'lte')).toBe('fourplus');
        });
    });

    describe('single-band array', () => {
        const singleBand: BandDefinition<string>[] = [{ key: 'only', threshold: 50 }];

        it('returns the only band with gte', () => {
            expect(resolveBand(75, singleBand, 'gte')).toBe('only');
        });

        it('returns the only band when value does not clear threshold with gte', () => {
            expect(resolveBand(25, singleBand, 'gte')).toBe('only');
        });

        it('returns the only band with lte', () => {
            expect(resolveBand(30, singleBand, 'lte')).toBe('only');
        });

        it('returns the only band when value exceeds threshold with lte', () => {
            expect(resolveBand(75, singleBand, 'lte')).toBe('only');
        });
    });

    describe('negative and decimal thresholds', () => {
        const mixedBands: BandDefinition<string>[] = [
            { key: 'high', threshold: 10.5 },
            { key: 'low', threshold: -5.5 },
        ];

        it('handles decimal thresholds with gte', () => {
            expect(resolveBand(10.6, mixedBands, 'gte')).toBe('high');
            expect(resolveBand(10.4, mixedBands, 'gte')).toBe('low');
        });

        it('handles negative thresholds with gte', () => {
            expect(resolveBand(-5, mixedBands, 'gte')).toBe('low');
        });

        it('handles decimal thresholds with lte', () => {
            expect(resolveBand(10.5, mixedBands, 'lte')).toBe('high');
            expect(resolveBand(10.6, mixedBands, 'lte')).toBe('low');
        });
    });
});
