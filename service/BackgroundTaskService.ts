import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { upgradeOverdueRemindersService } from './NotificationService';

export const OVERDUE_REMINDER_TASK = 'OVERDUE_REMINDER_UPGRADE';

TaskManager.defineTask(OVERDUE_REMINDER_TASK, async () => {
    try {
        await upgradeOverdueRemindersService();
        return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

export const registerOverdueReminderTask = async (): Promise<void> => {
    try {
        const status = await BackgroundTask.getStatusAsync();
        if (status === BackgroundTask.BackgroundTaskStatus.Available) {
            await BackgroundTask.registerTaskAsync(OVERDUE_REMINDER_TASK, {
                minimumInterval: 60,
            });
        }
    } catch {
        // Background tasks not available in this environment (e.g. Expo Go)
    }
};
