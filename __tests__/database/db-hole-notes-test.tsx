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
});

describe('upsertHoleNote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('insertsIntoHoleNotesWithInsertOrReplace', async () => {
        await upsertHoleNote('St Andrews', 7, 'aim left');
        const [sql] = mockPrepareAsync.mock.calls[0];
        expect(sql).toContain('HoleNotes');
        expect(sql.toUpperCase()).toContain('INSERT OR REPLACE');
    });

    it('executesWithCourseNameHoleNumberAndNote', async () => {
        await upsertHoleNote('St Andrews', 7, 'aim left');
        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params).toMatchObject({ $CourseName: 'St Andrews', $HoleNumber: 7, $Note: 'aim left' });
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

    it('finalizesStatementOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('db error'));
        await upsertHoleNote('St Andrews', 7, 'aim left');
        expect(mockStatementFinalizeAsync).toHaveBeenCalledTimes(1);
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
});
