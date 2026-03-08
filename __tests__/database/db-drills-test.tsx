import { insertDrillResult, getAllDrillHistory, getDrillsByCategory, insertDrill, softDeleteDrill, restoreDrill } from '../../database/db';
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
    })),
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
}));

describe('insertDrillResult', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('inserts into DrillHistory table', async () => {
        await insertDrillResult('Putting - Gate', true, null);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('INSERT INTO DrillHistory');
    });

    it('includes DrillId column and binding in INSERT SQL', async () => {
        await insertDrillResult('Putting - Gate', true, null);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('DrillId');
        expect(sql).toContain('$DrillId');
    });

    it('binds drillId value in executeAsync', async () => {
        await insertDrillResult('Putting - Gate', true, 7);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $DrillId: 7 })
        );
    });

    it('binds null $DrillId when drillId is null', async () => {
        await insertDrillResult('Putting - Gate', true, null);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $DrillId: null })
        );
    });

    it('still binds $Name and $Result', async () => {
        await insertDrillResult('Chipping - Hoop', false, 3);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $Name: 'Chipping - Hoop', $Result: false })
        );
    });

    it('returns true on success', async () => {
        const result = await insertDrillResult('Putting - Gate', true, null);

        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await insertDrillResult('Putting - Gate', true, null);

        expect(result).toBe(false);
    });
});

describe('getAllDrillHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries DrillHistory table', () => {
        mockGetAllSync.mockReturnValue([]);

        getAllDrillHistory();

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('DrillHistory');
    });

    it('orders results by Id DESC', () => {
        mockGetAllSync.mockReturnValue([]);

        getAllDrillHistory();

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('ORDER BY Id DESC');
    });

    it('returns all rows from DrillHistory', () => {
        const rows = [
            { Id: 2, Name: 'Putting - Gate', Result: 1, Created_At: '2026-01-02' },
            { Id: 1, Name: 'Chipping - Hoop', Result: 0, Created_At: '2026-01-01' },
        ];
        mockGetAllSync.mockReturnValue(rows);

        const result = getAllDrillHistory();

        expect(result).toHaveLength(2);
        expect(result[0].Id).toBe(2);
    });
});

describe('getDrillsByCategory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries Drills table filtered by category', () => {
        mockGetAllSync.mockReturnValue([]);

        getDrillsByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('Drills');
        expect(sql).toContain('Category');
    });

    it('passes category as a parameter', () => {
        mockGetAllSync.mockReturnValue([]);

        getDrillsByCategory('chipping');

        const [, params] = mockGetAllSync.mock.calls[0];
        expect(params).toContain('chipping');
    });

    it('filters out deleted rows using IsDeleted = 0', () => {
        mockGetAllSync.mockReturnValue([]);

        getDrillsByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('IsDeleted = 0');
    });

    it('orders results by Label ASC', () => {
        mockGetAllSync.mockReturnValue([]);

        getDrillsByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('Label ASC');
    });

    it('returns matching rows', () => {
        const rows = [
            { Id: 1, Category: 'putting', Label: 'Gate', IsDeleted: 0 },
            { Id: 2, Category: 'putting', Label: 'Ladder', IsDeleted: 0 },
        ];
        mockGetAllSync.mockReturnValue(rows);

        const result = getDrillsByCategory('putting');

        expect(result).toHaveLength(2);
        expect(result[0].Label).toBe('Gate');
    });
});

describe('insertDrill', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('inserts into Drills table', async () => {
        await insertDrill('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('INSERT INTO Drills');
    });

    it('includes all columns in SQL', async () => {
        await insertDrill('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('Category');
        expect(sql).toContain('Label');
        expect(sql).toContain('IconName');
        expect(sql).toContain('Target');
        expect(sql).toContain('Objective');
        expect(sql).toContain('SetUp');
        expect(sql).toContain('HowToPlay');
    });

    it('binds all values in executeAsync', async () => {
        await insertDrill('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(expect.objectContaining({
            $Category: 'putting',
            $Label: 'Gate',
            $IconName: 'golf-course',
            $Target: '8/10',
            $Objective: 'Obj',
            $SetUp: 'Setup',
            $HowToPlay: 'HowToPlay',
        }));
    });

    it('returns true on success', async () => {
        const result = await insertDrill('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await insertDrill('putting', 'Gate', 'golf-course', '8/10', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(false);
    });
});

describe('softDeleteDrill', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updates IsDeleted on the Drills table', async () => {
        await softDeleteDrill(3);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('UPDATE Drills');
        expect(sql).toContain('IsDeleted');
    });

    it('binds $IsDeleted as 1 and $Id in executeAsync', async () => {
        await softDeleteDrill(3);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $IsDeleted: 1, $Id: 3 })
        );
    });

    it('returns true on success', async () => {
        const result = await softDeleteDrill(1);

        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await softDeleteDrill(1);

        expect(result).toBe(false);
    });
});

describe('restoreDrill', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updates IsDeleted on the Drills table', async () => {
        await restoreDrill(5);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('UPDATE Drills');
        expect(sql).toContain('IsDeleted');
    });

    it('binds $IsDeleted as 0 and $Id in executeAsync', async () => {
        await restoreDrill(5);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $IsDeleted: 0, $Id: 5 })
        );
    });

    it('returns true on success', async () => {
        const result = await restoreDrill(1);

        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await restoreDrill(1);

        expect(result).toBe(false);
    });
});
