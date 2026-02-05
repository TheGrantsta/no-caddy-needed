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

        expect(result).toEqual({ theme: 'dark', notificationsEnabled: true });
    });

    it('returns settings from database', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'light', NotificationsEnabled: 1 });

        const result = getSettingsService();

        expect(result).toEqual({ theme: 'light', notificationsEnabled: true });
    });

    it('maps NotificationsEnabled 0 to false', () => {
        mockGetSettings.mockReturnValue({ Id: 1, Theme: 'dark', NotificationsEnabled: 0 });

        const result = getSettingsService();

        expect(result).toEqual({ theme: 'dark', notificationsEnabled: false });
    });
});

describe('saveSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saves settings to database', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'light', notificationsEnabled: false };
        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith('light', 0);
    });

    it('maps notificationsEnabled true to 1', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = { theme: 'dark', notificationsEnabled: true };
        await saveSettingsService(settings);

        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 1);
    });

    it('returns false when save fails', async () => {
        mockSaveSettings.mockResolvedValue(false);

        const result = await saveSettingsService({ theme: 'dark', notificationsEnabled: true });

        expect(result).toBe(false);
    });
});
