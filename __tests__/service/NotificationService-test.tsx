import {
    scheduleRoundReminder,
    cancelRoundReminder,
    cancelAllRoundReminders,
    schedulePracticeReminder,
    cancelPracticeReminder,
    scheduleDailyOverdueReminder,
    upgradeOverdueRemindersService,
} from '../../service/NotificationService';
import { getPracticeRemindersService, updatePracticeReminderNotificationIdService } from '../../service/DbService';
import * as Notifications from 'expo-notifications';

jest.mock('../../service/DbService', () => ({
    getPracticeRemindersService: jest.fn(),
    updatePracticeReminderNotificationIdService: jest.fn().mockResolvedValue(undefined),
}));

const mockGetPracticeReminders = getPracticeRemindersService as jest.Mock;
const mockUpdateNotificationId = updatePracticeReminderNotificationIdService as jest.Mock;

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn(),
    setNotificationHandler: jest.fn(),
}));

const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const mockGetAllScheduled = Notifications.getAllScheduledNotificationsAsync as jest.Mock;

describe('NotificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('scheduleRoundReminder', () => {
        it('schedules a notification for 6 hours', async () => {
            mockSchedule.mockResolvedValue('notification-id-123');

            const result = await scheduleRoundReminder();

            expect(mockSchedule).toHaveBeenCalledWith({
                content: {
                    title: 'Round still in progress',
                    body: 'You started a round over 6 hours ago. Did you forget to end it?',
                },
                trigger: {
                    type: 'timeInterval',
                    seconds: 6 * 60 * 60,
                },
            });
            expect(result).toBe('notification-id-123');
        });

        it('returns null when scheduling fails', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockSchedule.mockRejectedValue(new Error('failed'));

            const result = await scheduleRoundReminder();

            expect(result).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    describe('cancelRoundReminder', () => {
        it('cancels a scheduled notification by ID', async () => {
            mockCancel.mockResolvedValue(undefined);

            await cancelRoundReminder('notification-id-123');

            expect(mockCancel).toHaveBeenCalledWith('notification-id-123');
        });

        it('handles cancellation of null ID gracefully', async () => {
            await cancelRoundReminder(null);

            expect(mockCancel).not.toHaveBeenCalled();
        });
    });

    describe('schedulePracticeReminder', () => {
        it('shouldSchedulePracticeReminderAtSpecificDate', async () => {
            mockSchedule.mockResolvedValue('practice-notif-id-1');
            const date = new Date('2026-03-15T08:00:00.000Z');

            const result = await schedulePracticeReminder('Morning putting', date);

            expect(mockSchedule).toHaveBeenCalledWith({
                content: {
                    title: 'Practice reminder',
                    body: 'Morning putting',
                },
                trigger: {
                    type: 'date',
                    date,
                },
            });
            expect(result).toBe('practice-notif-id-1');
        });

        it('returns null when scheduling fails', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockSchedule.mockRejectedValue(new Error('failed'));

            const result = await schedulePracticeReminder('Test', new Date());

            expect(result).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    describe('cancelAllRoundReminders', () => {
        it('shouldCancelScheduledNotificationWithRoundStillInProgressTitle', async () => {
            mockGetAllScheduled.mockResolvedValue([
                { identifier: 'round-notif-1', content: { title: 'Round still in progress' } },
            ]);

            await cancelAllRoundReminders();

            expect(mockCancel).toHaveBeenCalledWith('round-notif-1');
        });

        it('shouldNotCancelNotificationWithDifferentTitle', async () => {
            mockGetAllScheduled.mockResolvedValue([
                { identifier: 'practice-notif-1', content: { title: 'Practice reminder' } },
            ]);

            await cancelAllRoundReminders();

            expect(mockCancel).not.toHaveBeenCalled();
        });
    });

    describe('scheduleDailyOverdueReminder', () => {
        it('schedulesRepeatingCalendarNotificationAt7am', async () => {
            mockSchedule.mockResolvedValue('daily-notif-id-1');

            const result = await scheduleDailyOverdueReminder('Putting practice — reduce 3-putts');

            expect(mockSchedule).toHaveBeenCalledWith({
                content: {
                    title: 'Practice reminder',
                    body: 'Putting practice — reduce 3-putts',
                },
                trigger: {
                    type: 'calendar',
                    repeats: true,
                    hour: 7,
                    minute: 0,
                },
            });
            expect(result).toBe('daily-notif-id-1');
        });

        it('returnsNullWhenSchedulingFails', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockSchedule.mockRejectedValue(new Error('failed'));

            const result = await scheduleDailyOverdueReminder('Test reminder');

            expect(result).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    describe('upgradeOverdueRemindersService', () => {
        const overdueReminder = {
            Id: 1, Label: 'Putting practice', NotificationId: 'old-id',
            ScheduledFor: new Date(Date.now() - 1000).toISOString(), Created_At: '',
        };
        const futureReminder = {
            Id: 2, Label: 'Chipping practice', NotificationId: 'future-id',
            ScheduledFor: new Date(Date.now() + 86400000).toISOString(), Created_At: '',
        };

        beforeEach(() => {
            mockGetPracticeReminders.mockReturnValue([]);
            mockUpdateNotificationId.mockResolvedValue(undefined);
        });

        it('schedulesDailyReminderForEachOverdueReminder', async () => {
            mockGetPracticeReminders.mockReturnValue([overdueReminder]);
            mockSchedule.mockResolvedValue('daily-id');

            await upgradeOverdueRemindersService();

            expect(mockSchedule).toHaveBeenCalledWith(expect.objectContaining({
                trigger: expect.objectContaining({ type: 'calendar', repeats: true, hour: 7 }),
            }));
        });

        it('cancelsOldNotificationBeforeSchedulingNewOne', async () => {
            mockGetPracticeReminders.mockReturnValue([overdueReminder]);
            mockSchedule.mockResolvedValue('daily-id');

            await upgradeOverdueRemindersService();

            expect(mockCancel).toHaveBeenCalledWith('old-id');
        });

        it('updatesNotificationIdInDb', async () => {
            mockGetPracticeReminders.mockReturnValue([overdueReminder]);
            mockSchedule.mockResolvedValue('daily-id');

            await upgradeOverdueRemindersService();

            expect(mockUpdateNotificationId).toHaveBeenCalledWith(1, 'daily-id');
        });

        it('doesNotTouchFutureReminders', async () => {
            mockGetPracticeReminders.mockReturnValue([futureReminder]);

            await upgradeOverdueRemindersService();

            expect(mockSchedule).not.toHaveBeenCalled();
            expect(mockCancel).not.toHaveBeenCalled();
            expect(mockUpdateNotificationId).not.toHaveBeenCalled();
        });
    });

    describe('cancelPracticeReminder', () => {
        it('shouldCancelPracticeReminder', async () => {
            mockCancel.mockResolvedValue(undefined);

            await cancelPracticeReminder('practice-notif-id-1');

            expect(mockCancel).toHaveBeenCalledWith('practice-notif-id-1');
        });

        it('handles cancellation of null ID gracefully', async () => {
            await cancelPracticeReminder(null);

            expect(mockCancel).not.toHaveBeenCalled();
        });
    });
});
