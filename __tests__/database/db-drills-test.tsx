import { insertDrillResult, getAllDrillHistory, getDrillsByCategory, updateDrillIsActive } from '../../database/db';
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

    it('orders results by IsActive DESC then Label ASC', () => {
        mockGetAllSync.mockReturnValue([]);

        getDrillsByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('IsActive DESC');
        expect(sql).toContain('Label ASC');
    });

    it('returns matching rows', () => {
        const rows = [
            { Id: 1, Category: 'putting', Label: 'Gate', IsActive: 1 },
            { Id: 2, Category: 'putting', Label: 'Ladder', IsActive: 0 },
        ];
        mockGetAllSync.mockReturnValue(rows);

        const result = getDrillsByCategory('putting');

        expect(result).toHaveLength(2);
        expect(result[0].Label).toBe('Gate');
    });
});

describe('updateDrillIsActive', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updates IsActive on the Drills table', async () => {
        await updateDrillIsActive(3, false);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('UPDATE Drills');
        expect(sql).toContain('IsActive');
    });

    it('binds $Id and $IsActive in executeAsync', async () => {
        await updateDrillIsActive(3, false);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $Id: 3, $IsActive: 0 })
        );
    });

    it('binds $IsActive as 1 when setting active', async () => {
        await updateDrillIsActive(5, true);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $IsActive: 1 })
        );
    });

    it('returns true on success', async () => {
        const result = await updateDrillIsActive(1, true);

        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await updateDrillIsActive(1, true);

        expect(result).toBe(false);
    });
});
