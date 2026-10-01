import { getSettingsService, saveSettingsService, AppSettings, DEFAULT_PRESHOT_ROUTINE } from '../../service/DbService';
import { getSettings, saveSettings } from '../../database/db';

jest.mock('../../database/db', () => ({
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
}));

const mockGetSettings = getSettings as jest.Mock;
const mockSaveSettings = saveSettings as jest.Mock;

describe('getSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default settings when no settings exist', () => {
        mockGetSettings.mockReturnValue(null);

        const result = getSettingsService();

        expect(result).toEqual({
            notificationsEnabled: true,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: false,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        });
    });

    it('returns settings with wedgeChartOnboardingSeen false', () => {
        mockGetSettings.mockReturnValue({
            Id: 1,
            Theme: 'light',
            NotificationsEnabled: 1,
            Voice: 'female',
            SoundsEnabled: 1,
            WedgeChartOnboardingSeen: 0,
            DistancesOnboardingSeen: 0,
            PlayOnboardingSeen: 0,
            HomeOnboardingSeen: 0,
            PracticeOnboardingSeen: 0,
        });

        const result = getSettingsService();

        expect(result).toEqual({
            notificationsEnabled: true,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: false,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        });
    });

    it('returns settings with wedgeChartOnboardingSeen true', () => {
        mockGetSettings.mockReturnValue({
            Id: 1,
            Theme: 'dark',
            NotificationsEnabled: 0,
            Voice: 'female',
            SoundsEnabled: 1,
            WedgeChartOnboardingSeen: 1,
            DistancesOnboardingSeen: 0,
            PlayOnboardingSeen: 0,
            HomeOnboardingSeen: 0,
            PracticeOnboardingSeen: 0,
        });

        const result = getSettingsService();

        expect(result).toEqual({
            notificationsEnabled: false,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: false,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        });
    });

    it('returns settings with distancesOnboardingSeen true', () => {
        mockGetSettings.mockReturnValue({
            Id: 1,
            Theme: 'dark',
            NotificationsEnabled: 1,
            Voice: 'female',
            SoundsEnabled: 1,
            WedgeChartOnboardingSeen: 0,
            DistancesOnboardingSeen: 1,
            PlayOnboardingSeen: 0,
            HomeOnboardingSeen: 0,
            PracticeOnboardingSeen: 0,
        });

        const result = getSettingsService();

        expect(result).toEqual({
            notificationsEnabled: true,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: true,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        });
    });

    it('returns settings with playOnboardingSeen true', () => {
        mockGetSettings.mockReturnValue({
            Id: 1,
            Theme: 'dark',
            NotificationsEnabled: 1,
            Voice: 'female',
            SoundsEnabled: 1,
            WedgeChartOnboardingSeen: 0,
            DistancesOnboardingSeen: 0,
            PlayOnboardingSeen: 1,
            HomeOnboardingSeen: 0,
            PracticeOnboardingSeen: 0,
        });

        const result = getSettingsService();

        expect(result).toEqual({
            notificationsEnabled: true,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: false,
            playOnboardingSeen: true,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        });
    });
});

describe('saveSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves settings with wedgeChartOnboardingSeen false', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = {
            notificationsEnabled: true,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: false,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        };

        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 0, 0, 0, 0, 0, 1, DEFAULT_PRESHOT_ROUTINE, '', 0, 0, 60, 'yards', 0, 1);
    });

    it('saves settings with wedgeChartOnboardingSeen true', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = {
            notificationsEnabled: false,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: true,
            distancesOnboardingSeen: false,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        };

        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith(0, 'female', 1, 1, 0, 0, 0, 0, 0, 1, DEFAULT_PRESHOT_ROUTINE, '', 0, 0, 60, 'yards', 0, 1);
    });

    it('saves settings with distancesOnboardingSeen true', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = {
            notificationsEnabled: true,
            voice: 'female',
            soundsEnabled: true,
            wedgeChartOnboardingSeen: false,
            distancesOnboardingSeen: true,
            playOnboardingSeen: false,
            homeOnboardingSeen: false,
            practiceOnboardingSeen: false,
            reviewPromptShown: false,
            preShotReminderEnabled: true,
            preShotRoutineText: DEFAULT_PRESHOT_ROUTINE,
            whatsNewVersionSeen: '',
            settingsOnboardingSeen: false,
            performOnboardingSeen: false,
            tempoBpm: 60,
            units: 'yards',
            skipStatsFlowEnabled: false,
            badHoleReassuranceEnabled: true,
        };

        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 1, 0, 0, 0, 0, 1, DEFAULT_PRESHOT_ROUTINE, '', 0, 0, 60, 'yards', 0, 1);
    });
});
