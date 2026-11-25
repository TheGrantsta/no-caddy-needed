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
            GreenInRegulation: false,
            PuttCount: null,
        });
    });

    it('shouldMapGreenInRegulationTrueWhenStoredAsOne', () => {
        mockGetPuttingStats.mockReturnValue([
            {
                Id: 3,
                RoundId: 1,
                HoleNumber: 7,
                FirstPuttDistance: 12,
                SecondPuttDistance: 0,
                SecondPuttIsLong: 0,
                GreenInRegulation: 1,
            },
        ]);

        const result = getPuttingStatsService(1, 7);

        expect(result?.GreenInRegulation).toBe(true);
    });

    it('shouldMapGreenInRegulationFalseWhenColumnMissingFromRow', () => {
        mockGetPuttingStats.mockReturnValue([
            {
                Id: 4,
                RoundId: 1,
                HoleNumber: 8,
                FirstPuttDistance: 12,
                SecondPuttDistance: 0,
                SecondPuttIsLong: 0,
            },
        ]);

        const result = getPuttingStatsService(1, 8);

        expect(result?.GreenInRegulation).toBe(false);
    });
});

describe('insertPuttingStatsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deletes existing stats before inserting new ones', async () => {
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(true);

        await insertPuttingStatsService(1, 5, 25, 8, false, true, 2);

        expect(mockDeletePuttingStatsByHole).toHaveBeenCalledWith(1, 5);
        expect(mockInsertPuttingStats).toHaveBeenCalledWith(1, 5, 25, 8, false, true, 2);
    });

    it('inserts putting stats with third putt data', async () => {
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(true);

        await insertPuttingStatsService(1, 6, 35, 12, true, false, 2);

        expect(mockInsertPuttingStats).toHaveBeenCalledWith(1, 6, 35, 12, true, false, 2);
    });

    it('returns false if insert fails', async () => {
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(false);

        const result = await insertPuttingStatsService(1, 5, 25, 8, false);

        expect(result).toBe(false);
    });

});

describe('insertPuttingStatsService green in regulation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDeletePuttingStatsByHole.mockResolvedValue(true);
        mockInsertPuttingStats.mockResolvedValue(true);
    });

    it('shouldForwardGreenInRegulationTrueToInsert', async () => {
        await insertPuttingStatsService(1, 9, 15, 0, false, true, 2);

        expect(mockInsertPuttingStats).toHaveBeenCalledWith(1, 9, 15, 0, false, true, 2);
    });

    it('shouldDefaultGreenInRegulationToFalseWhenOmitted', async () => {
        await insertPuttingStatsService(1, 9, 15, 0, false, true, 2);

        expect(mockInsertPuttingStats).toHaveBeenCalledWith(1, 9, 15, 0, false, true, 2);
    });
});
