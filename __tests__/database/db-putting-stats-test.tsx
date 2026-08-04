import { getAllPuttingStatsWithThreePutts, initialize } from '../../database/db';

const mockGetAllSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: jest.fn(),
        prepareSync: jest.fn(),
    })),
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn().mockResolvedValue(undefined),
        prepareAsync: jest.fn(),
        getAllSync: mockGetAllSync,
        execSync: jest.fn(),
    })),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    await initialize();
});

describe('PuttingStats database', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAllSync.mockClear();
    });

    describe('getAllPuttingStatsWithThreePutts', () => {
        it('includes RoundId in SELECT so callers can filter by round', () => {
            mockGetAllSync.mockReturnValue([
                { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThreePutts: 0 },
                { RoundId: 2, FirstPuttDistance: 3, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            ]);

            const result = getAllPuttingStatsWithThreePutts();

            expect(mockGetAllSync).toHaveBeenCalled();
            const sqlArg = mockGetAllSync.mock.calls[0][0];
            // Verify the SQL includes RoundId in the SELECT clause
            expect(sqlArg.toUpperCase()).toMatch(/SELECT.*PS\.ROUNDID/);
            // And that the result includes RoundId
            expect(result[0]).toHaveProperty('RoundId');
        });
    });
});
