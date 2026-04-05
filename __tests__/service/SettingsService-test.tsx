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

describe('getSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default settings when no settings exist', () => {
        mockGetSettings.mockReturnValue(null);

        const result = getSettingsService();

        expect(result).toEqual({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });
    });

    it('returns settings from database', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'male', SoundsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result).toEqual({ notificationsEnabled: true, voice: 'male', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });
    });

    it('maps NotificationsEnabled 0 to false', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 0, Voice: 'neutral', SoundsEnabled: 0, WedgeChartOnboardingSeen: 1, DistancesOnboardingSeen: 1, PlayOnboardingSeen: 1, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result).toEqual({ notificationsEnabled: false, voice: 'neutral', soundsEnabled: false, wedgeChartOnboardingSeen: true, distancesOnboardingSeen: true, playOnboardingSeen: true, homeOnboardingSeen: false, practiceOnboardingSeen: false });
    });

    it('maps SoundsEnabled 0 to false', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', SoundsEnabled: 0, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.soundsEnabled).toBe(false);
    });

    it('defaults soundsEnabled to true when SoundsEnabled column is missing', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', SoundsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.soundsEnabled).toBe(true);
    });

    it('maps playOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 1, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.playOnboardingSeen).toBe(true);
    });

    it('maps homeOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 1, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.homeOnboardingSeen).toBe(true);
    });

    it('maps practiceOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 1 });

        const result = getSettingsService();

        expect(result.practiceOnboardingSeen).toBe(true);
    });

    it('maps Voice female from database', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'female', SoundsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.voice).toBe('female');
    });

    it('maps Voice male from database', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'male', WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.voice).toBe('male');
    });

    it('maps Voice neutral from database', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: 'neutral', WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.voice).toBe('neutral');
    });

    it('defaultsVoiceToFemaleWhenVoiceColumnIsNull', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, Voice: null, SoundsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.voice).toBe('female');
    });
});

describe('saveSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves settings to database', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith(0, 'female', 1, 0, 0, 0, 0, 0);
    });

    it('maps notificationsEnabled true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 0, 0, 0, 0);
    });

    it('maps wedgeChartOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: true, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(0, 'female', 1, 1, 0, 0, 0, 0);
    });

    it('maps playOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: true, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'female', 1, 0, 0, 1, 0, 0);
    });

    it('maps homeOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: true, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(0, 'female', 1, 0, 0, 0, 1, 0);
    });

    it('maps practiceOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: false, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: true };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(0, 'female', 1, 0, 0, 0, 0, 1);
    });

    it('passes voice male to saveSettings', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: true, voice: 'male', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'male', 1, 0, 0, 0, 0, 0);
    });

    it('passes voice neutral to saveSettings', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { notificationsEnabled: true, voice: 'neutral', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith(1, 'neutral', 1, 0, 0, 0, 0, 0);
    });

    it('returns false when save fails', async () => {
        mockSaveSettings.mockResolvedValue(false);

        const result = await saveSettingsService({ notificationsEnabled: true, voice: 'female', soundsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        expect(result).toBe(false);
    });
});
