import { addHiddenRecent, getDistinctCourseNames, getDistinctPlayerNames, initialize } from '../../database/db';
import * as SQLite from 'expo-sqlite';

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

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    mockExecAsync.mockResolvedValue(undefined);
    await initialize();
});

describe('addHiddenRecent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('insertsIntoHiddenRecentsTableWithInsertOrIgnore', async () => {
        await addHiddenRecent('course', 'St Andrews');
        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql).toContain('HiddenRecents');
        expect(sql.toUpperCase()).toContain('INSERT OR IGNORE');
    });

    it('executesWithTypeAndName', async () => {
        await addHiddenRecent('course', 'St Andrews');
        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params).toMatchObject({ $Type: 'course', $Name: 'St Andrews' });
    });

    it('executesWithPlayerType', async () => {
        await addHiddenRecent('player', 'Alice');
        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params).toMatchObject({ $Type: 'player', $Name: 'Alice' });
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await addHiddenRecent('course', 'St Andrews');
        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        const result = await addHiddenRecent('course', 'St Andrews');
        expect(result).toBe(false);
    });

    it('finalizesStatementOnSuccess', async () => {
        await addHiddenRecent('course', 'St Andrews');
        expect(mockStatementFinalizeAsync).toHaveBeenCalledTimes(1);
    });

    it('finalizesStatementOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        await addHiddenRecent('course', 'St Andrews');
        expect(mockStatementFinalizeAsync).toHaveBeenCalledTimes(1);
    });
});

describe('getDistinctCourseNames', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('excludesHiddenCoursesFromResults', () => {
        mockGetAllSync.mockReturnValue([]);
        getDistinctCourseNames();
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('HiddenRecents');
    });
});

describe('getDistinctPlayerNames', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('excludesHiddenPlayersFromResults', () => {
        mockGetAllSync.mockReturnValue([]);
        getDistinctPlayerNames();
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('HiddenRecents');
    });
});
