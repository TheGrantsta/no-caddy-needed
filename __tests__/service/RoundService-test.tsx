import {
    startRoundService,
    endRoundService,
    getRoundScorecardService,
    getActiveRoundService,
    getAllRoundHistoryService,
    addRoundPlayersService,
    addMultiplayerHoleScoresService,
    getRoundPlayersService,
    getMultiplayerScorecardService,
    getRecentCourseNamesService,
    getRecentPlayerNamesService,
    getHolesPlayedForRoundService,
} from '../../service/DbService';
import {
    insertRound,
    updateRound,
    getRoundById,
    getActiveRound,
    getAllRoundsWithPlayersAndScores,
    insertRoundPlayer,
    getRoundPlayers,
    insertRoundHoleScore,
    getRoundHoleScores,
    getDistinctCourseNames,
    getDistinctPlayerNames,
    getHolesPlayedForRound,
    deleteRoundHoleScoresByHole,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    insertRound: jest.fn(),
    updateRound: jest.fn(),
    getRoundById: jest.fn(),
    getActiveRound: jest.fn(),
    getAllRoundsWithPlayersAndScores: jest.fn(),
    insertRoundPlayer: jest.fn(),
    getRoundPlayers: jest.fn(),
    insertRoundHoleScore: jest.fn(),
    getRoundHoleScores: jest.fn(),
    getDistinctCourseNames: jest.fn(),
    getDistinctPlayerNames: jest.fn(),
    getHolesPlayedForRound: jest.fn(),
    deleteRoundHoleScoresByHole: jest.fn(),
}));

const mockInsertRound = insertRound as jest.Mock;
const mockUpdateRound = updateRound as jest.Mock;
const mockGetRoundById = getRoundById as jest.Mock;
const mockGetActiveRound = getActiveRound as jest.Mock;
const mockGetAllRoundsWithPlayersAndScores = getAllRoundsWithPlayersAndScores as jest.Mock;
const mockInsertRoundPlayer = insertRoundPlayer as jest.Mock;
const mockGetRoundPlayers = getRoundPlayers as jest.Mock;
const mockInsertRoundHoleScore = insertRoundHoleScore as jest.Mock;
const mockGetRoundHoleScores = getRoundHoleScores as jest.Mock;
const mockGetDistinctCourseNames = getDistinctCourseNames as jest.Mock;
const mockGetDistinctPlayerNames = getDistinctPlayerNames as jest.Mock;
const mockGetHolesPlayedForRound = getHolesPlayedForRound as jest.Mock;
const mockDeleteRoundHoleScoresByHole = deleteRoundHoleScoresByHole as jest.Mock;

describe('startRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a new round and returns the round ID', async () => {
        mockInsertRound.mockResolvedValue(42);

        const result = await startRoundService('St Andrews');

        expect(mockInsertRound).toHaveBeenCalledWith('St Andrews');
        expect(result).toBe(42);
    });

    it('returns null when insert fails', async () => {
        mockInsertRound.mockResolvedValue(null);

        const result = await startRoundService('');

        expect(result).toBeNull();
    });

    it('passes empty string when no course name provided', async () => {
        mockInsertRound.mockResolvedValue(1);

        const result = await startRoundService('');

        expect(mockInsertRound).toHaveBeenCalledWith('');
        expect(result).toBe(1);
    });
});

describe('endRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetRoundPlayers.mockReturnValue([]);
    });

    it('returns false when update fails and no players', async () => {
        mockUpdateRound.mockResolvedValue(false);

        const result = await endRoundService(1);

        expect(result).toBe(false);
    });
});


describe('getRoundScorecardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns round with empty holes', () => {
        mockGetRoundById.mockReturnValue({
            Id: 1, TotalScore: 3, IsCompleted: 1,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z',
            Created_At: '2025-06-15T10:00:00.000Z',
        });

        const result = getRoundScorecardService(1);

        expect(result).not.toBeNull();
        expect(result!.round.Id).toBe(1);
        expect(result!.round.TotalScore).toBe(3);
        expect(result!.holes).toHaveLength(0);
    });

    it('returns null when round not found', () => {
        mockGetRoundById.mockReturnValue(null);

        const result = getRoundScorecardService(999);

        expect(result).toBeNull();
    });

    it('formats Created_At as DD/MM', () => {
        mockGetRoundById.mockReturnValue({
            Id: 1, TotalScore: 3, IsCompleted: 1,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: '',
            Created_At: '2025-06-15T10:00:00.000Z',
        });

        const result = getRoundScorecardService(1);

        expect(result!.round.Created_At).toBe('15/06');
    });
});

