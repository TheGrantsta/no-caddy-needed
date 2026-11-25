import { initialize, insertDrillResult } from '../../database/db';

const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();
const mockExecuteAsync = jest.fn().mockResolvedValue(undefined);
const mockFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareAsync = jest.fn().mockResolvedValue({
    executeAsync: mockExecuteAsync,
    finalizeAsync: mockFinalizeAsync,
});

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
        prepareSync: jest.fn(),
    })),
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn().mockResolvedValue(undefined),
        prepareAsync: mockPrepareAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    await initialize();
});

describe('insertDrillResult', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockExecuteAsync,
            finalizeAsync: mockFinalizeAsync,
        });
    });

    it('shouldStoreTheScoreInTheScoreColumn', async () => {
        await insertDrillResult('Lag Putting', true, 7);

        const bindings = mockExecuteAsync.mock.calls[0][0];
        expect(bindings.$Score).toBe(7);
    });

    it('shouldNotWriteADrillIdColumn', async () => {
        await insertDrillResult('Lag Putting', true, 7);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).not.toMatch(/DrillId/i);
    });
});
