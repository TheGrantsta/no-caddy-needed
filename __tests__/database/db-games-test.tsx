import { getGamesByCategory, insertGame, softDeleteGame, restoreGame } from '../../database/db';
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

describe('getGamesByCategory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queriesGamesTableFilteredByCategoryAndNotDeleted', () => {
        mockGetAllSync.mockReturnValue([]);

        getGamesByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('Games');
        expect(sql).toContain('Category');
        expect(sql).toContain('IsDeleted');
    });

    it('passesCategoryAsAParameter', () => {
        mockGetAllSync.mockReturnValue([]);

        getGamesByCategory('chipping');

        const [, params] = mockGetAllSync.mock.calls[0];
        expect(params).toContain('chipping');
    });

    it('ordersResultsByHeaderASC', () => {
        mockGetAllSync.mockReturnValue([]);

        getGamesByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('Header ASC');
    });

    it('returnsMatchingRows', () => {
        const rows = [
            { Id: 1, Category: 'putting', Header: 'Around the world!', IsDeleted: 0 },
            { Id: 2, Category: 'putting', Header: 'Par 18!', IsDeleted: 0 },
        ];
        mockGetAllSync.mockReturnValue(rows);

        const result = getGamesByCategory('putting');

        expect(result).toHaveLength(2);
        expect((result[0] as any).Header).toBe('Around the world!');
    });
});

describe('insertGame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('insertsIntoGamesTable', async () => {
        await insertGame('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('INSERT INTO Games');
    });

    it('includesAllColumnsInSQL', async () => {
        await insertGame('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('Category');
        expect(sql).toContain('Header');
        expect(sql).toContain('Objective');
        expect(sql).toContain('SetUp');
        expect(sql).toContain('HowToPlay');
    });

    it('bindsAllValuesInExecuteAsync', async () => {
        await insertGame('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(expect.objectContaining({
            $Category: 'putting',
            $Header: 'My Game',
            $Objective: 'Obj',
            $SetUp: 'Setup',
            $HowToPlay: 'HowToPlay',
        }));
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await insertGame('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await insertGame('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(false);
    });
});

describe('softDeleteGame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updatesIsDeletedOnGamesTable', async () => {
        await softDeleteGame(3);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('UPDATE Games');
        expect(sql).toContain('IsDeleted');
    });

    it('bindsIdInExecuteAsync', async () => {
        await softDeleteGame(3);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $Id: 3 })
        );
    });

    it('setsIsDeletedTo1', async () => {
        await softDeleteGame(5);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $IsDeleted: 1 })
        );
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await softDeleteGame(1);

        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await softDeleteGame(1);

        expect(result).toBe(false);
    });
});

describe('restoreGame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updatesIsDeletedToZeroOnGamesTable', async () => {
        await restoreGame(3);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('UPDATE Games');
        expect(sql).toContain('IsDeleted');
    });

    it('bindsIdInExecuteAsync', async () => {
        await restoreGame(3);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $Id: 3 })
        );
    });

    it('setsIsDeletedTo0', async () => {
        await restoreGame(5);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $IsDeleted: 0 })
        );
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await restoreGame(1);

        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await restoreGame(1);

        expect(result).toBe(false);
    });
});
