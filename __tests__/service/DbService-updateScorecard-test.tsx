import { updateScorecardService, getDeadlySinsForRoundService } from '../../service/DbService';
import {
    updateRoundHoleScore,
    updateRoundTotalScore,
    getRoundHoleScores,
    getRoundPlayers,
    getDeadlySinsRoundByRoundId,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    updateRoundHoleScore: jest.fn(),
    updateRoundTotalScore: jest.fn(),
    getRoundHoleScores: jest.fn(),
    getRoundPlayers: jest.fn(),
    getDeadlySinsRoundByRoundId: jest.fn(),
}));

const mockUpdateRoundHoleScore = updateRoundHoleScore as jest.Mock;
const mockUpdateRoundTotalScore = updateRoundTotalScore as jest.Mock;
const mockGetRoundHoleScores = getRoundHoleScores as jest.Mock;
const mockGetRoundPlayers = getRoundPlayers as jest.Mock;
const mockGetDeadlySinsRoundByRoundId = getDeadlySinsRoundByRoundId as jest.Mock;

describe('updateScorecardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates all changed scores in database', async () => {
        mockUpdateRoundHoleScore.mockResolvedValue(true);
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
            { Id: 11, RoundId: 1, RoundPlayerId: 1, HoleNumber: 2, HolePar: 4, Score: 4 },
        ]);
        mockUpdateRoundTotalScore.mockResolvedValue(true);

        await updateScorecardService(1, [
            { id: 10, score: 6 },
            { id: 11, score: 3 },
        ]);

        expect(mockUpdateRoundHoleScore).toHaveBeenCalledWith(10, 6);
        expect(mockUpdateRoundHoleScore).toHaveBeenCalledWith(11, 3);
    });

    it('recalculates user total score as sum of score minus hole par', async () => {
        mockUpdateRoundHoleScore.mockResolvedValue(true);
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
            { Id: 11, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 3 },
            { Id: 12, RoundId: 1, RoundPlayerId: 1, HoleNumber: 2, HolePar: 4, Score: 6 },
            { Id: 13, RoundId: 1, RoundPlayerId: 2, HoleNumber: 2, HolePar: 4, Score: 4 },
        ]);
        mockUpdateRoundTotalScore.mockResolvedValue(true);

        await updateScorecardService(1, [{ id: 10, score: 5 }]);

        // User scores: (5-4) + (6-4) = 1 + 2 = 3
        expect(mockUpdateRoundTotalScore).toHaveBeenCalledWith(1, 3);
    });

    it('updates round total score', async () => {
        mockUpdateRoundHoleScore.mockResolvedValue(true);
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 4 },
        ]);
        mockUpdateRoundTotalScore.mockResolvedValue(true);

        const result = await updateScorecardService(1, [{ id: 10, score: 4 }]);

        expect(mockUpdateRoundTotalScore).toHaveBeenCalledWith(1, 0);
        expect(result).toBe(true);
    });

    it('returns false when score update fails', async () => {
        mockUpdateRoundHoleScore.mockResolvedValue(false);

        const result = await updateScorecardService(1, [{ id: 10, score: 5 }]);

        expect(result).toBe(false);
    });

    it('returns false when total update fails', async () => {
        mockUpdateRoundHoleScore.mockResolvedValue(true);
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
        ]);
        mockUpdateRoundTotalScore.mockResolvedValue(false);

        const result = await updateScorecardService(1, [{ id: 10, score: 5 }]);

        expect(result).toBe(false);
    });

    it('usesTotalScoreOfZeroWhenNoUserPlayerFound', async () => {
        mockUpdateRoundHoleScore.mockResolvedValue(true);
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 10, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
        ]);
        mockUpdateRoundTotalScore.mockResolvedValue(true);

        await updateScorecardService(1, [{ id: 10, score: 5 }]);

        expect(mockUpdateRoundTotalScore).toHaveBeenCalledWith(1, 0);
    });
});

describe('getDeadlySinsForRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls getDeadlySinsRoundByRoundId with the given numeric roundId', () => {
        mockGetDeadlySinsRoundByRoundId.mockReturnValue(null);

        getDeadlySinsForRoundService(5);

        expect(mockGetDeadlySinsRoundByRoundId).toHaveBeenCalledWith(5);
    });

    it('returns mapped DeadlySinsRound when db returns a row', () => {
        mockGetDeadlySinsRoundByRoundId.mockReturnValue({
            Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
            DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 1,
            RoundId: 5, Created_At: '2025-06-15T14:00:00.000Z',
        });

        const result = getDeadlySinsForRoundService(5);

        expect(result).not.toBeNull();
        expect(result!.Id).toBe(1);
        expect(result!.Total).toBe(1);
    });

    it('returns null when db returns null', () => {
        mockGetDeadlySinsRoundByRoundId.mockReturnValue(null);

        const result = getDeadlySinsForRoundService(5);

        expect(result).toBeNull();
    });

    it('returnsNullRoundIdWhenDbRowHasNullRoundId', () => {
        mockGetDeadlySinsRoundByRoundId.mockReturnValue({
            Id: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0,
            DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0,
            RoundId: null, Created_At: '2025-06-15T14:00:00.000Z',
        });

        const result = getDeadlySinsForRoundService(5);

        expect(result!.RoundId).toBeNull();
    });
});
