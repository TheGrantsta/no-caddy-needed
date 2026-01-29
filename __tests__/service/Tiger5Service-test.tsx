import { insertTiger5RoundService, getAllTiger5RoundsService } from '../../service/DbService';
import { insertTiger5Round, getAllTiger5Rounds } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertTiger5Round: jest.fn(),
    getAllTiger5Rounds: jest.fn(),
}));

const mockInsertTiger5Round = insertTiger5Round as jest.Mock;
const mockGetAllTiger5Rounds = getAllTiger5Rounds as jest.Mock;

describe('insertTiger5RoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('computes total as sum of all five stats and delegates to DB', async () => {
        mockInsertTiger5Round.mockResolvedValue(true);

        const result = await insertTiger5RoundService(1, 2, 3, 4, 5);

        expect(mockInsertTiger5Round).toHaveBeenCalledWith(1, 2, 3, 4, 5, 15);
        expect(result).toBe(true);
    });

    it('returns false when DB insert fails', async () => {
        mockInsertTiger5Round.mockResolvedValue(false);

        const result = await insertTiger5RoundService(1, 0, 0, 0, 0);

        expect(result).toBe(false);
    });

    it('computes total of zero when all stats are zero', async () => {
        mockInsertTiger5Round.mockResolvedValue(true);

        await insertTiger5RoundService(0, 0, 0, 0, 0);

        expect(mockInsertTiger5Round).toHaveBeenCalledWith(0, 0, 0, 0, 0, 0);
    });
});

describe('getAllTiger5RoundsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when no rounds exist', () => {
        mockGetAllTiger5Rounds.mockReturnValue([]);

        const result = getAllTiger5RoundsService();

        expect(result).toEqual([]);
    });

    it('formats Created_At dates correctly', () => {
        mockGetAllTiger5Rounds.mockReturnValue([
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 1, Created_At: '2025-06-15T12:00:00.000Z' },
        ]);

        const result = getAllTiger5RoundsService();

        expect(result).toHaveLength(1);
        expect(result[0].Created_At).toBe('15/06');
    });

    it('preserves all stat fields', () => {
        mockGetAllTiger5Rounds.mockReturnValue([
            { Id: 1, ThreePutts: 2, DoubleBogeys: 3, BogeysPar5: 1, BogeysInside9Iron: 4, DoubleChips: 0, Total: 10, Created_At: '2025-01-10T12:00:00.000Z' },
        ]);

        const result = getAllTiger5RoundsService();

        expect(result[0]).toEqual({
            Id: 1,
            ThreePutts: 2,
            DoubleBogeys: 3,
            BogeysPar5: 1,
            BogeysInside9Iron: 4,
            DoubleChips: 0,
            Total: 10,
            Created_At: '10/01',
        });
    });

    it('returns multiple rounds', () => {
        mockGetAllTiger5Rounds.mockReturnValue([
            { Id: 2, ThreePutts: 1, DoubleBogeys: 1, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 1, Total: 5, Created_At: '2025-02-20T12:00:00.000Z' },
            { Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 0, Created_At: '2025-02-19T12:00:00.000Z' },
        ]);

        const result = getAllTiger5RoundsService();

        expect(result).toHaveLength(2);
        expect(result[0].Total).toBe(5);
        expect(result[1].Total).toBe(0);
    });
});
