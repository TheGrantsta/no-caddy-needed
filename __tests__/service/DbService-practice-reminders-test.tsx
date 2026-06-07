import { getPracticeRemindersService, addPracticeReminderService, deletePracticeReminderService, updatePracticeReminderNotificationIdService } from '../../service/DbService';
import { getAllPracticeReminders, insertPracticeReminder, deletePracticeReminder, updatePracticeReminderNotificationId } from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllPracticeReminders: jest.fn(),
    insertPracticeReminder: jest.fn(),
    deletePracticeReminder: jest.fn(),
    updatePracticeReminderNotificationId: jest.fn(),
}));

const mockGetAllPracticeReminders = getAllPracticeReminders as jest.Mock;
const mockInsertPracticeReminder = insertPracticeReminder as jest.Mock;
const mockDeletePracticeReminder = deletePracticeReminder as jest.Mock;
const mockUpdatePracticeReminderNotificationId = updatePracticeReminderNotificationId as jest.Mock;

describe('getPracticeRemindersService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldReturnPracticeReminders', () => {
        const rows = [
            { Id: 1, Label: 'Morning putting', ScheduledFor: '2026-03-15T08:00:00.000Z', NotificationId: 'n1', Created_At: '2026-03-12T09:00:00.000Z' },
        ];
        mockGetAllPracticeReminders.mockReturnValue(rows);

        const result = getPracticeRemindersService();

        expect(mockGetAllPracticeReminders).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0].Label).toBe('Morning putting');
    });

    it('returns empty array when no reminders', () => {
        mockGetAllPracticeReminders.mockReturnValue([]);
        const result = getPracticeRemindersService();
        expect(result).toHaveLength(0);
    });
});

describe('addPracticeReminderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldAddPracticeReminder', async () => {
        mockInsertPracticeReminder.mockResolvedValue(true);

        await addPracticeReminderService('Evening chipping', '2026-03-15T18:00:00.000Z', 'notif-id-1');

        expect(mockInsertPracticeReminder).toHaveBeenCalledWith('Evening chipping', '2026-03-15T18:00:00.000Z', 'notif-id-1');
    });

    it('passes null notificationId', async () => {
        mockInsertPracticeReminder.mockResolvedValue(true);

        await addPracticeReminderService('Test', '2026-03-15T08:00:00.000Z', null);

        expect(mockInsertPracticeReminder).toHaveBeenCalledWith('Test', '2026-03-15T08:00:00.000Z', null);
    });
});

describe('updatePracticeReminderNotificationIdService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updatesNotificationIdForReminder', async () => {
        mockUpdatePracticeReminderNotificationId.mockResolvedValue(undefined);

        await updatePracticeReminderNotificationIdService(3, 'daily-notif-id-99');

        expect(mockUpdatePracticeReminderNotificationId).toHaveBeenCalledWith(3, 'daily-notif-id-99');
    });

    it('passesNullNotificationId', async () => {
        mockUpdatePracticeReminderNotificationId.mockResolvedValue(undefined);

        await updatePracticeReminderNotificationIdService(7, null);

        expect(mockUpdatePracticeReminderNotificationId).toHaveBeenCalledWith(7, null);
    });
});

describe('deletePracticeReminderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldDeletePracticeReminder', async () => {
        mockDeletePracticeReminder.mockResolvedValue(true);

        await deletePracticeReminderService(5);

        expect(mockDeletePracticeReminder).toHaveBeenCalledWith(5);
    });
});
