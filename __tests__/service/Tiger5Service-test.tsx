import { insertDeadlySinsRoundService, getAllDeadlySinsRoundsService } from '../../service/DbService';
import { insertDeadlySinsRound, getAllDeadlySinsRounds, getDeadlySinsRoundByRoundId } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertDeadlySinsRound: jest.fn(),
    getAllDeadlySinsRounds: jest.fn(),
    getDeadlySinsRoundByRoundId: jest.fn(),
}));

const mockInsertDeadlySinsRound = insertDeadlySinsRound as jest.Mock;
const mockGetAllDeadlySinsRounds = getAllDeadlySinsRounds as jest.Mock;

describe('insertDeadlySinsRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('computes total as sum of all seven stats and delegates to DB', async () => {
        mockInsertDeadlySinsRound.mockResolvedValue(true);

        const result = await insertDeadlySinsRoundService(1, 1, 2, 3, 4, 5, 6, 7);

        expect(mockInsertDeadlySinsRound).toHaveBeenCalledWith(1, 1, 2, 3, 4, 5, 6, 7, 28);
        expect(result).toBe(true);
    });

    it('returns false when DB insert fails', async () => {
        mockInsertDeadlySinsRound.mockResolvedValue(false);

        const result = await insertDeadlySinsRoundService(1, 1, 0, 0, 0, 0, 0, 0);

        expect(result).toBe(false);
    });

    it('computes total of zero when all stats are zero', async () => {
        mockInsertDeadlySinsRound.mockResolvedValue(true);

        await insertDeadlySinsRoundService(null, 0, 0, 0, 0, 0, 0, 0);

        expect(mockInsertDeadlySinsRound).toHaveBeenCalledWith(null, 0, 0, 0, 0, 0, 0, 0, 0);
    });
});

describe('getAllDeadlySinsRoundsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when no rounds exist', () => {
        mockGetAllDeadlySinsRounds.mockReturnValue([]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toEqual([]);
    });

    it('formats Created_At dates correctly', () => {
        mockGetAllDeadlySinsRounds.mockReturnValue([
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 1, RoundId: 1, Created_At: '2025-06-15T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toHaveLength(1);
        expect(result[0].Created_At).toBe('15/06');
    });

    it('preserves all seven stat fields', () => {
        mockGetAllDeadlySinsRounds.mockReturnValue([
            { Id: 1, ThreePutts: 2, DoubleBogeys: 3, BogeysPar5: 1, BogeysInside9Iron: 4, DoubleChips: 0, TroubleOffTee: 5, Penalties: 2, Total: 17, RoundId: 7, Created_At: '2025-01-10T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result[0]).toEqual({
            Id: 1,
            ThreePutts: 2,
            DoubleBogeys: 3,
            BogeysPar5: 1,
            BogeysInside9Iron: 4,
            DoubleChips: 0,
            TroubleOffTee: 5,
            Penalties: 2,
            Total: 17,
            RoundId: 7,
            Created_At: '10/01',
        });
    });

    it('maps RoundId through to returned object when present', () => {
        mockGetAllDeadlySinsRounds.mockReturnValue([
            { Id: 3, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0, RoundId: 42, Created_At: '2025-03-01T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result[0].RoundId).toBe(42);
    });

    it('excludes rows where RoundId is null', () => {
        mockGetAllDeadlySinsRounds.mockReturnValue([
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 1, RoundId: 5, Created_At: '2025-06-15T12:00:00.000Z' },
            { Id: 2, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0, RoundId: null, Created_At: '2025-06-14T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toHaveLength(1);
        expect(result[0].Id).toBe(1);
    });

    it('returns multiple rounds', () => {
        mockGetAllDeadlySinsRounds.mockReturnValue([
            { Id: 2, ThreePutts: 1, DoubleBogeys: 1, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 1, TroubleOffTee: 1, Penalties: 1, Total: 7, RoundId: 2, Created_At: '2025-02-20T12:00:00.000Z' },
            { Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0, RoundId: 1, Created_At: '2025-02-19T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toHaveLength(2);
        expect(result[0].Total).toBe(7);
        expect(result[1].Total).toBe(0);
    });
});
