import { insertRound, initialize } from '../../database/db';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();
const mockStatementExecuteAsync = jest.fn();
const mockStatementFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        prepareAsync: mockPrepareAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
    openDatabaseSync: jest.fn(() => ({ getAllSync: mockGetAllSync, execSync: mockExecSync })),
}));

jest.mock('../../service/ErrorLoggingService', () => ({
    logError: jest.fn(),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    mockExecAsync.mockResolvedValue(undefined);
    await initialize();
});

describe('insertRound starting hole', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue({ lastInsertRowId: 7 });
    });

    it('shouldSaveTheStartingHoleOfTheRound', async () => {
        await insertRound('Pebble Beach', false, 10);

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$StartHole).toBe(10);
    });

    it('shouldStartOnHoleOneWhenNoStartingHoleIsGiven', async () => {
        await insertRound('Pebble Beach', false);

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$StartHole).toBe(1);
    });

    it('shouldWriteTheStartHoleColumn', async () => {
        await insertRound('Pebble Beach', false, 10);

        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql).toMatch(/StartHole/);
    });
});
