import { getGamesByCategory, insertGame, updateGameIsActive } from '../../database/db';
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

    it('queriesGamestableFilteredByCategory', () => {
        mockGetAllSync.mockReturnValue([]);

        getGamesByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('Games');
        expect(sql).toContain('Category');
    });

    it('passesCategoryAsAParameter', () => {
        mockGetAllSync.mockReturnValue([]);

        getGamesByCategory('chipping');

        const [, params] = mockGetAllSync.mock.calls[0];
        expect(params).toContain('chipping');
    });

    it('ordersResultsByIsActiveDESCThenHeaderASC', () => {
        mockGetAllSync.mockReturnValue([]);

        getGamesByCategory('putting');

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('IsActive DESC');
        expect(sql).toContain('Header ASC');
    });

    it('returnsMatchingRows', () => {
        const rows = [
            { Id: 1, Category: 'putting', Header: 'Around the world!', IsActive: 1 },
            { Id: 2, Category: 'putting', Header: 'Par 18!', IsActive: 0 },
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
        expect(sql).toContain('IsActive');
    });

    it('bindsAllValuesInExecuteAsync', async () => {
        await insertGame('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(expect.objectContaining({
            $Category: 'putting',
            $Header: 'My Game',
            $Objective: 'Obj',
            $SetUp: 'Setup',
            $HowToPlay: 'HowToPlay',
            $IsActive: 1,
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

describe('updateGameIsActive', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('updatesIsActiveOnGamesTable', async () => {
        await updateGameIsActive(3, false);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('UPDATE Games');
        expect(sql).toContain('IsActive');
    });

    it('bindsIdAndIsActiveInExecuteAsync', async () => {
        await updateGameIsActive(3, false);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $Id: 3, $IsActive: 0 })
        );
    });

    it('bindsIsActiveAs1WhenSettingActive', async () => {
        await updateGameIsActive(5, true);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $IsActive: 1 })
        );
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await updateGameIsActive(1, true);

        expect(result).toBe(true);
    });

    it('returnsFalseOnError', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));

        const result = await updateGameIsActive(1, true);

        expect(result).toBe(false);
    });
});