describe('getActiveRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns active round when one exists', () => {
        mockGetActiveRound.mockReturnValue({
            Id: 5, TotalScore: 0, IsCompleted: 0,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: null,
            Created_At: '2025-06-15T10:00:00.000Z',
        });

        const result = getActiveRoundService();

        expect(result).not.toBeNull();
        expect(result!.Id).toBe(5);
        expect(result!.IsCompleted).toBe(0);
    });

    it('returns null when no active round', () => {
        mockGetActiveRound.mockReturnValue(null);

        const result = getActiveRoundService();

        expect(result).toBeNull();
    });
});

describe('getAllRoundHistoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when no rounds exist', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([]);

        const result = getAllRoundHistoryService();

        expect(result).toEqual([]);
    });

    it('includes HolesPlayed in returned rounds', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: 10, StrokeTotal: 72, HolesPlayed: 9 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].HolesPlayed).toBe(9);
    });

    it('returns formatted rounds with dd/mm dates', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: 'St Andrews', UserPlayerId: null, StrokeTotal: null, HolesPlayed: 0 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result).toHaveLength(1);
        expect(result[0].Created_At).toBe('15/06');
        expect(result[0].TotalScore).toBe(3);
    });

    it('returns multiple rounds sorted by most recent', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 2, TotalScore: -1, IsCompleted: 1, StartTime: '2025-07-01T10:00:00.000Z', EndTime: '2025-07-01T14:00:00.000Z', Created_At: '2025-07-01T10:00:00.000Z', CourseName: 'Pebble Beach', UserPlayerId: null, StrokeTotal: null, HolesPlayed: 0 },
            { Id: 1, TotalScore: 5, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: null, StrokeTotal: null, HolesPlayed: 0 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result).toHaveLength(2);
        expect(result[0].Id).toBe(2);
        expect(result[1].Id).toBe(1);
    });

    it('includes CourseName in returned rounds', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: 'St Andrews', UserPlayerId: null, StrokeTotal: null, HolesPlayed: 0 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].CourseName).toBe('St Andrews');
    });

    it('returns null CourseName when not set', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: null, StrokeTotal: null, HolesPlayed: 0 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].CourseName).toBeNull();
    });

    it('computes StrokeTotal from pre-joined data', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: 10, StrokeTotal: 9, HolesPlayed: 2 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].StrokeTotal).toBe(9);
    });

    it('returns null StrokeTotal when user player has no hole scores', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: 10, StrokeTotal: null, HolesPlayed: 0 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].StrokeTotal).toBeNull();
    });

    it('returns null StrokeTotal when no user player exists for the round', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: null, StrokeTotal: null, HolesPlayed: 0 },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].StrokeTotal).toBeNull();
    });

    it('uses HolesPlayed of 0 when no scores exist', () => {
        mockGetAllRoundsWithPlayersAndScores.mockReturnValue([
            { Id: 1, TotalScore: 0, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: null, Created_At: '2025-06-15T10:00:00.000Z', CourseName: null, UserPlayerId: null, StrokeTotal: null, HolesPlayed: null },
        ]);

        const result = getAllRoundHistoryService();

        expect(result[0].HolesPlayed).toBe(0);
    });
});

describe('addRoundPlayersService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates user player and additional players', async () => {
        mockInsertRoundPlayer.mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockResolvedValueOnce(3);

        const result = await addRoundPlayersService(42, ['Alice', 'Bob']);

        expect(mockInsertRoundPlayer).toHaveBeenCalledTimes(3);
        expect(mockInsertRoundPlayer).toHaveBeenCalledWith(42, 'You', 1, 0);
        expect(mockInsertRoundPlayer).toHaveBeenCalledWith(42, 'Alice', 0, 1);
        expect(mockInsertRoundPlayer).toHaveBeenCalledWith(42, 'Bob', 0, 2);
        expect(result).toEqual([1, 2, 3]);
    });

    it('creates only user player when no additional names', async () => {
        mockInsertRoundPlayer.mockResolvedValueOnce(1);

        const result = await addRoundPlayersService(42, []);

        expect(mockInsertRoundPlayer).toHaveBeenCalledTimes(1);
        expect(mockInsertRoundPlayer).toHaveBeenCalledWith(42, 'You', 1, 0);
        expect(result).toEqual([1]);
    });

    it('returns empty array when user player insert fails', async () => {
        mockInsertRoundPlayer.mockResolvedValue(null);

        const result = await addRoundPlayersService(42, ['Alice']);

        expect(result).toEqual([]);
    });

    it('skipsAdditionalPlayerWhenTheirInsertReturnsNull', async () => {
        mockInsertRoundPlayer
            .mockResolvedValueOnce(1)    // user player succeeds
            .mockResolvedValueOnce(null) // Alice fails
            .mockResolvedValueOnce(3);   // Bob succeeds

        const result = await addRoundPlayersService(42, ['Alice', 'Bob']);

        expect(result).toEqual([1, 3]);
    });
});

