import { initialize } from '../../database/db';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
    })),
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
}));

describe('Settings table column migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecAsync.mockResolvedValue(undefined);
    });

    it('should add WedgeChartOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'Theme' },
            { name: 'NotificationsEnabled' },
        ]);

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN WedgeChartOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add DistancesOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'Theme' },
            { name: 'NotificationsEnabled' },
        ]);

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN DistancesOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should add PlayOnboardingSeen column when missing', async () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'Theme' },
            { name: 'NotificationsEnabled' },
        ]);

        await initialize();

        expect(mockExecSync).toHaveBeenCalledWith(
            'ALTER TABLE Settings ADD COLUMN PlayOnboardingSeen INTEGER NOT NULL DEFAULT 0'
        );
    });

    it('should not alter table when all columns already exist', async () => {
        mockGetAllSync.mockReturnValue([
            { name: 'Id' },
            { name: 'Theme' },
            { name: 'NotificationsEnabled' },
            { name: 'WedgeChartOnboardingSeen' },
            { name: 'DistancesOnboardingSeen' },
            { name: 'PlayOnboardingSeen' },
        ]);

        await initialize();

        expect(mockExecSync).not.toHaveBeenCalled();
    });
});
