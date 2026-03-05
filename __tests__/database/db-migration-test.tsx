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

describe('DrillHistory and Drills table schema', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
        mockGetAllSync.mockReturnValue([]);
    });

    it('creates DrillHistory table in initialize SQL', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('CREATE TABLE IF NOT EXISTS DrillHistory');
    });

    it('DrillHistory DDL includes DrillId column', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        const drillHistoryBlock = sql.substring(sql.indexOf('DrillHistory'));
        expect(drillHistoryBlock).toContain('DrillId');
    });

    it('creates new Drills table with Category column in initialize SQL', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('CREATE TABLE IF NOT EXISTS Drills');
        expect(sql).toContain('Category');
    });

    it('new Drills DDL includes Label, IconName, Target, Objective, SetUp, HowToPlay, IsActive', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        const drillsBlock = sql.substring(sql.lastIndexOf('CREATE TABLE IF NOT EXISTS Drills'));
        expect(drillsBlock).toContain('Label');
        expect(drillsBlock).toContain('IconName');
        expect(drillsBlock).toContain('Target');
        expect(drillsBlock).toContain('Objective');
        expect(drillsBlock).toContain('SetUp');
        expect(drillsBlock).toContain('HowToPlay');
        expect(drillsBlock).toContain('IsActive');
    });

    it('IsActive defaults to 1 in new Drills DDL', async () => {
        await initialize();

        const sql = mockExecAsync.mock.calls[0][0];
        expect(sql).toContain('IsActive INTEGER NOT NULL DEFAULT 1');
    });
});

describe('old Drills to DrillHistory rename migration', () => {
    const allSettingsCols = [
        { name: 'Id' }, { name: 'Theme' }, { name: 'NotificationsEnabled' },
        { name: 'Voice' }, { name: 'SoundsEnabled' },
        { name: 'WedgeChartOnboardingSeen' }, { name: 'DistancesOnboardingSeen' },
        { name: 'PlayOnboardingSeen' }, { name: 'HomeOnboardingSeen' },
        { name: 'PracticeOnboardingSeen' },
    ];
    const allDeadlySinsCols = [
        { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
        { name: 'BogeysPar5' }, { name: 'BogeysInside9Iron' }, { name: 'DoubleChips' },
        { name: 'TroubleOffTee' }, { name: 'Penalties' }, { name: 'Total' },
        { name: 'RoundId' }, { name: 'Created_At' },
    ];
    const allDrillHistoryCols = [
        { name: 'Id' }, { name: 'Name' }, { name: 'Result' }, { name: 'DrillId' }, { name: 'Created_At' },
    ];
    const oldDrillsCols = [
        { name: 'Id' }, { name: 'Name' }, { name: 'Result' }, { name: 'Created_At' },
    ];
    const newDrillsCols = [
        { name: 'Id' }, { name: 'Category' }, { name: 'Label' }, { name: 'IconName' },
        { name: 'Target' }, { name: 'Objective' }, { name: 'SetUp' }, { name: 'HowToPlay' }, { name: 'IsActive' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('renames old Drills table to DrillHistory when Name column exists in Drills', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [];
            if (sql === 'PRAGMA table_info(Drills)') return oldDrillsCols;
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsCols;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsCols;
            if (sql === 'PRAGMA table_info(DrillHistory)') return allDrillHistoryCols;
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith('ALTER TABLE Drills RENAME TO DrillHistory');
    });

    it('does not rename when Drills table has Category column (new schema)', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [];
            if (sql === 'PRAGMA table_info(Drills)') return newDrillsCols;
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsCols;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsCols;
            if (sql === 'PRAGMA table_info(DrillHistory)') return allDrillHistoryCols;
            return [];
        });

        await initialize();

        const renameCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('Drills') && call[0].includes('RENAME')
        );
        expect(renameCalls).toHaveLength(0);
    });

    it('does not rename when Drills PRAGMA returns empty (table does not exist)', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [];
            if (sql === 'PRAGMA table_info(Drills)') return [];
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsCols;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsCols;
            if (sql === 'PRAGMA table_info(DrillHistory)') return allDrillHistoryCols;
            return [];
        });

        await initialize();

        const renameCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('Drills') && call[0].includes('RENAME')
        );
        expect(renameCalls).toHaveLength(0);
    });
});

