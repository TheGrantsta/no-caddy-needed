import { getRoundFilterPreference, saveRoundFilterPreference, initialize } from '../../database/db';

const mockExecAsync = jest.fn();
const mockExecSync = jest.fn();
const mockGetAllSync = jest.fn();
const mockPrepareSync = jest.fn();
const mockPrepareAsync = jest.fn();
const mockStatementExecuteAsync = jest.fn();
const mockStatementFinalizeAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        prepareAsync: mockPrepareAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
        prepareSync: mockPrepareSync,
    })),
}));

jest.mock('../../service/ErrorLoggingService', () => ({
    logError: jest.fn(),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    mockExecAsync.mockResolvedValue(undefined);
    await initialize();
});

describe('round filter preference table', () => {
    it('shouldCreateTheUiPreferencesTableOnInitialise', async () => {
        mockExecAsync.mockClear();
        mockExecSync.mockClear();

        await initialize();

        const sqlRan = [...mockExecAsync.mock.calls, ...mockExecSync.mock.calls]
            .map(call => String(call[0]))
            .join('\n');
        expect(sqlRan).toContain('CREATE TABLE IF NOT EXISTS UiPreferences');
    });
});

describe('getRoundFilterPreference', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldReturnTheStoredFilterValue', () => {
        mockGetAllSync.mockReturnValue([{ RoundFilter: '2025' }]);

        expect(getRoundFilterPreference()).toBe('2025');
    });

    it('shouldReturnNullWhenNothingHasBeenSaved', () => {
        mockGetAllSync.mockReturnValue([]);

        expect(getRoundFilterPreference()).toBeNull();
    });
});

describe('saveRoundFilterPreference', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('shouldUpsertTheSingleRowWithTheGivenValue', async () => {
        const saved = await saveRoundFilterPreference('10');

        expect(saved).toBe(true);
        expect(mockPrepareAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE INTO UiPreferences'));
        expect(mockStatementExecuteAsync).toHaveBeenCalledWith({ $RoundFilter: '10' });
    });

    it('shouldReturnFalseAndLogWhenTheWriteFails', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('disk full'));

        const saved = await saveRoundFilterPreference('all');

        expect(saved).toBe(false);
    });
});
