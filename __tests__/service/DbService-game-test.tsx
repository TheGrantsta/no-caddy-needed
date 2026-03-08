import { getGamesByCategoryService, insertGameService, deleteGameService, restoreGameService } from '../../service/DbService';
import { getGamesByCategory, insertGame, softDeleteGame, restoreGame } from '../../database/db';

jest.mock('../../database/db', () => ({
    getGamesByCategory: jest.fn(),
    insertGame: jest.fn(),
    softDeleteGame: jest.fn(),
    restoreGame: jest.fn(),
}));

const mockGetGamesByCategory = getGamesByCategory as jest.Mock;
const mockInsertGame = insertGame as jest.Mock;
const mockSoftDeleteGame = softDeleteGame as jest.Mock;
const mockRestoreGame = restoreGame as jest.Mock;

describe('getGamesByCategoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('callsGetGamesByCategoryWithCategory', () => {
        mockGetGamesByCategory.mockReturnValue([]);

        getGamesByCategoryService('putting');

        expect(mockGetGamesByCategory).toHaveBeenCalledWith('putting');
    });

    it('mapsRowFieldsToGameData', () => {
        mockGetGamesByCategory.mockReturnValue([
            { Id: 1, Category: 'putting', Header: 'Around the world!', Objective: 'Obj', SetUp: 'Setup', HowToPlay: 'Play' },
        ]);

        const result = getGamesByCategoryService('putting');

        expect(result[0]).toMatchObject({
            id: 1,
            header: 'Around the world!',
            objective: 'Obj',
            setup: 'Setup',
            howToPlay: 'Play',
        });
    });
});

describe('insertGameService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('delegatesToInsertGameWithAllParams', async () => {
        mockInsertGame.mockResolvedValue(true);

        await insertGameService('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        expect(mockInsertGame).toHaveBeenCalledWith('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');
    });

    it('returnsTrueOnSuccess', async () => {
        mockInsertGame.mockResolvedValue(true);

        const result = await insertGameService('putting', 'My Game', 'Obj', 'Setup', 'HowToPlay');

        expect(result).toBe(true);
    });
});

describe('deleteGameService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('delegatesToSoftDeleteGame', async () => {
        mockSoftDeleteGame.mockResolvedValue(true);

        await deleteGameService(3);

        expect(mockSoftDeleteGame).toHaveBeenCalledWith(3);
    });

    it('returnsTrueOnSuccess', async () => {
        mockSoftDeleteGame.mockResolvedValue(true);

        const result = await deleteGameService(3);

        expect(result).toBe(true);
    });
});

describe('restoreGameService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('delegatesToRestoreGame', async () => {
        mockRestoreGame.mockResolvedValue(true);

        await restoreGameService(3);

        expect(mockRestoreGame).toHaveBeenCalledWith(3);
    });

    it('returnsTrueOnSuccess', async () => {
        mockRestoreGame.mockResolvedValue(true);

        const result = await restoreGameService(3);

        expect(result).toBe(true);
    });
});
