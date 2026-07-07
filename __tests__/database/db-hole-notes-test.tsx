import { getAllHoleNotesForCourse, upsertHoleNote, deleteHoleNote, initialize } from '../../database/db';
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

describe('getAllHoleNotesForCourse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queriesHoleNotesTableForCourseName', () => {
        mockGetAllSync.mockReturnValue([]);
        getAllHoleNotesForCourse('St Andrews');
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('HoleNotes');
    });

    it('passescourseNameAsParameter', () => {
        mockGetAllSync.mockReturnValue([]);
        getAllHoleNotesForCourse('Augusta');
        const [, params] = mockGetAllSync.mock.calls[0];
        expect(params).toEqual(['Augusta']);
    });

    it('returnsEmptyArrayWhenNoNotes', () => {
        mockGetAllSync.mockReturnValue([]);
        const result = getAllHoleNotesForCourse('Unknown');
        expect(result).toEqual([]);
    });

    it('returnsNoteRowsForCourse', () => {
        const mockRows = [
            { HoleNumber: 3, Note: 'aim left of bunker' },
            { HoleNumber: 7, Note: 'back pin plays longer' },
        ];
        mockGetAllSync.mockReturnValue(mockRows);
        const result = getAllHoleNotesForCourse('St Andrews');
        expect(result).toEqual(mockRows);
    });

    it('matchesCourseNameCaseInsensitivelyAndTrimsWhitespace', () => {
        mockGetAllSync.mockReturnValue([]);
        getAllHoleNotesForCourse('st andrews');
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('LOWER(TRIM(CourseName))');
        expect(sql).toContain('LOWER(TRIM(?))');
    });
});

describe('upsertHoleNote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue({ changes: 0 });
    });

    it('triesToUpdateExistingNoteCaseInsensitively', async () => {
        mockStatementExecuteAsync.mockResolvedValue({ changes: 1 });
        await upsertHoleNote('st andrews', 7, 'aim left');
        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql).toContain('UPDATE');
        expect(sql).toContain('LOWER(TRIM(CourseName))');
    });

    it('fallsBackToInsertWhenUpdateMatches zero rows', async () => {
        mockStatementExecuteAsync.mockResolvedValue({ changes: 0 });
        await upsertHoleNote('St Andrews', 7, 'aim left');
        expect(mockPrepareAsync).toHaveBeenCalledTimes(2);
        const [secondSql] = mockPrepareAsync.mock.calls[1];
        expect(secondSql.toUpperCase()).toContain('INSERT');
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await upsertHoleNote('St Andrews', 7, 'aim left');
        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        const result = await upsertHoleNote('St Andrews', 7, 'aim left');
        expect(result).toBe(false);
    });

    it('finalizesStatementsOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        await upsertHoleNote('St Andrews', 7, 'aim left');
        expect(mockStatementFinalizeAsync.mock.calls.length).toBeGreaterThan(0);
    });
});

describe('deleteHoleNote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('deletesFromHoleNotesTable', async () => {
        await deleteHoleNote('St Andrews', 7);
        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql.toUpperCase()).toContain('DELETE');
        expect(sql).toContain('HoleNotes');
    });

    it('executesWithCourseNameAndHoleNumber', async () => {
        await deleteHoleNote('St Andrews', 7);
        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params).toMatchObject({ $CourseName: 'St Andrews', $HoleNumber: 7 });
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await deleteHoleNote('St Andrews', 7);
        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        const result = await deleteHoleNote('St Andrews', 7);
        expect(result).toBe(false);
    });

    it('finalizesStatementOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        await deleteHoleNote('St Andrews', 7);
        expect(mockStatementFinalizeAsync).toHaveBeenCalledTimes(1);
    });

    it('matchesCourseNameCaseInsensitivelyAndTrimsWhitespace', async () => {
        await deleteHoleNote('st andrews', 7);
        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql).toContain('LOWER(TRIM(CourseName))');
    });
});
