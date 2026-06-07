import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { upgradeOverdueRemindersService } from './NotificationService';

export const OVERDUE_REMINDER_TASK = 'OVERDUE_REMINDER_UPGRADE';

TaskManager.defineTask(OVERDUE_REMINDER_TASK, async () => {
    try {
        await upgradeOverdueRemindersService();
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerOverdueReminderTask = async (): Promise<void> => {
    try {
        const status = await BackgroundFetch.getStatusAsync();
        if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
            await BackgroundFetch.registerTaskAsync(OVERDUE_REMINDER_TASK, {
                minimumInterval: 60 * 60,
                stopOnTerminate: false,
                startOnBoot: true,
            });
        }
    } catch {
        // Background fetch not available in this environment (e.g. Expo Go)
    }
};
