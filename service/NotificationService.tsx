import * as Notifications from 'expo-notifications';

export const scheduleRoundReminder = async (): Promise<string | null> => {
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Round still in progress',
                body: 'You started a round over 6 hours ago. Did you forget to end it?',
            },
            trigger: {
                type: 'timeInterval',
                seconds: 6 * 60 * 60,
            },
        });
        return id;
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const cancelRoundReminder = async (notificationId: string | null): Promise<void> => {
    if (!notificationId) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
};
