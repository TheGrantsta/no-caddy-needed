import { updateScorecardService, getTiger5ForRoundService } from '../../service/DbService';
import {
    updateRoundHoleScore,
    updateRoundTotalScore,
    getRoundHoleScores,
    getRoundPlayers,
    getAllTiger5Rounds,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    updateRoundHoleScore: jest.fn(),
    updateRoundTotalScore: jest.fn(),
    getRoundHoleScores: jest.fn(),
    getRoundPlayers: jest.fn(),
    getAllTiger5Rounds: jest.fn(),
}));

const mockUpdateRoundHoleScore = updateRoundHoleScore as jest.Mock;
const mockUpdateRoundTotalScore = updateRoundTotalScore as jest.Mock;
const mockGetRoundHoleScores = getRoundHoleScores as jest.Mock;
const mockGetRoundPlayers = getRoundPlayers as jest.Mock;
const mockGetAllTiger5Rounds = getAllTiger5Rounds as jest.Mock;

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
});

describe('getTiger5ForRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns matching tiger 5 round by date', () => {
        mockGetAllTiger5Rounds.mockReturnValue([
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 1, Created_At: '2025-06-15T14:00:00.000Z' },
            { Id: 2, ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 3, Created_At: '2025-06-16T14:00:00.000Z' },
        ]);

        const result = getTiger5ForRoundService('2025-06-15T10:00:00.000Z');

        expect(result).not.toBeNull();
        expect(result!.Id).toBe(1);
    });

    it('returns null when no matching tiger 5 round', () => {
        mockGetAllTiger5Rounds.mockReturnValue([
            { Id: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, Total: 1, Created_At: '2025-06-15T14:00:00.000Z' },
        ]);

        const result = getTiger5ForRoundService('2025-07-01T10:00:00.000Z');

        expect(result).toBeNull();
    });

    it('returns null when no tiger 5 rounds exist', () => {
        mockGetAllTiger5Rounds.mockReturnValue([]);

        const result = getTiger5ForRoundService('2025-06-15T10:00:00.000Z');

        expect(result).toBeNull();
    });
});
