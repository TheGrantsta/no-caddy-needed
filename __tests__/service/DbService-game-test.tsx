import { getGamesByCategoryService, insertGameService, toggleGameIsActiveService } from '../../service/DbService';
import { getGamesByCategory, insertGame, updateGameIsActive } from '../../database/db';

jest.mock('../../database/db', () => ({
    getGamesByCategory: jest.fn(),
    insertGame: jest.fn(),
    updateGameIsActive: jest.fn(),
}));

const mockGetGamesByCategory = getGamesByCategory as jest.Mock;
const mockInsertGame = insertGame as jest.Mock;
const mockUpdateGameIsActive = updateGameIsActive as jest.Mock;

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
            { Id: 1, Category: 'putting', Header: 'Around the world!', Objective: 'Obj', SetUp: 'Setup', HowToPlay: 'Play', IsActive: 1 },
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

    it('mapsIsActive0ToFalse', () => {
        mockGetGamesByCategory.mockReturnValue([
            { Id: 1, Category: 'putting', Header: 'Game', Objective: 'Obj', SetUp: 'Setup', HowToPlay: 'Play', IsActive: 0 },
        ]);

        const result = getGamesByCategoryService('putting');

        expect(result[0].isActive).toBe(false);
    });

    it('mapsIsActive1ToTrue', () => {
        mockGetGamesByCategory.mockReturnValue([
            { Id: 1, Category: 'putting', Header: 'Game', Objective: 'Obj', SetUp: 'Setup', HowToPlay: 'Play', IsActive: 1 },
        ]);

        const result = getGamesByCategoryService('putting');

        expect(result[0].isActive).toBe(true);
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

describe('toggleGameIsActiveService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('delegatesToUpdateGameIsActive', async () => {
        mockUpdateGameIsActive.mockResolvedValue(true);

        await toggleGameIsActiveService(3, false);

        expect(mockUpdateGameIsActive).toHaveBeenCalledWith(3, false);
    });

    it('returnsTrueOnSuccess', async () => {
        mockUpdateGameIsActive.mockResolvedValue(true);

        const result = await toggleGameIsActiveService(3, false);

        expect(result).toBe(true);
    });
});
