let Notifications: typeof import('expo-notifications') | null = null;

try {
    Notifications = require('expo-notifications');
} catch {
    // Native module not available (e.g., Expo Go without dev build)
}

export const scheduleRoundReminder = async (): Promise<string | null> => {
    if (!Notifications) return null;
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
    if (!Notifications || !notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
        console.log(e);
    }
};
