import { updateRoundStartTime, initialize } from '../../database/db';

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

describe('updateRoundStartTime', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updatesTheStartTimeOfTheRoundWithTheGivenId', async () => {
        await updateRoundStartTime(7, '2026-11-11T10:00:00.000Z');

        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql).toMatch(/UPDATE Rounds SET StartTime = \$StartTime WHERE Id = \$Id/);
        expect(mockStatementExecuteAsync).toHaveBeenCalledWith({ $StartTime: '2026-11-11T10:00:00.000Z', $Id: 7 });
    });

    it('returnsTrueOnSuccess', async () => {
        expect(await updateRoundStartTime(7, '2026-11-11T10:00:00.000Z')).toBe(true);
    });

    it('returnsFalseWhenTheUpdateFails', async () => {
        mockStatementExecuteAsync.mockRejectedValueOnce(new Error('disk full'));

        expect(await updateRoundStartTime(7, '2026-11-11T10:00:00.000Z')).toBe(false);
    });
});
