import {
    startRoundService,
    endRoundService,
    addHoleScoreService,
    getRoundScorecardService,
    getActiveRoundService,
    getAllRoundHistoryService,
} from '../../service/DbService';
import {
    insertRound,
    updateRound,
    insertRoundHole,
    getRoundById,
    getRoundHoles,
    getActiveRound,
    getAllRounds,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    insertRound: jest.fn(),
    updateRound: jest.fn(),
    insertRoundHole: jest.fn(),
    getRoundById: jest.fn(),
    getRoundHoles: jest.fn(),
    getActiveRound: jest.fn(),
    getAllRounds: jest.fn(),
}));

const mockInsertRound = insertRound as jest.Mock;
const mockUpdateRound = updateRound as jest.Mock;
const mockInsertRoundHole = insertRoundHole as jest.Mock;
const mockGetRoundById = getRoundById as jest.Mock;
const mockGetRoundHoles = getRoundHoles as jest.Mock;
const mockGetActiveRound = getActiveRound as jest.Mock;
const mockGetAllRounds = getAllRounds as jest.Mock;

describe('startRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a new round and returns the round ID', async () => {
        mockInsertRound.mockResolvedValue(42);

        const result = await startRoundService(72);

        expect(mockInsertRound).toHaveBeenCalledWith(72);
        expect(result).toBe(42);
    });

    it('returns null when insert fails', async () => {
        mockInsertRound.mockResolvedValue(null);

        const result = await startRoundService(72);

        expect(result).toBeNull();
    });
});

describe('endRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calculates total score from holes and updates round', async () => {
        mockGetRoundHoles.mockReturnValue([
            { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 1 },
            { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: -1 },
            { Id: 3, RoundId: 1, HoleNumber: 3, ScoreRelativeToPar: 0 },
        ]);
        mockUpdateRound.mockResolvedValue(true);

        const result = await endRoundService(1);

        expect(mockGetRoundHoles).toHaveBeenCalledWith(1);
        expect(mockUpdateRound).toHaveBeenCalledWith(1, 0);
        expect(result).toBe(true);
    });

    it('handles round with all above par holes', async () => {
        mockGetRoundHoles.mockReturnValue([
            { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 2 },
            { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: 1 },
        ]);
        mockUpdateRound.mockResolvedValue(true);

        await endRoundService(1);

        expect(mockUpdateRound).toHaveBeenCalledWith(1, 3);
    });

    it('returns false when update fails', async () => {
        mockGetRoundHoles.mockReturnValue([]);
        mockUpdateRound.mockResolvedValue(false);

        const result = await endRoundService(1);

        expect(result).toBe(false);
    });
});

describe('addHoleScoreService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('inserts a hole score for the round', async () => {
        mockInsertRoundHole.mockResolvedValue(true);

        const result = await addHoleScoreService(1, 5, 1);

        expect(mockInsertRoundHole).toHaveBeenCalledWith(1, 5, 1);
        expect(result).toBe(true);
    });

    it('handles even par score', async () => {
        mockInsertRoundHole.mockResolvedValue(true);

        const result = await addHoleScoreService(1, 1, 0);

        expect(mockInsertRoundHole).toHaveBeenCalledWith(1, 1, 0);
        expect(result).toBe(true);
    });

    it('handles under par score', async () => {
        mockInsertRoundHole.mockResolvedValue(true);

        const result = await addHoleScoreService(1, 3, -1);

        expect(mockInsertRoundHole).toHaveBeenCalledWith(1, 3, -1);
        expect(result).toBe(true);
    });

    it('returns false when insert fails', async () => {
        mockInsertRoundHole.mockResolvedValue(false);

        const result = await addHoleScoreService(1, 1, 0);

        expect(result).toBe(false);
    });
});

describe('getRoundScorecardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns round with holes', () => {
        mockGetRoundById.mockReturnValue({
            Id: 1, CoursePar: 72, TotalScore: 3, IsCompleted: 1,
            StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z',
            Created_At: '2025-06-15T10:00:00.000Z',
        });
        mockGetRoundHoles.mockReturnValue([
            { Id: 1, RoundId: 1, HoleNumber: 1, ScoreRelativeToPar: 1 },
            { Id: 2, RoundId: 1, HoleNumber: 2, ScoreRelativeToPar: 0 },
            { Id: 3, RoundId: 1, HoleNumber: 3, ScoreRelativeToPar: 2 },
        ]);

        const result = getRoundScorecardService(1);

        expect(result).not.toBeNull();
        expect(result!.round.Id).toBe(1);
        expect(result!.round.TotalScore).toBe(3);
        expect(result!.holes).toHaveLength(3);
    });

    it('returns null when round not found', () => {
        mockGetRoundById.mockReturnValue(null);

        const result = getRoundScorecardService(999);

        expect(result).toBeNull();
    });
});

describe('getActiveRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns active round when one exists', () => {
        mockGetActiveRound.mockReturnValue({
            Id: 5, CoursePar: 72, TotalScore: 0, IsCompleted: 0,
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
        mockGetAllRounds.mockReturnValue([]);

        const result = getAllRoundHistoryService();

        expect(result).toEqual([]);
    });

    it('returns formatted rounds with dd/mm dates', () => {
        mockGetAllRounds.mockReturnValue([
            { Id: 1, CoursePar: 72, TotalScore: 3, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z' },
        ]);

        const result = getAllRoundHistoryService();

        expect(result).toHaveLength(1);
        expect(result[0].Created_At).toBe('15/06');
        expect(result[0].TotalScore).toBe(3);
    });

    it('returns multiple rounds sorted by most recent', () => {
        mockGetAllRounds.mockReturnValue([
            { Id: 2, CoursePar: 72, TotalScore: -1, IsCompleted: 1, StartTime: '2025-07-01T10:00:00.000Z', EndTime: '2025-07-01T14:00:00.000Z', Created_At: '2025-07-01T10:00:00.000Z' },
            { Id: 1, CoursePar: 72, TotalScore: 5, IsCompleted: 1, StartTime: '2025-06-15T10:00:00.000Z', EndTime: '2025-06-15T14:00:00.000Z', Created_At: '2025-06-15T10:00:00.000Z' },
        ]);

        const result = getAllRoundHistoryService();

        expect(result).toHaveLength(2);
        expect(result[0].Id).toBe(2);
        expect(result[1].Id).toBe(1);
    });
});
