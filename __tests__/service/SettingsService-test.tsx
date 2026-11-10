import {
    getSettingsService,
    saveSettingsService,
    AppSettings,
} from '../../service/DbService';
import {
    getSettings,
    saveSettings,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
}));

const mockGetSettings = getSettings as jest.Mock;
const mockSaveSettings = saveSettings as jest.Mock;

const fullRow = (overrides: Record<string, unknown> = {}) => ({
    Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', SoundsEnabled: 1,
    WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0,
    HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0,
    ReviewPromptShown: 0, WhatsNewVersionSeen: '', SettingsOnboardingSeen: 0, PerformOnboardingSeen: 0, TempoBpm: 60, Units: 'yards', SkipStatsFlowEnabled: 0, ...overrides,
});

const defaultExpected: AppSettings = {
    notificationsEnabled: true, voice: 'female', soundsEnabled: true,
    wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false,
    homeOnboardingSeen: false, practiceOnboardingSeen: false,
    reviewPromptShown: false,
    whatsNewVersionSeen: '', settingsOnboardingSeen: false, performOnboardingSeen: false, tempoBpm: 60, units: 'yards', skipStatsFlowEnabled: false, badHoleReassuranceEnabled: true,
};

describe('getSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default settings when no settings exist', () => {
        mockGetSettings.mockReturnValue(null);

        expect(getSettingsService()).toEqual(defaultExpected);
    });

    it('returns settings from database', () => {
        mockGetSettings.mockReturnValue(fullRow({ Voice: 'male' }));

        expect(getSettingsService()).toEqual({ ...defaultExpected, voice: 'male' });
    });

    it('maps NotificationsEnabled 0 to false', () => {
        mockGetSettings.mockReturnValue(fullRow({ NotificationsEnabled: 0, Voice: 'neutral', SoundsEnabled: 0, WedgeChartOnboardingSeen: 1, DistancesOnboardingSeen: 1, PlayOnboardingSeen: 1 }));

        expect(getSettingsService()).toEqual({
            ...defaultExpected,
            notificationsEnabled: false, voice: 'neutral', soundsEnabled: false,
            wedgeChartOnboardingSeen: true, distancesOnboardingSeen: true, playOnboardingSeen: true,
        });
    });

    it('maps SoundsEnabled 0 to false', () => {
        mockGetSettings.mockReturnValue(fullRow({ SoundsEnabled: 0 }));

        expect(getSettingsService().soundsEnabled).toBe(false);
    });

    it('defaults soundsEnabled to true when SoundsEnabled column is missing', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        expect(getSettingsService().soundsEnabled).toBe(true);
    });

    it('maps playOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue(fullRow({ PlayOnboardingSeen: 1 }));

        expect(getSettingsService().playOnboardingSeen).toBe(true);
    });

    it('maps ReviewPromptShown 1 to true', () => {
        mockGetSettings.mockReturnValue(fullRow({ ReviewPromptShown: 1 }));

        expect(getSettingsService().reviewPromptShown).toBe(true);
    });

    it('defaults reviewPromptShown to false when column missing', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', PracticeOnboardingSeen: 0 });

        expect(getSettingsService().reviewPromptShown).toBe(false);
    });

    it('returns the stored whats-new version seen', () => {
        mockGetSettings.mockReturnValue(fullRow({ WhatsNewVersionSeen: '2.0.17' }));

        expect(getSettingsService().whatsNewVersionSeen).toBe('2.0.17');
    });

    it('defaults whatsNewVersionSeen to empty string when column missing', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', PracticeOnboardingSeen: 0 });

        expect(getSettingsService().whatsNewVersionSeen).toBe('');
    });

    it('maps SettingsOnboardingSeen 1 to true', () => {
        mockGetSettings.mockReturnValue(fullRow({ SettingsOnboardingSeen: 1 }));

        expect(getSettingsService().settingsOnboardingSeen).toBe(true);
    });

    it('defaults settingsOnboardingSeen to false when column missing', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', PracticeOnboardingSeen: 0 });

        expect(getSettingsService().settingsOnboardingSeen).toBe(false);
    });

    it('maps Voice male from database', () => {
        mockGetSettings.mockReturnValue(fullRow({ Voice: 'male' }));

        expect(getSettingsService().voice).toBe('male');
    });

    it('defaultsVoiceToFemaleWhenVoiceColumnIsNull', () => {
        mockGetSettings.mockReturnValue(fullRow({ Voice: null }));

        expect(getSettingsService().voice).toBe('female');
    });

    it('returns the stored tempo BPM', () => {
        mockGetSettings.mockReturnValue(fullRow({ TempoBpm: 96 }));

        expect(getSettingsService().tempoBpm).toBe(96);
    });

    it('defaults tempoBpm to 60 when column missing', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', PracticeOnboardingSeen: 0 });

        expect(getSettingsService().tempoBpm).toBe(60);
    });

    it('defaults tempoBpm to 60 when no settings exist', () => {
        mockGetSettings.mockReturnValue(null);

        expect(getSettingsService().tempoBpm).toBe(60);
    });
});

describe('saveSettingsService', () => {
    const baseSettings: AppSettings = {
        notificationsEnabled: true,
        voice: 'female',
        soundsEnabled: true,
        wedgeChartOnboardingSeen: false,
        distancesOnboardingSeen: false,
        playOnboardingSeen: false,
        homeOnboardingSeen: false,
        practiceOnboardingSeen: false,
        reviewPromptShown: false,
        whatsNewVersionSeen: '',
        settingsOnboardingSeen: false,
        performOnboardingSeen: false,
        tempoBpm: 60,
        units: 'yards',
        skipStatsFlowEnabled: false,
        badHoleReassuranceEnabled: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves settings to database', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const result = await saveSettingsService({ ...baseSettings, notificationsEnabled: false });

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith(0, 'female', 1, 0, 0, 0, 0, 0, 0, '', 0, 0, 60, 'yards', 0, 1);
    });

    it('maps notificationsEnabled true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        await saveSettingsService(baseSettings);

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 0, 0, 0, 0, 0, '', 0, 0, 60, 'yards', 0, 1);
    });

    it('maps reviewPromptShown true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        await saveSettingsService({ ...baseSettings, reviewPromptShown: true });

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 0, 0, 0, 0, 1, '', 0, 0, 60, 'yards', 0, 1);
    });

    it('passes voice neutral to saveSettings', async () => {
        mockSaveSettings.mockResolvedValue(true);

        await saveSettingsService({ ...baseSettings, voice: 'neutral' });

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'neutral', 1, 0, 0, 0, 0, 0, 0, '', 0, 0, 60, 'yards', 0, 1);
    });

    it('returns false when save fails', async () => {
        mockSaveSettings.mockResolvedValue(false);

        expect(await saveSettingsService(baseSettings)).toBe(false);
    });

    it('forwards tempoBpm to saveSettings', async () => {
        mockSaveSettings.mockResolvedValue(true);

        await saveSettingsService({ ...baseSettings, tempoBpm: 108 });

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 0, 0, 0, 0, 0, '', 0, 0, 108, 'yards', 0, 1);
    });
});
