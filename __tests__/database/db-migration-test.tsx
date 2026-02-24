import { initialize, amendTable } from '../../database/db';
import * as SQLite from 'expo-sqlite';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
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

    it('should not alter Settings table when all columns already exist', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
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
