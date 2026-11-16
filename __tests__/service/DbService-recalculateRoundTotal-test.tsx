import { recalculateRoundTotalService } from '../../service/DbService';
import { updateRoundTotalScore, getRoundHoleScores, getRoundPlayers } from '../../database/db';

jest.mock('../../database/db', () => ({
    updateRoundTotalScore: jest.fn(),
    getRoundHoleScores: jest.fn(),
    getRoundPlayers: jest.fn(),
}));

const mockUpdateRoundTotalScore = updateRoundTotalScore as jest.Mock;
const mockGetRoundHoleScores = getRoundHoleScores as jest.Mock;
const mockGetRoundPlayers = getRoundPlayers as jest.Mock;

const you = { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 };
const alice = { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 };

describe('recalculateRoundTotalService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateRoundTotalScore.mockResolvedValue(true);
    });

    it('shouldStoreTheUsersStrokesRelativeToPar', async () => {
        mockGetRoundPlayers.mockReturnValue([you]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
            { Id: 11, RoundId: 1, RoundPlayerId: 1, HoleNumber: 2, HolePar: 3, Score: 2 },
        ]);

        await recalculateRoundTotalService(1);

        expect(mockUpdateRoundTotalScore).toHaveBeenCalledWith(1, 0);
    });

    it('shouldIgnoreOtherPlayersScores', async () => {
        mockGetRoundPlayers.mockReturnValue([you, alice]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
            { Id: 20, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 9 },
        ]);

        await recalculateRoundTotalService(1);

        expect(mockUpdateRoundTotalScore).toHaveBeenCalledWith(1, 1);
    });

    it('shouldStoreZeroWhenTheUserHasNoSavedHoles', async () => {
        mockGetRoundPlayers.mockReturnValue([you]);
        mockGetRoundHoleScores.mockReturnValue([]);

        await recalculateRoundTotalService(1);

        expect(mockUpdateRoundTotalScore).toHaveBeenCalledWith(1, 0);
    });
});
