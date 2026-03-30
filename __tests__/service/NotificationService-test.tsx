import {
    scheduleRoundReminder,
    cancelRoundReminder,
    cancelAllRoundReminders,
    schedulePracticeReminder,
    cancelPracticeReminder,
} from '../../service/NotificationService';
import * as Notifications from 'expo-notifications';

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
