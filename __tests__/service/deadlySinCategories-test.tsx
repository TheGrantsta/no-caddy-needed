import { sortDeadlySinsByFrequency, SIN_DETAIL_FIELDS } from '../../service/deadlySinCategories';
import { DeadlySinsRound } from '../../service/DbService';

const makeRound = (overrides: Partial<DeadlySinsRound>): DeadlySinsRound => ({
    Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
    DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0, RoundId: 1, Created_At: '01/06',
    ...overrides,
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

        expect(keys).toEqual(['TroubleOffTee', 'Penalties', 'ThreePutts', 'BogeysInside9Iron', 'DoubleChips', 'DoubleBogeys', 'BogeysPar5']);
    });

    it('handles an empty rounds array', () => {
        const result = sortDeadlySinsByFrequency([]);

        expect(result).toHaveLength(7);
        expect(result.every(c => c.count === 0)).toBe(true);
    });
});

describe('SIN_DETAIL_FIELDS', () => {
    it('has exactly four sins with detail fields', () => {
        expect(Object.keys(SIN_DETAIL_FIELDS)).toHaveLength(4);
    });

    it('includes TroubleOffTee with correct field and label', () => {
        expect(SIN_DETAIL_FIELDS.TroubleOffTee).toEqual({
            field: 'TroubleOffTeeClub',
            label: 'Club used off the tee',
        });
    });

    it('includes Penalties with correct field and label', () => {
        expect(SIN_DETAIL_FIELDS.Penalties).toEqual({
            field: 'PenaltyType',
            label: 'Penalty type',
        });
    });

    it('includes BogeysInside9Iron with correct field and label', () => {
        expect(SIN_DETAIL_FIELDS.BogeysInside9Iron).toEqual({
            field: 'BogeysInside9IronClub',
            label: 'Approach club',
        });
    });

    it('includes DoubleChips with correct field and label', () => {
        expect(SIN_DETAIL_FIELDS.DoubleChips).toEqual({
            field: 'DoubleChipsReason',
            label: 'Double chip reason',
        });
    });

    it('does not include ThreePutts', () => {
        expect(SIN_DETAIL_FIELDS.ThreePutts).toBeUndefined();
    });

    it('does not include DoubleBogeys', () => {
        expect(SIN_DETAIL_FIELDS.DoubleBogeys).toBeUndefined();
    });

    it('does not include BogeysPar5', () => {
        expect(SIN_DETAIL_FIELDS.BogeysPar5).toBeUndefined();
    });
});
