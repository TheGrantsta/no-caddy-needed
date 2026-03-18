import { getParAveragesService } from '../../service/DbService';
import { getRoundPlayers, getRoundHoleScores } from '../../database/db';
import { Round } from '../../service/DbService';

jest.mock('../../database/db', () => ({
    getRoundPlayers: jest.fn(),
    getRoundHoleScores: jest.fn(),
}));

const mockGetRoundPlayers = getRoundPlayers as jest.Mock;
const mockGetRoundHoleScores = getRoundHoleScores as jest.Mock;

const stubRound = (id: number): Round => ({
    Id: id,
    TotalScore: 0,
    StrokeTotal: null,
    StartTime: '',
    EndTime: null,
    IsCompleted: 1,
    CourseName: null,
    Created_At: '01/01',
    HolesPlayed: 0,
});

const userPlayer = { Id: 10, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 };
const otherPlayer = { Id: 20, RoundId: 1, PlayerName: 'Bob', IsUser: 0, SortOrder: 1 };

describe('getParAveragesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null for all pars when no rounds provided', () => {
        const result = getParAveragesService([]);
        expect(result).toEqual({ par3: null, par4: null, par5: null });
    });

    it('returns null for all pars when user player has no hole scores', () => {
        mockGetRoundPlayers.mockReturnValue([userPlayer]);
        mockGetRoundHoleScores.mockReturnValue([]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result).toEqual({ par3: null, par4: null, par5: null });
    });

    it('calculates par 3 average correctly', () => {
        mockGetRoundPlayers.mockReturnValue([userPlayer]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 1, HolePar: 3, Score: 3 },
            { Id: 2, RoundId: 1, RoundPlayerId: 10, HoleNumber: 2, HolePar: 3, Score: 4 },
        ]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result.par3).toBe(3.5);
        expect(result.par4).toBeNull();
        expect(result.par5).toBeNull();
    });

    it('calculates par 4 average correctly', () => {
        mockGetRoundPlayers.mockReturnValue([userPlayer]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 1, HolePar: 4, Score: 4 },
            { Id: 2, RoundId: 1, RoundPlayerId: 10, HoleNumber: 2, HolePar: 4, Score: 5 },
        ]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result.par4).toBe(4.5);
        expect(result.par3).toBeNull();
        expect(result.par5).toBeNull();
    });

    it('calculates par 5 average correctly', () => {
        mockGetRoundPlayers.mockReturnValue([userPlayer]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 1, HolePar: 5, Score: 5 },
            { Id: 2, RoundId: 1, RoundPlayerId: 10, HoleNumber: 2, HolePar: 5, Score: 6 },
        ]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result.par5).toBe(5.5);
        expect(result.par3).toBeNull();
        expect(result.par4).toBeNull();
    });

    it('calculates averages across multiple rounds', () => {
        mockGetRoundPlayers
            .mockReturnValueOnce([{ ...userPlayer, RoundId: 1 }])
            .mockReturnValueOnce([{ ...userPlayer, Id: 11, RoundId: 2 }]);
        mockGetRoundHoleScores
            .mockReturnValueOnce([
                { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 1, HolePar: 4, Score: 4 },
            ])
            .mockReturnValueOnce([
                { Id: 2, RoundId: 2, RoundPlayerId: 11, HoleNumber: 1, HolePar: 4, Score: 6 },
            ]);

        const result = getParAveragesService([stubRound(1), stubRound(2)]);
        expect(result.par4).toBe(5);
    });

    it('returns null for par not present in data', () => {
        mockGetRoundPlayers.mockReturnValue([userPlayer]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 1, HolePar: 4, Score: 4 },
        ]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result.par3).toBeNull();
        expect(result.par4).toBe(4);
        expect(result.par5).toBeNull();
    });

    it('only counts user player scores, not other players', () => {
        mockGetRoundPlayers.mockReturnValue([userPlayer, otherPlayer]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 10, HoleNumber: 1, HolePar: 4, Score: 4 },
            { Id: 2, RoundId: 1, RoundPlayerId: 20, HoleNumber: 1, HolePar: 4, Score: 7 },
        ]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result.par4).toBe(4);
    });

    it('returns null for par when no user player found in a round', () => {
        mockGetRoundPlayers.mockReturnValue([otherPlayer]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 20, HoleNumber: 1, HolePar: 4, Score: 4 },
        ]);

        const result = getParAveragesService([stubRound(1)]);
        expect(result).toEqual({ par3: null, par4: null, par5: null });
    });
});
