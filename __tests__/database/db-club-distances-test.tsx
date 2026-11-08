import { initialize, insertClubDistances } from '../../database/db';

const mockExecuteAsync = jest.fn().mockResolvedValue(undefined);
const mockFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareSync = jest.fn(() => ({
    executeAsync: mockExecuteAsync,
    finalizeAsync: mockFinalizeAsync,
}));
const mockExecSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        getAllSync: jest.fn(() => []),
        execSync: mockExecSync,
        prepareSync: mockPrepareSync,
    })),
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn().mockResolvedValue(undefined),
        prepareAsync: jest.fn(),
        getAllSync: jest.fn(() => []),
    })),
}));

describe('insertClubDistances', () => {
    beforeAll(async () => {
        await initialize();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldInsertTotalDistanceAlongsideCarryDistance', async () => {
        const ok = await insertClubDistances([
            { Club: 'Driver', CarryDistance: 230, TotalDistance: 250 },
        ]);

        expect(ok).toBe(true);
        expect(mockPrepareSync).toHaveBeenCalledWith(
            expect.stringContaining('TotalDistance')
        );
        expect(mockExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $Club: 'Driver', $CarryDistance: 230, $TotalDistance: 250 })
        );
    });

    it('shouldStoreZeroTotalDistanceWhenNoneRecorded', async () => {
        await insertClubDistances([{ Club: 'Wedge', CarryDistance: 90, TotalDistance: 0 }]);

        expect(mockExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $TotalDistance: 0 })
        );
    });
});
