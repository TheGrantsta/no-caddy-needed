import { initialize, amendTable, insertDeadlySinsRound, getDeadlySinsRoundByRoundId, deleteRound } from '../../database/db';
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

describe('amendTable', () => {
    let mockSyncDb: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSyncDb = (SQLite.openDatabaseSync as jest.Mock)('TestDb');
    });

    it('should add column when missing from table', () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'Name' },
        ]);

        amendTable(mockSyncDb, {
            table: 'TestTable',
            columnsToAdd: ['Age INTEGER NOT NULL DEFAULT 0'],
            columnsToRemove: [],
        });

        expect(mockGetAllSync).toHaveBeenCalledWith('PRAGMA table_info(TestTable)');
        expect(mockExecSync).toHaveBeenCalledWith('ALTER TABLE TestTable ADD COLUMN Age INTEGER NOT NULL DEFAULT 0');
    });

    it('should not add column when it already exists', () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'Age' },
        ]);

        amendTable(mockSyncDb, {
            table: 'TestTable',
            columnsToAdd: ['Age INTEGER NOT NULL DEFAULT 0'],
            columnsToRemove: [],
        });

        expect(mockExecSync).not.toHaveBeenCalled();
    });

    it('should drop column when it exists in table', () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'OldColumn' },
        ]);

        amendTable(mockSyncDb, {
            table: 'TestTable',
            columnsToAdd: [],
            columnsToRemove: ['OldColumn'],
        });

        expect(mockExecSync).toHaveBeenCalledWith('ALTER TABLE TestTable DROP COLUMN OldColumn');
    });

    it('should not drop column when it does not exist', () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
        ]);

        amendTable(mockSyncDb, {
            table: 'TestTable',
            columnsToAdd: [],
            columnsToRemove: ['OldColumn'],
        });

        expect(mockExecSync).not.toHaveBeenCalled();
    });

    it('should handle both add and remove in a single amendment', () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'OldColumn' },
        ]);

        amendTable(mockSyncDb, {
            table: 'TestTable',
            columnsToAdd: ['NewColumn TEXT NOT NULL DEFAULT ""'],
            columnsToRemove: ['OldColumn'],
        });

        expect(mockExecSync).toHaveBeenCalledWith('ALTER TABLE TestTable ADD COLUMN NewColumn TEXT NOT NULL DEFAULT ""');
        expect(mockExecSync).toHaveBeenCalledWith('ALTER TABLE TestTable DROP COLUMN OldColumn');
    });

    it('should handle empty columnsToAdd and columnsToRemove', () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
        ]);

        amendTable(mockSyncDb, {
            table: 'TestTable',
            columnsToAdd: [],
            columnsToRemove: [],
        });

        expect(mockExecSync).not.toHaveBeenCalled();
    });
});

describe('DeadlySinsRounds table schema', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
        mockGetAllSync.mockReturnValue([]);
    });

    it('creates DeadlySinsRounds table in initialize SQL', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('DeadlySinsRounds');
    });

    it('includes TroubleOffTee column in DeadlySinsRounds DDL', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('TroubleOffTee');
    });

    it('includes Penalties column in DeadlySinsRounds DDL', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('Penalties');
    });
});

