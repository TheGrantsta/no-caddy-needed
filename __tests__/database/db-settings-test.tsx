import { saveSettings, getSettings, initialize } from '../../database/db';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();
const mockStatementExecuteAsync = jest.fn();
const mockStatementFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareAsync = jest.fn();
const mockPrepareSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        prepareAsync: mockPrepareAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
        prepareSync: mockPrepareSync,
    })),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    mockExecAsync.mockResolvedValue(undefined);
    await initialize();
});

// saveSettings signature:
// notificationsEnabled, voice, soundsEnabled, wedgeChartOnboardingSeen, distancesOnboardingSeen,
// playOnboardingSeen, homeOnboardingSeen, practiceOnboardingSeen, practiceFrequencyDays,
// reviewPromptShown, preShotReminderEnabled, preShotRoutineText, whatsNewVersionSeen,
// settingsOnboardingSeen, performOnboardingSeen, tempoBpm
const callSaveWithRoutine = (routine: string) =>
    saveSettings(1, 'female', 1, 0, 0, 0, 0, 0, 7, 0, 1, routine, '', 0, 0, 60);

describe('saveSettings pre-shot routine guard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareSync.mockReturnValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('persistsProvidedRoutineWhenNonEmpty', async () => {
        mockGetAllSync.mockReturnValue([{ PreShotRoutineText: 'old custom routine' }]);

        await callSaveWithRoutine('new custom routine');

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$PreShotRoutineText).toBe('new custom routine');
    });

    it('keepsExistingCustomRoutineWhenProvidedRoutineIsEmpty', async () => {
        mockGetAllSync.mockReturnValue([{ PreShotRoutineText: 'my custom routine' }]);

        await callSaveWithRoutine('');

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$PreShotRoutineText).toBe('my custom routine');
    });

    it('keepsExistingCustomRoutineWhenProvidedRoutineIsWhitespace', async () => {
        mockGetAllSync.mockReturnValue([{ PreShotRoutineText: 'my custom routine' }]);

        await callSaveWithRoutine('   \n  ');

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$PreShotRoutineText).toBe('my custom routine');
    });

    it('storesEmptyWhenProvidedRoutineEmptyAndNoExistingSettings', async () => {
        mockGetAllSync.mockReturnValue([]);

        await callSaveWithRoutine('');

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$PreShotRoutineText).toBe('');
    });

    it('readsExistingRoutineBeforeOverwriting', async () => {
        mockGetAllSync.mockReturnValue([{ PreShotRoutineText: 'existing routine' }]);

        await callSaveWithRoutine('');

        const selectCall = mockGetAllSync.mock.calls.find(
            (call: string[]) => /SELECT[\s\S]*PreShotRoutineText[\s\S]*FROM Settings/i.test(call[0])
        );
        expect(selectCall).toBeTruthy();
    });

    it('returnsTrueOnSuccess', async () => {
        mockGetAllSync.mockReturnValue([]);

        const result = await callSaveWithRoutine('a routine');

        expect(result).toBe(true);
    });

    it('persistsTempoBpm', async () => {
        mockGetAllSync.mockReturnValue([]);

        await saveSettings(1, 'female', 1, 0, 0, 0, 0, 0, 7, 0, 1, '', '', 0, 0, 84);

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$TempoBpm).toBe(84);
    });
});

describe('getSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returnsFirstRowWhenSettingsExist', () => {
        const row = { Id: 1, PreShotRoutineText: 'stored' };
        mockGetAllSync.mockReturnValue([row]);

        expect(getSettings()).toEqual(row);
    });

    it('returnsNullWhenNoSettings', () => {
        mockGetAllSync.mockReturnValue([]);

        expect(getSettings()).toBeNull();
    });
});
