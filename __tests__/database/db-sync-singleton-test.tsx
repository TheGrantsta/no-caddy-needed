// Tests that initialize() opens both an async connection (kept alive at module
// level to hold the native sqlite3* handle on Android) and a sync connection
// (used for all sync reads/writes on both platforms).
//
// Background:
// - openDatabaseSync alone: on Android, initSync() leaves the native handle
//   null → NullPointerException in prepareSync.
// - openDatabaseAsync alone: getAllSync on an async connection deadlocks the
//   JS thread on iOS → app stuck on black screen.
// - Solution: keep _db (async) alive so the native handle stays valid on
//   Android, and use _syncDb (sync) for all sync operations on both platforms.

describe('getSyncDb singleton behaviour after initialize', () => {
    let mockOpenDatabaseSync: jest.Mock;
    let mockOpenDatabaseAsync: jest.Mock;

    beforeEach(() => {
        jest.resetModules();
        mockOpenDatabaseSync = jest.fn(() => ({
            getAllSync: jest.fn().mockReturnValue([]),
            execSync: jest.fn(),
        }));
        mockOpenDatabaseAsync = jest.fn(() => Promise.resolve({
            execAsync: jest.fn().mockResolvedValue(undefined),
            prepareAsync: jest.fn(),
            getAllSync: jest.fn().mockReturnValue([]),
            execSync: jest.fn(),
        }));
        jest.mock('expo-sqlite', () => ({
            openDatabaseAsync: mockOpenDatabaseAsync,
            openDatabaseSync: mockOpenDatabaseSync,
        }));
    });

    it('calls openDatabaseSync exactly once inside initialize to create the sync handle', async () => {
        const { initialize } = require('../../database/db');

        await initialize();

        expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    });

    it('calls openDatabaseAsync exactly once inside initialize to keep native handle alive', async () => {
        const { initialize } = require('../../database/db');

        await initialize();

        expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });

    it('does not call openDatabaseSync a second time for reads after initialize', async () => {
        const { initialize, getAllPracticeReminders } = require('../../database/db');

        await initialize();
        mockOpenDatabaseSync.mockClear();

        getAllPracticeReminders();

        expect(mockOpenDatabaseSync).not.toHaveBeenCalled();
    });

    it('uses the sync connection for reads after initialize, not the async connection', async () => {
        const { initialize, getAllPracticeReminders } = require('../../database/db');

        await initialize();

        const syncDbInstance = mockOpenDatabaseSync.mock.results[0].value;
        getAllPracticeReminders();

        expect(syncDbInstance.getAllSync).toHaveBeenCalled();
    });
});