describe('DeadlySinsRounds migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    const allSettingsColumns = [
        { name: 'Id' }, { name: 'Theme' }, { name: 'NotificationsEnabled' },
        { name: 'WedgeChartOnboardingSeen' }, { name: 'DistancesOnboardingSeen' },
        { name: 'PlayOnboardingSeen' }, { name: 'HomeOnboardingSeen' },
        { name: 'PracticeOnboardingSeen' },
    ];

    const allDeadlySinsColumns = [
        { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
        { name: 'BogeysPar5' }, { name: 'BogeysInside9Iron' }, { name: 'DoubleChips' },
        { name: 'TroubleOffTee' }, { name: 'Penalties' }, { name: 'Total' },
        { name: 'RoundId' }, { name: 'Created_At' },
    ];

    it('adds TroubleOffTee column when missing from DeadlySinsRounds', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsColumns;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return [
                { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE DeadlySinsRounds ADD COLUMN TroubleOffTee INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('adds Penalties column when missing from DeadlySinsRounds', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsColumns;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return [
                { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE DeadlySinsRounds ADD COLUMN Penalties INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('adds RoundId column when missing from DeadlySinsRounds', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsColumns;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return [
                { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
                { name: 'BogeysPar5' }, { name: 'BogeysInside9Iron' }, { name: 'DoubleChips' },
                { name: 'TroubleOffTee' }, { name: 'Penalties' }, { name: 'Total' }, { name: 'Created_At' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE DeadlySinsRounds ADD COLUMN RoundId INTEGER'
        );
    });

    it('does not alter DeadlySinsRounds when TroubleOffTee and Penalties already exist', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsColumns;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsColumns;
            return [];
        });

        await initialize();

        const deadlySinsAlterCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('DeadlySinsRounds')
        );
        expect(deadlySinsAlterCalls).toHaveLength(0);
    });
});

describe('Settings table column migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('should add WedgeChartOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN WedgeChartOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add DistancesOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN DistancesOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add PlayOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN PlayOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add HomeOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN HomeOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add PracticeOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN PracticeOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add SoundsEnabled column when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
                { name: 'Voice' },
                { name: 'WedgeChartOnboardingSeen' },
                { name: 'DistancesOnboardingSeen' },
                { name: 'PlayOnboardingSeen' },
                { name: 'HomeOnboardingSeen' },
                { name: 'PracticeOnboardingSeen' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN SoundsEnabled INTEGER NOT NULL DEFAULT 1'
        );
    });

    it('should not alter Settings table when all columns already exist', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
                { name: 'Voice' },
                { name: 'SoundsEnabled' },
                { name: 'WedgeChartOnboardingSeen' },
                { name: 'DistancesOnboardingSeen' },
                { name: 'PlayOnboardingSeen' },
                { name: 'HomeOnboardingSeen' },
                { name: 'PracticeOnboardingSeen' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
            ];
            return [];
        });

        await initialize();

        const settingsAlterCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('Settings')
        );
        expect(settingsAlterCalls).toHaveLength(0);
    });
});

describe('insertDeadlySinsRound with RoundId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('includes RoundId column and $RoundId binding in INSERT SQL', async () => {
        await insertDeadlySinsRound(1, 1, 2, 3, 4, 5, 6, 7, 28);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('RoundId');
        expect(sql).toContain('$RoundId');
    });

    it('binds $RoundId value in executeAsync', async () => {
        await insertDeadlySinsRound(1, 1, 2, 3, 4, 5, 6, 7, 28);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $RoundId: 1 })
        );
    });

    it('binds null $RoundId when roundId is null', async () => {
        await insertDeadlySinsRound(null, 1, 2, 3, 4, 5, 6, 7, 28);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $RoundId: null })
        );
    });
});

describe('getDeadlySinsRoundByRoundId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls getAllSync with SELECT on DeadlySinsRounds WHERE RoundId = ?', () => {
        mockGetAllSync.mockReturnValue([]);

        getDeadlySinsRoundByRoundId(5);

        const [sql, params] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('DeadlySinsRounds');
        expect(sql).toContain('RoundId');
        expect(params).toEqual([5]);
    });

    it('returns first row when found', () => {
        const row = { Id: 1, RoundId: 5, Total: 7 };
        mockGetAllSync.mockReturnValue([row]);

        const result = getDeadlySinsRoundByRoundId(5);

        expect(result).toEqual(row);
    });

    it('returns null when no row found', () => {
        mockGetAllSync.mockReturnValue([]);

        const result = getDeadlySinsRoundByRoundId(5);

        expect(result).toBeNull();
    });
});

describe('deleteRound cascade to DeadlySinsRounds', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('deletes DeadlySinsRounds for the round before deleting the round', async () => {
        await deleteRound(99);

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('DELETE FROM DeadlySinsRounds WHERE RoundId = 99');
    });
});

describe('Tiger5Rounds to DeadlySinsRounds rename migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('renames Tiger5Rounds to DeadlySinsRounds when Tiger5Rounds exists', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [
                { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
                { name: 'BogeysPar5' }, { name: 'BogeysInside9Iron' }, { name: 'DoubleChips' },
                { name: 'Total' }, { name: 'Created_At' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith('ALTER TABLE Tiger5Rounds RENAME TO DeadlySinsRounds');
    });

    it('does not rename when Tiger5Rounds does not exist', async () => {
        mockGetAllSync.mockReturnValue([]);

        await initialize();

        const renameCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('RENAME')
        );
        expect(renameCalls).toHaveLength(0);
    });
});
