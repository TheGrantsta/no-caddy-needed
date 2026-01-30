import {
    scheduleRoundReminder,
    cancelRoundReminder,
} from '../../service/NotificationService';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    setNotificationHandler: jest.fn(),
}));

const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;

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
            mockSchedule.mockRejectedValue(new Error('failed'));

            const result = await scheduleRoundReminder();

            expect(result).toBeNull();
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
});
