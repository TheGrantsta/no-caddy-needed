import { getPuttingStatsService, insertPuttingStatsService } from '../../service/DbService';
import { insertPuttingStats, getPuttingStats, deletePuttingStatsByHole } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertPuttingStats: jest.fn(),
    getPuttingStats: jest.fn(),
    deletePuttingStatsByHole: jest.fn(),
}));

const mockInsertPuttingStats = insertPuttingStats as jest.Mock;
const mockGetPuttingStats = getPuttingStats as jest.Mock;
const mockDeletePuttingStatsByHole = deletePuttingStatsByHole as jest.Mock;

describe('getPuttingStatsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when no putting stats exist for the hole', () => {
        mockGetPuttingStats.mockReturnValue([]);

        const result = getPuttingStatsService(1, 5);

        expect(result).toBeNull();
        expect(mockGetPuttingStats).toHaveBeenCalledWith(1, 5);
    });

    it('returns putting stats when they exist', () => {
        mockGetPuttingStats.mockReturnValue([
            {
                Id: 1,
                RoundId: 1,
                HoleNumber: 5,
                FirstPuttDistance: 25,
                SecondPuttDistance: 8,
                SecondPuttIsLong: 0,
                ThirdPuttDistance: null,
                ThirdPuttIsLong: null,
            },
        ]);

        const result = getPuttingStatsService(1, 5);

        expect(result).toEqual({
            Id: 1,
            RoundId: 1,
            HoleNumber: 5,
            FirstPuttDistance: 25,
            SecondPuttDistance: 8,
            SecondPuttIsLong: 0,
            ThirdPuttDistance: undefined,
            ThirdPuttIsLong: undefined,
        });
    });

    it('includes third putt data when present', () => {
        mockGetPuttingStats.mockReturnValue([
            {
                Id: 2,
                RoundId: 1,
                HoleNumber: 6,
                FirstPuttDistance: 35,
                SecondPuttDistance: 12,
                SecondPuttIsLong: 1,
                ThirdPuttDistance: 4,
                ThirdPuttIsLong: 0,
            },
        ]);

        const result = getPuttingStatsService(1, 6);

        expect(result?.ThirdPuttDistance).toBe(4);
        expect(result?.ThirdPuttIsLong).toBe(0);
    });
});

describe('insertPuttingStatsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deletes existing stats before inserting new ones', async () => {
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(true);

        await insertPuttingStatsService(1, 5, 25, 8, false);

        expect(mockDeletePuttingStatsByHole).toHaveBeenCalledWith(1, 5);
        expect(mockInsertPuttingStats).toHaveBeenCalledWith(1, 5, 25, 8, false, undefined, undefined);
    });

    it('inserts putting stats with third putt data', async () => {
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(true);

        await insertPuttingStatsService(1, 6, 35, 12, true, 4, false);

        expect(mockInsertPuttingStats).toHaveBeenCalledWith(1, 6, 35, 12, true, 4, false);
    });

    it('returns false if insert fails', async () => {
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(false);

        const result = await insertPuttingStatsService(1, 5, 25, 8, false);

        expect(result).toBe(false);
    });
});
