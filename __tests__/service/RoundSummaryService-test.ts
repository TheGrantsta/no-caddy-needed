import { buildSummaryForRoundService } from '../../service/RoundSummaryService';
import { getMultiplayerScorecardService, getPuttingStatsService, getDeadlySinsForRoundService } from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    getMultiplayerScorecardService: jest.fn(),
    getPuttingStatsService: jest.fn(),
    getDeadlySinsForRoundService: jest.fn(),
}));

const mockScorecard = getMultiplayerScorecardService as jest.Mock;
const mockPutting = getPuttingStatsService as jest.Mock;
const mockSins = getDeadlySinsForRoundService as jest.Mock;

const scorecard = {
    round: { CourseName: 'Pebble Beach' },
    players: [{ Id: 1, PlayerName: 'You' }],
    holeScores: [
        { HoleNumber: 1, RoundPlayerId: 1, Score: 4 },
        { HoleNumber: 2, RoundPlayerId: 1, Score: 5 },
    ],
};

describe('buildSummaryForRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldReturnNullWhenTheRoundHasNoScorecard', () => {
        mockScorecard.mockReturnValue(null);

        expect(buildSummaryForRoundService(7, false)).toBeNull();
    });

    it('shouldSummariseAScoreOnlyRoundWithoutPuttingOrSins', () => {
        mockScorecard.mockReturnValue(scorecard);

        const summary = buildSummaryForRoundService(7, true);

        expect(summary?.courseName).toBe('Pebble Beach');
        expect(summary?.strokes).toEqual([{ playerId: 1, name: 'You', strokes: 9 }]);
        expect(summary?.putting).toBeNull();
        expect(summary?.sins).toBeNull();
        expect(mockPutting).not.toHaveBeenCalled();
    });

    it('shouldCountPuttsGreensAndSinsForAFullRound', () => {
        mockScorecard.mockReturnValue(scorecard);
        mockPutting.mockImplementation((_roundId: number, hole: number) =>
            hole === 1
                ? { FirstPuttDistance: 2, SecondPuttDistance: 1, GreenInRegulation: 1 }
                : { FirstPuttDistance: 3, SecondPuttDistance: 0, GreenInRegulation: 0 });
        mockSins.mockReturnValue({
            TroubleOffTee: 1, Penalties: 0, ThreePutts: 0, BogeysInside9Iron: 0,
            DoubleChips: 0, DoubleBogeys: 0, BogeysPar5: 0, Total: 1,
        });

        const summary = buildSummaryForRoundService(7, false);

        expect(summary?.putting).toEqual({ putts: 4, greensInRegulation: 1, holes: 2 });
        expect(summary?.sins?.total).toBe(1);
    });
});