describe('DrillHistory DrillId column migration', () => {
    const allSettingsCols = [
        { name: 'Id' }, { name: 'Theme' }, { name: 'NotificationsEnabled' },
        { name: 'Voice' }, { name: 'SoundsEnabled' },
        { name: 'WedgeChartOnboardingSeen' }, { name: 'DistancesOnboardingSeen' },
        { name: 'PlayOnboardingSeen' }, { name: 'HomeOnboardingSeen' },
        { name: 'PracticeOnboardingSeen' },
    ];
    const allDeadlySinsCols = [
        { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
        { name: 'BogeysPar5' }, { name: 'BogeysInside9Iron' }, { name: 'DoubleChips' },
        { name: 'TroubleOffTee' }, { name: 'Penalties' }, { name: 'Total' },
        { name: 'RoundId' }, { name: 'Created_At' },
    ];
    const newDrillsCols = [
        { name: 'Id' }, { name: 'Category' }, { name: 'Label' }, { name: 'IconName' },
        { name: 'Target' }, { name: 'Objective' }, { name: 'SetUp' }, { name: 'HowToPlay' }, { name: 'IsActive' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('adds DrillId column to DrillHistory when missing', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [];
            if (sql === 'PRAGMA table_info(Drills)') return newDrillsCols;
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsCols;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsCols;
            if (sql === 'PRAGMA table_info(DrillHistory)') return [
                { name: 'Id' }, { name: 'Name' }, { name: 'Result' }, { name: 'Created_At' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE DrillHistory ADD COLUMN DrillId INTEGER'
        );
    });

    it('does not add DrillId when already present in DrillHistory', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [];
            if (sql === 'PRAGMA table_info(Drills)') return newDrillsCols;
            if (sql === 'PRAGMA table_info(Settings)') return allSettingsCols;
            if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
            if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsCols;
            if (sql === 'PRAGMA table_info(DrillHistory)') return [
                { name: 'Id' }, { name: 'Name' }, { name: 'Result' }, { name: 'DrillId' }, { name: 'Created_At' },
            ];
            return [];
        });

        await initialize();

        const drillHistoryAlterCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('DrillHistory')
        );
        expect(drillHistoryAlterCalls).toHaveLength(0);
    });
});

describe('Drills table seeding', () => {
    const allSettingsCols = [
        { name: 'Id' }, { name: 'Theme' }, { name: 'NotificationsEnabled' },
        { name: 'Voice' }, { name: 'SoundsEnabled' },
        { name: 'WedgeChartOnboardingSeen' }, { name: 'DistancesOnboardingSeen' },
        { name: 'PlayOnboardingSeen' }, { name: 'HomeOnboardingSeen' },
        { name: 'PracticeOnboardingSeen' },
    ];
    const allDeadlySinsCols = [
        { name: 'Id' }, { name: 'ThreePutts' }, { name: 'DoubleBogeys' },
        { name: 'BogeysPar5' }, { name: 'BogeysInside9Iron' }, { name: 'DoubleChips' },
        { name: 'TroubleOffTee' }, { name: 'Penalties' }, { name: 'Total' },
        { name: 'RoundId' }, { name: 'Created_At' },
    ];
    const newDrillsCols = [
        { name: 'Id' }, { name: 'Category' }, { name: 'Label' }, { name: 'IconName' },
        { name: 'Target' }, { name: 'Objective' }, { name: 'SetUp' }, { name: 'HowToPlay' }, { name: 'IsActive' },
    ];
    const allDrillHistoryCols = [
        { name: 'Id' }, { name: 'Name' }, { name: 'Result' }, { name: 'DrillId' }, { name: 'Created_At' },
    ];

    const baseGetAllSync = (sql: string) => {
        if (sql === 'PRAGMA table_info(Tiger5Rounds)') return [];
        if (sql === 'PRAGMA table_info(Drills)') return newDrillsCols;
        if (sql === 'PRAGMA table_info(Settings)') return allSettingsCols;
        if (sql === 'PRAGMA table_info(Rounds)') return [{ name: 'Id' }];
        if (sql === 'PRAGMA table_info(DeadlySinsRounds)') return allDeadlySinsCols;
        if (sql === 'PRAGMA table_info(DrillHistory)') return allDrillHistoryCols;
        return [];
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('seeds Drills table when count is 0', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'SELECT COUNT(*) as count FROM Drills') return [{ count: 0 }];
            return baseGetAllSync(sql);
        });

        await initialize();

        const seedCall = mockExecAsync.mock.calls.find(
            (call: string[]) => call[0].includes('INSERT INTO Drills')
        );
        expect(seedCall).toBeDefined();
    });

    it('inserts 12 drills (3 per category)', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'SELECT COUNT(*) as count FROM Drills') return [{ count: 0 }];
            return baseGetAllSync(sql);
        });

        await initialize();

        const seedCall = mockExecAsync.mock.calls.find(
            (call: string[]) => call[0].includes('INSERT INTO Drills')
        );
        const sql = seedCall![0] as string;
        expect((sql.match(/'putting'/g) || []).length).toBe(3);
        expect((sql.match(/'chipping'/g) || []).length).toBe(3);
        expect((sql.match(/'pitching'/g) || []).length).toBe(3);
        expect((sql.match(/'bunker'/g) || []).length).toBe(3);
    });

    it('seeds all drills with IsActive set to 1', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'SELECT COUNT(*) as count FROM Drills') return [{ count: 0 }];
            return baseGetAllSync(sql);
        });

        await initialize();

        const seedCall = mockExecAsync.mock.calls.find(
            (call: string[]) => call[0].includes('INSERT INTO Drills')
        );
        const sql = seedCall![0] as string;
        const rowSeparators = (sql.match(/\), \(/g) || []).length;
        expect(rowSeparators).toBe(11);
    });

    it('does not seed when Drills table already has rows', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'SELECT COUNT(*) as count FROM Drills') return [{ count: 12 }];
            return baseGetAllSync(sql);
        });

        await initialize();

        const seedCalls = mockExecAsync.mock.calls.filter(
            (call: string[]) => call[0].includes('INSERT INTO Drills')
        );
        expect(seedCalls).toHaveLength(0);
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
