import { DEADLY_SIN_CATEGORIES, sortDeadlySinsByFrequency } from '../../service/deadlySinCategories';
import { DeadlySinsRound } from '../../service/DbService';

const makeRound = (overrides: Partial<DeadlySinsRound>): DeadlySinsRound => ({
    Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
    DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0, RoundId: 1, Created_At: '01/06',
    ...overrides,
});

describe('DEADLY_SIN_CATEGORIES', () => {
    it('lists the seven sins with their keys and labels in canonical order', () => {
        expect(DEADLY_SIN_CATEGORIES).toEqual([
            { key: 'TroubleOffTee', label: 'Trouble off tee' },
            { key: 'Penalties', label: 'Penalties' },
            { key: 'ThreePutts', label: '3-putts' },
            { key: 'BogeysInside9Iron', label: 'Bogeys inside 9-iron' },
            { key: 'DoubleChips', label: 'Double chips' },
            { key: 'DoubleBogeys', label: 'Double bogeys' },
            { key: 'BogeysPar5', label: 'Bogeys on par 5' },
        ]);
    });
});

describe('sortDeadlySinsByFrequency', () => {
    it('returns one entry per category with summed counts', () => {
        const rounds = [
            makeRound({ ThreePutts: 2, Penalties: 1 }),
            makeRound({ ThreePutts: 1 }),
        ];

        const result = sortDeadlySinsByFrequency(rounds);

        expect(result).toHaveLength(7);
        expect(result.find(c => c.key === 'ThreePutts')).toEqual({ key: 'ThreePutts', label: '3-putts', count: 3 });
    });

    it('orders categories by count descending', () => {
        const rounds = [makeRound({ ThreePutts: 5, Penalties: 2, TroubleOffTee: 1 })];

        const keys = sortDeadlySinsByFrequency(rounds).map(c => c.key);

        expect(keys[0]).toBe('ThreePutts');
        expect(keys[1]).toBe('Penalties');
        expect(keys[2]).toBe('TroubleOffTee');
    });

    it('breaks ties using the canonical category order (stable sort)', () => {
        const keys = sortDeadlySinsByFrequency([makeRound({})]).map(c => c.key);

        expect(keys).toEqual(DEADLY_SIN_CATEGORIES.map(c => c.key));
    });

    it('handles an empty rounds array', () => {
        const result = sortDeadlySinsByFrequency([]);

        expect(result).toHaveLength(7);
        expect(result.every(c => c.count === 0)).toBe(true);
    });
});