describe('addMultiplayerHoleScoresService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('inserts scores for all players on a hole', async () => {
        mockInsertRoundHoleScore.mockResolvedValue(true);

        const scores = [
            { playerId: 1, playerName: 'You', score: 4 },
            { playerId: 2, playerName: 'Alice', score: 5 },
        ];

        const result = await addMultiplayerHoleScoresService(42, 1, 4, scores);

        expect(mockInsertRoundHoleScore).toHaveBeenCalledTimes(2);
        expect(mockInsertRoundHoleScore).toHaveBeenCalledWith(42, 1, 1, 4, 4);
        expect(mockInsertRoundHoleScore).toHaveBeenCalledWith(42, 2, 1, 4, 5);
        expect(result).toBe(true);
    });

    it('returns false when any insert fails', async () => {
        mockInsertRoundHoleScore.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

        const scores = [
            { playerId: 1, playerName: 'You', score: 4 },
            { playerId: 2, playerName: 'Alice', score: 5 },
        ];

        const result = await addMultiplayerHoleScoresService(42, 1, 4, scores);

        expect(result).toBe(false);
    });

    it('handles single player score', async () => {
        mockInsertRoundHoleScore.mockResolvedValue(true);
        mockDeleteRoundHoleScoresByHole.mockResolvedValue(true);

        const scores = [{ playerId: 1, playerName: 'You', score: 3 }];

        const result = await addMultiplayerHoleScoresService(42, 5, 3, scores);

        expect(mockInsertRoundHoleScore).toHaveBeenCalledWith(42, 1, 5, 3, 3);
        expect(result).toBe(true);
    });

    it('deletes existing hole scores before inserting to prevent duplicates', async () => {
        mockDeleteRoundHoleScoresByHole.mockResolvedValue(true);
        mockInsertRoundHoleScore.mockResolvedValue(true);

        const scores = [{ playerId: 1, playerName: 'You', score: 4 }];

        await addMultiplayerHoleScoresService(42, 3, 4, scores);

        expect(mockDeleteRoundHoleScoresByHole).toHaveBeenCalledWith(42, 3);
        expect(mockInsertRoundHoleScore).toHaveBeenCalledWith(42, 1, 3, 4, 4);
    });
});

describe('getRoundPlayersService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns players for a round', () => {
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 42, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            { Id: 2, RoundId: 42, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
        ]);

        const result = getRoundPlayersService(42);

        expect(result).toHaveLength(2);
        expect(result[0].PlayerName).toBe('You');
        expect(result[0].IsUser).toBe(1);
        expect(result[1].PlayerName).toBe('Alice');
    });

    it('returns empty array when no players', () => {
        mockGetRoundPlayers.mockReturnValue([]);

        const result = getRoundPlayersService(42);

        expect(result).toEqual([]);
    });
});

describe('getMultiplayerScorecardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns multiplayer scorecard with round, players and scores', () => {
        mockGetRoundById.mockReturnValue({
            Id: 1, TotalScore: 3, IsCompleted: 1,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z',
            Created_At: '2025-06-15T10:00:00.000Z',
        });
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 4 },
            { Id: 2, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 5 },
        ]);

        const result = getMultiplayerScorecardService(1);

        expect(result).not.toBeNull();
        expect(result!.round.Id).toBe(1);
        expect(result!.players).toHaveLength(2);
        expect(result!.holeScores).toHaveLength(2);
    });

    it('returns null when round not found', () => {
        mockGetRoundById.mockReturnValue(null);

        const result = getMultiplayerScorecardService(999);

        expect(result).toBeNull();
    });

    it('returns null when no players exist for round', () => {
        mockGetRoundById.mockReturnValue({
            Id: 1, TotalScore: 3, IsCompleted: 1,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z',
            Created_At: '2025-06-15T10:00:00.000Z',
        });
        mockGetRoundPlayers.mockReturnValue([]);

        const result = getMultiplayerScorecardService(1);

        expect(result).toBeNull();
    });

    it('formats Created_At as DD/MM', () => {
        mockGetRoundById.mockReturnValue({
            Id: 1, TotalScore: 3, IsCompleted: 1,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: '',
            Created_At: '2025-06-15T10:00:00.000Z',
        });
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([]);

        const result = getMultiplayerScorecardService(1);

        expect(result!.round.Created_At).toBe('15/06');
    });
});

