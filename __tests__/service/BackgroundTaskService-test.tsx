import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { upgradeOverdueRemindersService } from '../../service/NotificationService';

import { registerOverdueReminderTask, OVERDUE_REMINDER_TASK } from '../../service/BackgroundTaskService';

jest.mock('expo-task-manager', () => ({
    defineTask: jest.fn(),
}));

jest.mock('expo-background-task', () => ({
    registerTaskAsync: jest.fn(),
    getStatusAsync: jest.fn(),
    BackgroundTaskStatus: { Restricted: 1, Available: 2 },
    BackgroundTaskResult: { Success: 1, Failed: 2 },
}));

jest.mock('../../service/NotificationService', () => ({
    upgradeOverdueRemindersService: jest.fn(),
}));

const mockDefineTask = TaskManager.defineTask as jest.Mock;
const mockRegister = BackgroundTask.registerTaskAsync as jest.Mock;
const mockGetStatus = BackgroundTask.getStatusAsync as jest.Mock;
const mockUpgrade = upgradeOverdueRemindersService as jest.Mock;

// defineTask runs once at module import — capture before beforeEach clears mocks
const [definedTaskName, taskExecutor] = mockDefineTask.mock.calls[0] as [string, () => Promise<number>];

describe('BackgroundTaskService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('definesTaskWithCorrectNameOnImport', () => {
        expect(definedTaskName).toBe(OVERDUE_REMINDER_TASK);
        expect(typeof taskExecutor).toBe('function');
    });

    describe('task executor', () => {
        it('runsUpgradeAndReturnsSuccess', async () => {
            mockUpgrade.mockResolvedValue(undefined);

            const result = await taskExecutor();

            expect(mockUpgrade).toHaveBeenCalled();
            expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
        });

        it('returnsFailedWhenUpgradeThrows', async () => {
            mockUpgrade.mockRejectedValue(new Error('boom'));

            const result = await taskExecutor();

            expect(result).toBe(BackgroundTask.BackgroundTaskResult.Failed);
        });
    });

    describe('registerOverdueReminderTask', () => {
        it('registersTaskWhenStatusAvailable', async () => {
            mockGetStatus.mockResolvedValue(BackgroundTask.BackgroundTaskStatus.Available);

            await registerOverdueReminderTask();

            expect(mockRegister).toHaveBeenCalledWith(OVERDUE_REMINDER_TASK, { minimumInterval: 60 });
        });

        it('doesNotRegisterWhenStatusRestricted', async () => {
            mockGetStatus.mockResolvedValue(BackgroundTask.BackgroundTaskStatus.Restricted);

            await registerOverdueReminderTask();

            expect(mockRegister).not.toHaveBeenCalled();
        });

        it('swallowsErrorsWhenStatusCheckThrows', async () => {
            mockGetStatus.mockRejectedValue(new Error('not available'));

            await expect(registerOverdueReminderTask()).resolves.toBeUndefined();
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });
});
