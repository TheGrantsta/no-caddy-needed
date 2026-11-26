import { getAllPuttingStatsWithThreePutts, initialize, insertPuttingStats } from '../../database/db';

const mockGetAllSync = jest.fn();
const mockExecuteAsync = jest.fn().mockResolvedValue(undefined);
const mockFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareAsync = jest.fn().mockResolvedValue({
    executeAsync: mockExecuteAsync,
    finalizeAsync: mockFinalizeAsync,
});

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: jest.fn(),
        prepareSync: jest.fn(),
    })),
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn().mockResolvedValue(undefined),
        prepareAsync: mockPrepareAsync,
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
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockExecuteAsync,
            finalizeAsync: mockFinalizeAsync,
        });
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

        it('filters to the given rounds in SQL and binds their ids', () => {
            mockGetAllSync.mockReturnValue([]);

            getAllPuttingStatsWithThreePutts([1, 2]);

            const [sql, params] = mockGetAllSync.mock.calls[0];
            expect(sql).toMatch(/WHERE ps\.RoundId IN \(\?, \?\)/);
            expect(params).toEqual([1, 2]);
        });

        it('reads no rows at all when given an empty list of rounds', () => {
            mockGetAllSync.mockClear();

            expect(getAllPuttingStatsWithThreePutts([])).toEqual([]);
            expect(mockGetAllSync).not.toHaveBeenCalled();
        });

        it('includes the stored PuttCount in SELECT so putt counts follow the count, not the sin', () => {
            mockGetAllSync.mockReturnValue([]);

            getAllPuttingStatsWithThreePutts();

            const sqlArg = mockGetAllSync.mock.calls[0][0];
            expect(sqlArg.toUpperCase()).toMatch(/PS\.PUTTCOUNT/);
        });

        it('includes GreenInRegulation in SELECT so up-and-down can be calculated', () => {
            mockGetAllSync.mockReturnValue([]);

            getAllPuttingStatsWithThreePutts();

            const sqlArg = mockGetAllSync.mock.calls[0][0];
            expect(sqlArg.toUpperCase()).toMatch(/PS\.GREENINREGULATION/);
        });
    });

    describe('insertPuttingStats', () => {
        it('shouldPersistGreenInRegulationAsOneWhenTrue', async () => {
            await insertPuttingStats(1, 3, 20, 0, false, true);

            const bindings = mockExecuteAsync.mock.calls[0][0];
            expect(bindings.$GreenInRegulation).toBe(1);
        });

        it('shouldPersistGreenInRegulationAsZeroWhenFalse', async () => {
            await insertPuttingStats(1, 3, 20, 0, false, false);

            const bindings = mockExecuteAsync.mock.calls[0][0];
            expect(bindings.$GreenInRegulation).toBe(0);
        });

        it('shouldDefaultGreenInRegulationToZeroWhenOmitted', async () => {
            await insertPuttingStats(1, 3, 20, 0, false);

            const bindings = mockExecuteAsync.mock.calls[0][0];
            expect(bindings.$GreenInRegulation).toBe(0);
        });

        it('shouldPersistTheChosenPuttCount', async () => {
            await insertPuttingStats(1, 3, 20, 3, false, false, 3);

            const bindings = mockExecuteAsync.mock.calls[0][0];
            expect(bindings.$PuttCount).toBe(3);
        });

        it('shouldLeaveThePuttCountNullWhenOmitted', async () => {
            await insertPuttingStats(1, 3, 20, 0, false);

            const bindings = mockExecuteAsync.mock.calls[0][0];
            expect(bindings.$PuttCount).toBeNull();
        });

        it('shouldIncludePuttCountColumnInInsertStatement', async () => {
            await insertPuttingStats(1, 3, 20, 0, false, undefined, undefined, false, 1);

            const sql = mockPrepareAsync.mock.calls[0][0];
            expect(sql).toMatch(/INSERT INTO PuttingStats \(.*PuttCount.*\)/);
        });

        it('shouldIncludeGreenInRegulationColumnInInsertStatement', async () => {
            await insertPuttingStats(1, 3, 20, 0, false, undefined, undefined, true);

            const sql = mockPrepareAsync.mock.calls[0][0];
            expect(sql).toMatch(/INSERT INTO PuttingStats \(.*GreenInRegulation.*\)/);
        });
    });
});