describe('endRoundService multiplayer path', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses multiplayer scores when players exist', async () => {
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
            { Id: 2, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
            { Id: 2, RoundId: 1, RoundPlayerId: 2, HoleNumber: 1, HolePar: 4, Score: 3 },
            { Id: 3, RoundId: 1, RoundPlayerId: 1, HoleNumber: 2, HolePar: 3, Score: 4 },
            { Id: 4, RoundId: 1, RoundPlayerId: 2, HoleNumber: 2, HolePar: 3, Score: 3 },
        ]);
        mockUpdateRound.mockResolvedValue(true);

        const result = await endRoundService(1);

        // User scores: (5-4) + (4-3) = 2
        expect(mockUpdateRound).toHaveBeenCalledWith(1, 2);
        expect(result).toBe(true);
    });

    it('calculates negative total for under par multiplayer round', async () => {
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'You', IsUser: 1, SortOrder: 0 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 3 },
            { Id: 2, RoundId: 1, RoundPlayerId: 1, HoleNumber: 2, HolePar: 4, Score: 3 },
        ]);
        mockUpdateRound.mockResolvedValue(true);

        await endRoundService(1);

        // User scores: (3-4) + (3-4) = -2
        expect(mockUpdateRound).toHaveBeenCalledWith(1, -2);
    });

    it('updates round with score 0 when no players exist', async () => {
        mockGetRoundPlayers.mockReturnValue([]);
        mockUpdateRound.mockResolvedValue(true);

        await endRoundService(1);

        expect(mockUpdateRound).toHaveBeenCalledWith(1, 0);
    });

    it('usesTotalScoreOfZeroWhenNoUserPlayerFound', async () => {
        mockGetRoundPlayers.mockReturnValue([
            { Id: 1, RoundId: 1, PlayerName: 'Alice', IsUser: 0, SortOrder: 1 },
            { Id: 2, RoundId: 1, PlayerName: 'Bob', IsUser: 0, SortOrder: 2 },
        ]);
        mockGetRoundHoleScores.mockReturnValue([
            { Id: 1, RoundId: 1, RoundPlayerId: 1, HoleNumber: 1, HolePar: 4, Score: 5 },
        ]);
        mockUpdateRound.mockResolvedValue(true);

        await endRoundService(1);

        expect(mockUpdateRound).toHaveBeenCalledWith(1, 0);
    });
});

describe('getRecentCourseNamesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns distinct course names', () => {
        mockGetDistinctCourseNames.mockReturnValue([
            { CourseName: 'St Andrews' },
            { CourseName: 'Pebble Beach' },
        ]);

        const result = getRecentCourseNamesService();

        expect(result).toEqual(['St Andrews', 'Pebble Beach']);
    });

    it('returns empty array when no course names exist', () => {
        mockGetDistinctCourseNames.mockReturnValue([]);

        const result = getRecentCourseNamesService();

        expect(result).toEqual([]);
    });
});

describe('getRecentPlayerNamesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns distinct player names', () => {
        mockGetDistinctPlayerNames.mockReturnValue([
            { PlayerName: 'Alice' },
            { PlayerName: 'Bob' },
        ]);

        const result = getRecentPlayerNamesService();

        expect(result).toEqual(['Alice', 'Bob']);
    });

    it('returns empty array when no player names exist', () => {
        mockGetDistinctPlayerNames.mockReturnValue([]);

        const result = getRecentPlayerNamesService();

        expect(result).toEqual([]);
    });
});

describe('getHolesPlayedForRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns the holes played count for a round', () => {
        mockGetHolesPlayedForRound.mockReturnValue(5);

        const result = getHolesPlayedForRoundService(42);

        expect(mockGetHolesPlayedForRound).toHaveBeenCalledWith(42);
        expect(result).toBe(5);
    });

    it('returns 0 when no holes have been played', () => {
        mockGetHolesPlayedForRound.mockReturnValue(0);

        const result = getHolesPlayedForRoundService(1);

        expect(result).toBe(0);
    });
});
