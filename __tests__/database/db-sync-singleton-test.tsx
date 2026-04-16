// Tests that the database is opened once via openDatabaseAsync and that
// openDatabaseSync is NEVER called. On Android, openDatabaseSync calls
// nativeDatabase.initSync() which produces a null native handle, causing
// NullPointerException in prepareSync. The correct approach is to open
// once with openDatabaseAsync and use sync methods on that connection.

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

    it('does not call openDatabaseSync at any point during or after initialize', async () => {
        const { initialize, getAllPracticeReminders } = require('../../database/db');

        await initialize();
        getAllPracticeReminders();

        expect(mockOpenDatabaseSync).not.toHaveBeenCalled();
    });

    it('reuses the async connection for reads after initialize', async () => {
        const { initialize, getAllPracticeReminders } = require('../../database/db');

        await initialize();
        getAllPracticeReminders();

        // openDatabaseAsync called once during initialize, not again for reads
        expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });
});
