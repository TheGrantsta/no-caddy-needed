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

        expect(result).toEqual({ theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });
    });

    it('returns settings from database', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'light', NotificationsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result).toEqual({ theme: 'light', notificationsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });
    });

    it('maps NotificationsEnabled 0 to false', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 0, WedgeChartOnboardingSeen: 1, DistancesOnboardingSeen: 1, PlayOnboardingSeen: 1, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result).toEqual({ theme: 'dark', notificationsEnabled: false, wedgeChartOnboardingSeen: true, distancesOnboardingSeen: true, playOnboardingSeen: true, homeOnboardingSeen: false, practiceOnboardingSeen: false });
    });

    it('maps playOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 1, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.playOnboardingSeen).toBe(true);
    });

    it('maps homeOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 1, PracticeOnboardingSeen: 0 });

        const result = getSettingsService();

        expect(result.homeOnboardingSeen).toBe(true);
    });

    it('maps practiceOnboardingSeen true to 1', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 1, WedgeChartOnboardingSeen: 0, DistancesOnboardingSeen: 0, PlayOnboardingSeen: 0, HomeOnboardingSeen: 0, PracticeOnboardingSeen: 1 });

        const result = getSettingsService();

        expect(result.practiceOnboardingSeen).toBe(true);
    });
});

describe('saveSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves settings to database', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'light', notificationsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith('light', 0, 0, 0, 0, 0, 0);
    });

    it('maps notificationsEnabled true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 1, 0, 0, 0, 0, 0);
    });

    it('maps wedgeChartOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'dark', notificationsEnabled: false, wedgeChartOnboardingSeen: true, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 0, 1, 0, 0, 0, 0);
    });

    it('maps playOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: true, homeOnboardingSeen: false, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 1, 0, 0, 1, 0, 0);
    });

    it('maps homeOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'dark', notificationsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: true, practiceOnboardingSeen: false };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 0, 0, 0, 0, 1, 0);
    });

    it('maps practiceOnboardingSeen true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'dark', notificationsEnabled: false, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: true };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 0, 0, 0, 0, 0, 1);
    });

    it('returns false when save fails', async () => {
        mockSaveSettings.mockResolvedValue(false);

        const result = await saveSettingsService({ theme: 'dark', notificationsEnabled: true, wedgeChartOnboardingSeen: false, distancesOnboardingSeen: false, playOnboardingSeen: false, homeOnboardingSeen: false, practiceOnboardingSeen: false });

        expect(result).toBe(false);
    });
});
