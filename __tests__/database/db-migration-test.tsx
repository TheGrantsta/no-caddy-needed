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

    it('should not alter Settings table when all columns already exist', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
                { name: 'WedgeChartOnboardingSeen' },
                { name: 'DistancesOnboardingSeen' },
                { name: 'PlayOnboardingSeen' },
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

describe('Rounds table column migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('should add CoursePar column when missing from Rounds table', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
                { name: 'WedgeChartOnboardingSeen' },
                { name: 'DistancesOnboardingSeen' },
                { name: 'PlayOnboardingSeen' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'TotalScore' },
                { name: 'StartTime' },
            ];
            return [];
        });

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Rounds ADD COLUMN CoursePar INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should not add CoursePar when it already exists', async () => {
        mockGetAllSync.mockImplementation((sql: string) => {
            if (sql === 'PRAGMA table_info(Settings)') return [
                { name: 'Id' },
                { name: 'Theme' },
                { name: 'NotificationsEnabled' },
                { name: 'WedgeChartOnboardingSeen' },
                { name: 'DistancesOnboardingSeen' },
                { name: 'PlayOnboardingSeen' },
            ];
            if (sql === 'PRAGMA table_info(Rounds)') return [
                { name: 'Id' },
                { name: 'CoursePar' },
                { name: 'TotalScore' },
            ];
            return [];
        });

        await initialize();

        const roundsAlterCalls = mockExecSync.mock.calls.filter(
            (call: string[]) => call[0].includes('Rounds')
        );
        expect(roundsAlterCalls).toHaveLength(0);
    });
});
