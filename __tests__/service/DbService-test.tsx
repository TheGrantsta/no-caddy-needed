import { getDrillStatsByTypeService, getSettingsService, saveSettingsService, AppSettings } from '../../service/DbService';
import { getAllDrillHistory, getSettings, saveSettings } from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllDrillHistory: jest.fn(),
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
}));

const mockGetAllDrillHistory = getAllDrillHistory as jest.Mock;
const mockGetSettings = getSettings as jest.Mock;
const mockSaveSettings = saveSettings as jest.Mock;

describe('getDrillStatsByTypeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when no drill history exists', () => {
        mockGetAllDrillHistory.mockReturnValue([]);

        const result = getDrillStatsByTypeService();

        expect(result).toEqual([]);
    });

    it('calculates correct stats for single drill type', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Putting - Gate', Result: 1, Created_At: '2025-01-01' },
            { Id: 2, Name: 'Putting - Gate', Result: 1, Created_At: '2025-01-02' },
            { Id: 3, Name: 'Putting - Gate', Result: 0, Created_At: '2025-01-03' },
        ]);

        const result = getDrillStatsByTypeService();

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            name: 'Putting - Gate',
            total: 3,
            met: 2,
            successRate: 67,
        });
    });

    it('calculates correct stats for multiple drill types', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Putting - Gate', Result: 1, Created_At: '2025-01-01' },
            { Id: 2, Name: 'Putting - Gate', Result: 1, Created_At: '2025-01-02' },
            { Id: 3, Name: 'Chipping - Hoop', Result: 0, Created_At: '2025-01-03' },
            { Id: 4, Name: 'Chipping - Hoop', Result: 1, Created_At: '2025-01-04' },
        ]);

        const result = getDrillStatsByTypeService();

        expect(result).toHaveLength(2);

        const puttingStats = result.find(s => s.name === 'Putting - Gate');
        const chippingStats = result.find(s => s.name === 'Chipping - Hoop');

        expect(puttingStats).toEqual({
            name: 'Putting - Gate',
            total: 2,
            met: 2,
            successRate: 100,
        });

        expect(chippingStats).toEqual({
            name: 'Chipping - Hoop',
            total: 2,
            met: 1,
            successRate: 50,
        });
    });

    it('sorts results by total count descending', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Drill A', Result: 1, Created_At: '2025-01-01' },
            { Id: 2, Name: 'Drill B', Result: 1, Created_At: '2025-01-02' },
            { Id: 3, Name: 'Drill B', Result: 1, Created_At: '2025-01-03' },
            { Id: 4, Name: 'Drill B', Result: 0, Created_At: '2025-01-04' },
            { Id: 5, Name: 'Drill C', Result: 1, Created_At: '2025-01-05' },
            { Id: 6, Name: 'Drill C', Result: 1, Created_At: '2025-01-06' },
        ]);

        const result = getDrillStatsByTypeService();

        expect(result[0].name).toBe('Drill B');
        expect(result[0].total).toBe(3);
        expect(result[1].total).toBe(2);
        expect(result[2].total).toBe(1);
    });

    it('rounds success rate to nearest integer', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Drill A', Result: 1, Created_At: '2025-01-01' },
            { Id: 2, Name: 'Drill A', Result: 1, Created_At: '2025-01-02' },
            { Id: 3, Name: 'Drill A', Result: 0, Created_At: '2025-01-03' },
        ]);

        const result = getDrillStatsByTypeService();

        // 2/3 = 66.666... should round to 67
        expect(result[0].successRate).toBe(67);
    });

    it('handles 0% success rate', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Hard Drill', Result: 0, Created_At: '2025-01-01' },
            { Id: 2, Name: 'Hard Drill', Result: 0, Created_At: '2025-01-02' },
        ]);

        const result = getDrillStatsByTypeService();

        expect(result[0].successRate).toBe(0);
        expect(result[0].met).toBe(0);
    });

    it('handles 100% success rate', () => {
        mockGetAllDrillHistory.mockReturnValue([
            { Id: 1, Name: 'Easy Drill', Result: 1, Created_At: '2025-01-01' },
            { Id: 2, Name: 'Easy Drill', Result: 1, Created_At: '2025-01-02' },
        ]);

        const result = getDrillStatsByTypeService();

        expect(result[0].successRate).toBe(100);
        expect(result[0].met).toBe(2);
    });
});

describe('getSettingsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default settings when no settings exist', () => {
        mockGetSettings.mockReturnValue(null);

        const result = getSettingsService();

        expect(result).toEqual({
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: false,
        });
    });

    it('returns settings with wedgeChartOnboardingSeen false', () => {
        mockGetSettings.mockReturnValue({
            Id: 1,
            Theme: 'light',
            NotificationsEnabled: 1,
            WedgeChartOnboardingSeen: 0,
        });

        const result = getSettingsService();

        expect(result).toEqual({
            theme: 'light',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: false,
        });
    });

    it('returns settings with wedgeChartOnboardingSeen true', () => {
        mockGetSettings.mockReturnValue({
            Id: 1,
            Theme: 'dark',
            NotificationsEnabled: 0,
            WedgeChartOnboardingSeen: 1,
        });

        const result = getSettingsService();

        expect(result).toEqual({
            theme: 'dark',
            notificationsEnabled: false,
            wedgeChartOnboardingSeen: true,
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
            theme: 'dark',
            notificationsEnabled: true,
            wedgeChartOnboardingSeen: false,
        };

        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith('dark', 1, 0);
    });

    it('saves settings with wedgeChartOnboardingSeen true', async () => {
        mockSaveSettings.mockResolvedValue(true);

        const settings: AppSettings = {
            theme: 'light',
            notificationsEnabled: false,
            wedgeChartOnboardingSeen: true,
        };

        const result = await saveSettingsService(settings);

        expect(result).toBe(true);
        expect(mockSaveSettings).toHaveBeenCalledWith('light', 0, 1);
    });
});
