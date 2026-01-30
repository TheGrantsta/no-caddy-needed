import {
    getClubDistancesService,
    saveClubDistancesService,
} from '../../service/DbService';
import {
    getClubDistances,
    insertClubDistances,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    getClubDistances: jest.fn(),
    insertClubDistances: jest.fn(),
}));

const mockGetClubDistances = getClubDistances as jest.Mock;
const mockInsertClubDistances = insertClubDistances as jest.Mock;

describe('getClubDistancesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when no club distances exist', () => {
        mockGetClubDistances.mockReturnValue([]);

        const result = getClubDistancesService();

        expect(result).toEqual([]);
    });

    it('returns club distances sorted by sort order', () => {
        mockGetClubDistances.mockReturnValue([
            { Id: 1, Club: 'Driver', CarryDistance: 250, SortOrder: 1 },
            { Id: 2, Club: '3 Wood', CarryDistance: 230, SortOrder: 2 },
            { Id: 3, Club: '5 Iron', CarryDistance: 180, SortOrder: 3 },
        ]);

        const result = getClubDistancesService();

        expect(result).toHaveLength(3);
        expect(result[0].Club).toBe('Driver');
        expect(result[0].CarryDistance).toBe(250);
        expect(result[2].Club).toBe('5 Iron');
    });

    it('preserves all fields from database', () => {
        mockGetClubDistances.mockReturnValue([
            { Id: 1, Club: 'PW', CarryDistance: 130, SortOrder: 10 },
        ]);

        const result = getClubDistancesService();

        expect(result[0]).toEqual({
            Id: 1,
            Club: 'PW',
            CarryDistance: 130,
            SortOrder: 10,
        });
    });
});

describe('saveClubDistancesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves club distances to database', async () => {
        mockInsertClubDistances.mockResolvedValue(true);

        const distances = [
            { Club: 'Driver', CarryDistance: 250, SortOrder: 1 },
            { Club: '3 Wood', CarryDistance: 230, SortOrder: 2 },
        ];

        const result = await saveClubDistancesService(distances);

        expect(mockInsertClubDistances).toHaveBeenCalledWith(distances);
        expect(result).toBe(true);
    });

    it('returns false when save fails', async () => {
        mockInsertClubDistances.mockResolvedValue(false);

        const result = await saveClubDistancesService([]);

        expect(result).toBe(false);
    });
});
