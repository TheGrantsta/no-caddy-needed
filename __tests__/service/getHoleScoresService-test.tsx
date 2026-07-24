import { getHoleScoresService } from '../../service/DbService';
import { getRoundHoleScoresByHole } from '../../database/db';

jest.mock('../../database/db', () => ({
    getRoundHoleScoresByHole: jest.fn(),
}));

const mockGetRoundHoleScoresByHole = getRoundHoleScoresByHole as jest.Mock;

describe('getHoleScoresService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when no scores exist for the hole', () => {
        mockGetRoundHoleScoresByHole.mockReturnValue([]);

        const result = getHoleScoresService(1, 5);

        expect(result).toBeNull();
        expect(mockGetRoundHoleScoresByHole).toHaveBeenCalledWith(1, 5);
    });

    it('returns holePar and scores map when scores exist', () => {
        mockGetRoundHoleScoresByHole.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 5, HolePar: 4, Score: 4 },
            { Id: 2, RoundId: 1, RoundPlayerId: 11, HoleNumber: 5, HolePar: 4, Score: 5 },
            { Id: 3, RoundId: 1, RoundPlayerId: 12, HoleNumber: 5, HolePar: 4, Score: 3 },
        ]);

        const result = getHoleScoresService(1, 5);

        expect(result).toEqual({
            holePar: 4,
            scores: {
                10: 4,
                11: 5,
                12: 3,
            },
        });
    });

    it('uses holePar from first row (all rows have same par per hole)', () => {
        mockGetRoundHoleScoresByHole.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 5, HolePar: 4, Score: 4 },
            { Id: 2, RoundId: 1, RoundPlayerId: 11, HoleNumber: 5, HolePar: 4, Score: 5 },
        ]);

        const result = getHoleScoresService(1, 5);

        expect(result?.holePar).toBe(4);
    });

    it('handles single player score', () => {
        mockGetRoundHoleScoresByHole.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 5, HolePar: 3, Score: 2 },
        ]);

        const result = getHoleScoresService(1, 5);

        expect(result).toEqual({
            holePar: 3,
            scores: {
                10: 2,
            },
        });
    });
});
