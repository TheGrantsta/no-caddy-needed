import {
    getWedgeChartService,
    saveWedgeChartService,
    WedgeChartData,
} from '../../service/DbService';
import {
    getWedgeChartDistanceNames,
    getWedgeChartEntries,
    insertWedgeChart,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    getWedgeChartDistanceNames: jest.fn(),
    getWedgeChartEntries: jest.fn(),
    insertWedgeChart: jest.fn(),
}));

const mockGetDistanceNames = getWedgeChartDistanceNames as jest.Mock;
const mockGetEntries = getWedgeChartEntries as jest.Mock;
const mockInsertWedgeChart = insertWedgeChart as jest.Mock;

describe('getWedgeChartService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty data when no wedge chart exists', () => {
        mockGetDistanceNames.mockReturnValue([]);
        mockGetEntries.mockReturnValue([]);

        const result = getWedgeChartService();

        expect(result.distanceNames).toEqual([]);
        expect(result.clubs).toEqual([]);
    });

    it('returns distance names and clubs from database', () => {
        mockGetDistanceNames.mockReturnValue([
            { Id: 1, Name: '1/2', SortOrder: 1 },
            { Id: 2, Name: '3/4', SortOrder: 2 },
            { Id: 3, Name: 'Full', SortOrder: 3 },
        ]);
        mockGetEntries.mockReturnValue([
            { Id: 1, Club: 'PW', DistanceName: '1/2', Distance: 90, ClubSortOrder: 1, DistanceSortOrder: 1 },
            { Id: 2, Club: 'PW', DistanceName: '3/4', Distance: 110, ClubSortOrder: 1, DistanceSortOrder: 2 },
            { Id: 3, Club: 'PW', DistanceName: 'Full', Distance: 130, ClubSortOrder: 1, DistanceSortOrder: 3 },
            { Id: 4, Club: 'SW', DistanceName: '1/2', Distance: 50, ClubSortOrder: 2, DistanceSortOrder: 1 },
            { Id: 5, Club: 'SW', DistanceName: '3/4', Distance: 70, ClubSortOrder: 2, DistanceSortOrder: 2 },
            { Id: 6, Club: 'SW', DistanceName: 'Full', Distance: 90, ClubSortOrder: 2, DistanceSortOrder: 3 },
        ]);

        const result = getWedgeChartService();

        expect(result.distanceNames).toEqual(['1/2', '3/4', 'Full']);
        expect(result.clubs).toHaveLength(2);
        expect(result.clubs[0].club).toBe('PW');
        expect(result.clubs[0].distances).toEqual([
            { name: '1/2', distance: 90 },
            { name: '3/4', distance: 110 },
            { name: 'Full', distance: 130 },
        ]);
        expect(result.clubs[1].club).toBe('SW');
    });

    it('sorts clubs by ClubSortOrder', () => {
        mockGetDistanceNames.mockReturnValue([
            { Id: 1, Name: 'Full', SortOrder: 1 },
        ]);
        mockGetEntries.mockReturnValue([
            { Id: 1, Club: 'LW', DistanceName: 'Full', Distance: 80, ClubSortOrder: 2, DistanceSortOrder: 1 },
            { Id: 2, Club: 'GW', DistanceName: 'Full', Distance: 100, ClubSortOrder: 1, DistanceSortOrder: 1 },
        ]);

        const result = getWedgeChartService();

        expect(result.clubs[0].club).toBe('GW');
        expect(result.clubs[1].club).toBe('LW');
    });
});

describe('saveWedgeChartService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves wedge chart data to database', async () => {
        mockInsertWedgeChart.mockResolvedValue(true);

        const data: WedgeChartData = {
            distanceNames: ['1/2', 'Full'],
            clubs: [
                { club: 'PW', distances: [{ name: '1/2', distance: 90 }, { name: 'Full', distance: 130 }] },
            ],
        };

        const result = await saveWedgeChartService(data);

        expect(result).toBe(true);
        expect(mockInsertWedgeChart).toHaveBeenCalledWith(
            [{ Name: '1/2', SortOrder: 1 }, { Name: 'Full', SortOrder: 2 }],
            [
                { Club: 'PW', DistanceName: '1/2', Distance: 90, ClubSortOrder: 1, DistanceSortOrder: 1 },
                { Club: 'PW', DistanceName: 'Full', Distance: 130, ClubSortOrder: 1, DistanceSortOrder: 2 },
            ],
        );
    });

    it('returns false when save fails', async () => {
        mockInsertWedgeChart.mockResolvedValue(false);

        const result = await saveWedgeChartService({ distanceNames: [], clubs: [] });

        expect(result).toBe(false);
    });
});
