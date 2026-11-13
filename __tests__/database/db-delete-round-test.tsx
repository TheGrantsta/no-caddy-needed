import { deleteRound, initialize } from '../../database/db';
import { logError } from '../../service/ErrorLoggingService';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();
const mockStatementExecuteAsync = jest.fn();
const mockStatementFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareAsync = jest.fn();
const mockWithTransactionAsync = jest.fn(async (task: () => Promise<void>) => task());

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        prepareAsync: mockPrepareAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
        withTransactionAsync: mockWithTransactionAsync,
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

describe('deleteRound', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('shouldRemoveTheRoundsChildRowsThenTheRound', async () => {
        await deleteRound(99);

        const sqls = mockPrepareAsync.mock.calls.map(call => call[0]);
        expect(sqls).toEqual([
            'DELETE FROM HoleDeadlySins WHERE RoundId = $RoundId;',
            'DELETE FROM RoundHoleScores WHERE RoundId = $RoundId;',
            'DELETE FROM RoundPlayers WHERE RoundId = $RoundId;',
            'DELETE FROM Rounds WHERE Id = $RoundId;',
        ]);
    });

    it('shouldPassTheRoundIdAsAParameterInsteadOfPastingItIntoTheSql', async () => {
        await deleteRound(99);

        mockPrepareAsync.mock.calls.forEach(call => expect(call[0]).not.toContain('99'));
        mockStatementExecuteAsync.mock.calls.forEach(call => expect(call[0]).toEqual({ $RoundId: 99 }));
    });

    it('shouldRunAllTheDeletesInOneTransaction', async () => {
        await deleteRound(99);

        expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    });

    it('shouldNotTouchCourseNotes', async () => {
        await deleteRound(99);

        mockPrepareAsync.mock.calls.forEach(call => expect(call[0]).not.toContain('HoleNotes'));
    });

    it('shouldReturnTrueWhenEveryDeleteSucceeds', async () => {
        expect(await deleteRound(99)).toBe(true);
    });

    it('shouldReturnFalseAndLogWhenAnyDeleteFails', async () => {
        mockStatementExecuteAsync.mockRejectedValueOnce(new Error('db error'));

        expect(await deleteRound(99)).toBe(false);
        expect(logError).toHaveBeenCalledWith('db.deleteRound', expect.any(Error));
    });
});
