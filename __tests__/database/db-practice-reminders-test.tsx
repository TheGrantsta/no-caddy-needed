import { insertPracticeReminder, getAllPracticeReminders, deletePracticeReminder } from '../../database/db';
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

describe('insertPracticeReminder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('shouldInsertPracticeReminder', async () => {
        await insertPracticeReminder('Morning putting', '2026-03-15T08:00:00.000Z', 'notif-id-1');

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('INSERT INTO PracticeReminders');
        expect(sql).toContain('Label');
        expect(sql).toContain('ScheduledFor');
        expect(sql).toContain('NotificationId');
    });

    it('binds all values in executeAsync', async () => {
        await insertPracticeReminder('Morning putting', '2026-03-15T08:00:00.000Z', 'notif-id-1');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(expect.objectContaining({
            $Label: 'Morning putting',
            $ScheduledFor: '2026-03-15T08:00:00.000Z',
            $NotificationId: 'notif-id-1',
        }));
    });

    it('binds null NotificationId when null passed', async () => {
        await insertPracticeReminder('Evening chipping', '2026-03-15T18:00:00.000Z', null);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(expect.objectContaining({
            $NotificationId: null,
        }));
    });

    it('returns true on success', async () => {
        const result = await insertPracticeReminder('Test', '2026-03-15T08:00:00.000Z', null);
        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));
        const result = await insertPracticeReminder('Test', '2026-03-15T08:00:00.000Z', null);
        expect(result).toBe(false);
    });
});

describe('getAllPracticeReminders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldGetAllPracticeReminders', () => {
        mockGetAllSync.mockReturnValue([]);
        getAllPracticeReminders();
        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('PracticeReminders');
    });

    it('orders results by Id DESC', () => {
        mockGetAllSync.mockReturnValue([]);
        getAllPracticeReminders();
        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('ORDER BY Id DESC');
    });

    it('returns all rows', () => {
        const rows = [
            { Id: 2, Label: 'Evening', ScheduledFor: '2026-03-15T18:00:00.000Z', NotificationId: 'n2', Created_At: '2026-03-12T10:00:00.000Z' },
            { Id: 1, Label: 'Morning', ScheduledFor: '2026-03-15T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' },
        ];
        mockGetAllSync.mockReturnValue(rows);
        const result = getAllPracticeReminders();
        expect(result).toHaveLength(2);
        expect(result[0].Id).toBe(2);
    });
});

describe('deletePracticeReminder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('shouldDeletePracticeReminderById', async () => {
        await deletePracticeReminder(3);
        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('DELETE FROM PracticeReminders');
        expect(sql).toContain('$Id');
    });

    it('binds correct id in executeAsync', async () => {
        await deletePracticeReminder(3);
        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(expect.objectContaining({ $Id: 3 }));
    });

    it('returns true on success', async () => {
        const result = await deletePracticeReminder(1);
        expect(result).toBe(true);
    });

    it('returns false on error', async () => {
        mockStatementExecuteAsync.mockRejectedValue(new Error('DB error'));
        const result = await deletePracticeReminder(1);
        expect(result).toBe(false);
    });
});
