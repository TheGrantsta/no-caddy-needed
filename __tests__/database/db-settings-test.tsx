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
// playOnboardingSeen, homeOnboardingSeen, practiceOnboardingSeen, reviewPromptShown,
// whatsNewVersionSeen, settingsOnboardingSeen, performOnboardingSeen, tempoBpm, units,
// skipStatsFlowEnabled, badHoleReassuranceEnabled
const saveDefault = (tempoBpm = 60) =>
    saveSettings(1, 'female', 1, 0, 0, 0, 0, 0, 0, '', 0, 0, tempoBpm, 'yards', 0, 1);

describe('saveSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareSync.mockReturnValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('writesNoPreShotRoutineColumns', async () => {
        await saveDefault();

        const [sql] = mockPrepareSync.mock.calls[0];
        expect(sql).not.toMatch(/PreShot/i);
    });

    it('returnsTrueOnSuccess', async () => {
        const result = await saveDefault();

        expect(result).toBe(true);
    });

    it('persistsTempoBpm', async () => {
        await saveDefault(84);

        const [params] = mockStatementExecuteAsync.mock.calls[0];
        expect(params.$TempoBpm).toBe(84);
    });
});

describe('getSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returnsFirstRowWhenSettingsExist', () => {
        const row = { Id: 1, TempoBpm: 60 };
        mockGetAllSync.mockReturnValue([row]);

        expect(getSettings()).toEqual(row);
    });

    it('returnsNullWhenNoSettings', () => {
        mockGetAllSync.mockReturnValue([]);

        expect(getSettings()).toBeNull();
    });
});
