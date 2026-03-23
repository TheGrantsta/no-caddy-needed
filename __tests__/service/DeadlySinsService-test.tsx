import {
    insertHoleDeadlySinsService,
    getAllDeadlySinsRoundsService,
    getDeadlySinsForRoundService,
    DeadlySinsValues,
} from '../../service/DbService';
import {
    insertHoleDeadlySins,
    getAllDeadlySinsRoundTotals,
    getDeadlySinsForRound,
    getAllRounds,
    getRoundById,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    insertHoleDeadlySins: jest.fn(),
    getAllDeadlySinsRoundTotals: jest.fn(),
    getDeadlySinsForRound: jest.fn(),
    getAllRounds: jest.fn(),
    getRoundById: jest.fn(),
}));

const mockInsertHoleDeadlySins = insertHoleDeadlySins as jest.Mock;
const mockGetAllDeadlySinsRoundTotals = getAllDeadlySinsRoundTotals as jest.Mock;
const mockGetDeadlySinsForRound = getDeadlySinsForRound as jest.Mock;
const mockGetAllRounds = getAllRounds as jest.Mock;
const mockGetRoundById = getRoundById as jest.Mock;

const allFalseSins: DeadlySinsValues = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

describe('insertHoleDeadlySinsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('delegates to insertHoleDeadlySins with roundId, holeNumber, sins', async () => {
        mockInsertHoleDeadlySins.mockResolvedValue(true);

        await insertHoleDeadlySinsService(1, 3, { ...allFalseSins, threePutts: true });

        expect(mockInsertHoleDeadlySins).toHaveBeenCalledWith(
            1, 3, expect.objectContaining({ threePutts: true })
        );
    });

    it('returns true when db insert succeeds', async () => {
        mockInsertHoleDeadlySins.mockResolvedValue(true);

        const result = await insertHoleDeadlySinsService(1, 1, allFalseSins);

        expect(result).toBe(true);
    });

    it('returns false when db insert fails', async () => {
        mockInsertHoleDeadlySins.mockResolvedValue(false);

        const result = await insertHoleDeadlySinsService(1, 1, allFalseSins);

        expect(result).toBe(false);
    });

    it('passes all seven sin boolean values to db', async () => {
        mockInsertHoleDeadlySins.mockResolvedValue(true);
        const sins: DeadlySinsValues = {
            threePutts: true,
            doubleBogeys: false,
            bogeysPar5: true,
            bogeysInside9Iron: false,
            doubleChips: true,
            troubleOffTee: false,
            penalties: true,
        };

        await insertHoleDeadlySinsService(5, 9, sins);

        expect(mockInsertHoleDeadlySins).toHaveBeenCalledWith(5, 9, sins);
    });
});

describe('getAllDeadlySinsRoundsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when no rounds exist', () => {
        mockGetAllDeadlySinsRoundTotals.mockReturnValue([]);
        mockGetAllRounds.mockReturnValue([]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toEqual([]);
    });

    it('returns one entry per round with correct totals', () => {
        mockGetAllDeadlySinsRoundTotals.mockReturnValue([
            { RoundId: 1, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, TroubleOffTee: 1, Penalties: 0, Total: 5 },
        ]);
        mockGetAllRounds.mockReturnValue([
            { Id: 1, Created_At: '2025-06-15T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toHaveLength(1);
        expect(result[0].ThreePutts).toBe(2);
        expect(result[0].Total).toBe(5);
        expect(result[0].RoundId).toBe(1);
    });

    it('formats Created_At dates correctly from matching Round', () => {
        mockGetAllDeadlySinsRoundTotals.mockReturnValue([
            { RoundId: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 1 },
        ]);
        mockGetAllRounds.mockReturnValue([
            { Id: 1, Created_At: '2025-06-15T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result[0].Created_At).toBe('15/06');
    });

    it('preserves all seven stat fields', () => {
        mockGetAllDeadlySinsRoundTotals.mockReturnValue([
            { RoundId: 99, ThreePutts: 1, DoubleBogeys: 2, BogeysPar5: 3, BogeysInside9Iron: 4, DoubleChips: 5, TroubleOffTee: 6, Penalties: 7, Total: 28 },
        ]);
        mockGetAllRounds.mockReturnValue([
            { Id: 99, Created_At: '2025-01-10T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result[0]).toEqual(expect.objectContaining({
            ThreePutts: 1,
            DoubleBogeys: 2,
            BogeysPar5: 3,
            BogeysInside9Iron: 4,
            DoubleChips: 5,
            TroubleOffTee: 6,
            Penalties: 7,
            Total: 28,
            RoundId: 99,
            Created_At: '10/01',
        }));
    });

    it('returns multiple rounds', () => {
        mockGetAllDeadlySinsRoundTotals.mockReturnValue([
            { RoundId: 2, ThreePutts: 1, DoubleBogeys: 1, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 1, TroubleOffTee: 1, Penalties: 1, Total: 7 },
            { RoundId: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0 },
        ]);
        mockGetAllRounds.mockReturnValue([
            { Id: 2, Created_At: '2025-02-20T12:00:00.000Z' },
            { Id: 1, Created_At: '2025-02-19T12:00:00.000Z' },
        ]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toHaveLength(2);
        expect(result[0].Total).toBe(7);
        expect(result[1].Total).toBe(0);
    });

    it('uses empty Created_At when round not found in Rounds', () => {
        mockGetAllDeadlySinsRoundTotals.mockReturnValue([
            { RoundId: 99, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 1 },
        ]);
        mockGetAllRounds.mockReturnValue([]);

        const result = getAllDeadlySinsRoundsService();

        expect(result).toHaveLength(1);
        expect(result[0].RoundId).toBe(99);
    });
});

describe('getDeadlySinsForRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when no sins data for round', () => {
        mockGetDeadlySinsForRound.mockReturnValue(null);

        const result = getDeadlySinsForRoundService(1);

        expect(result).toBeNull();
    });

    it('returns DeadlySinsRound with all fields when data exists', () => {
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1,
            DoubleChips: 0, TroubleOffTee: 1, Penalties: 0,
        });
        mockGetRoundById.mockReturnValue({ Id: 5, Created_At: '2025-06-15T12:00:00.000Z' });

        const result = getDeadlySinsForRoundService(5);

        expect(result).not.toBeNull();
        expect(result!.ThreePutts).toBe(2);
        expect(result!.DoubleBogeys).toBe(1);
        expect(result!.RoundId).toBe(5);
    });

    it('formats Created_At from matching round', () => {
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
            DoubleChips: 0, TroubleOffTee: 0, Penalties: 0,
        });
        mockGetRoundById.mockReturnValue({ Id: 5, Created_At: '2025-06-15T12:00:00.000Z' });

        const result = getDeadlySinsForRoundService(5);

        expect(result!.Created_At).toBe('15/06');
    });

    it('computes Total as sum of all seven sins', () => {
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 1, DoubleBogeys: 2, BogeysPar5: 3, BogeysInside9Iron: 1,
            DoubleChips: 0, TroubleOffTee: 1, Penalties: 2,
        });
        mockGetRoundById.mockReturnValue({ Id: 1, Created_At: '2025-01-01T12:00:00.000Z' });

        const result = getDeadlySinsForRoundService(1);

        expect(result!.Total).toBe(10);
    });

    it('passes roundId to db functions', () => {
        mockGetDeadlySinsForRound.mockReturnValue(null);

        getDeadlySinsForRoundService(42);

        expect(mockGetDeadlySinsForRound).toHaveBeenCalledWith(42);
    });
});
