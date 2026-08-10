import {
    getRoundScoreBreakdownService,
    getHolesPlayedForRoundService,
    getDeadlySinsForRoundService,
} from '../../service/DbService';
import {
    getRoundById,
    getDeadlySinsForRound,
} from '../../database/db';

jest.mock('../../database/db', () => ({
    getSyncDb: jest.fn(),
    getRoundById: jest.fn(),
    getDeadlySinsForRound: jest.fn(),
    getAllDeadlySinsRoundTotals: jest.fn(),
    getHolesPlayedForRound: jest.fn(),
    getAllPuttingStatsWithThreePutts: jest.fn(),
}));

const mockGetRoundById = getRoundById as jest.Mock;
const mockGetDeadlySinsForRound = getDeadlySinsForRound as jest.Mock;
const mockGetHolesPlayedForRound = require('../../database/db').getHolesPlayedForRound as jest.Mock;
const mockGetAllPuttingStatsWithThreePutts = require('../../database/db').getAllPuttingStatsWithThreePutts as jest.Mock;

describe('getRoundScoreBreakdownService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('counts putts from actual putting stats when sins exist', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 2,
            Penalties: 1,
        });
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 10, SecondPuttDistance: 3, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 8, SecondPuttDistance: 0, ThreePutts: 0 },
        ]);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(4);
        expect(result.threePutts).toBe(2);
        expect(result.penalties).toBe(1);
    });

    it('returns putts and penalties as 0 when no putting stats exist', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue(null);
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(0);
        expect(result.threePutts).toBe(0);
        expect(result.penalties).toBe(0);
    });

    it('returns 0 putts when no holes played', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue(null);
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(0);
        expect(result.threePutts).toBe(0);
        expect(result.penalties).toBe(0);
    });

    it('handles zero three-putts', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 0,
            Penalties: 2,
        });
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 10, SecondPuttDistance: 2, ThreePutts: 0 },
        ]);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(3);
        expect(result.threePutts).toBe(0);
        expect(result.penalties).toBe(2);
    });

    it('handles zero penalties', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 3,
            Penalties: 0,
        });
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 10, SecondPuttDistance: 4, ThreePutts: 1 },
        ]);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(3);
        expect(result.threePutts).toBe(3);
        expect(result.penalties).toBe(0);
    });

    it('counts putts correctly for partial 9-hole round', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 1,
            Penalties: 1,
        });
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 3, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 4, SecondPuttDistance: 2, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 8, SecondPuttDistance: 3, ThreePutts: 1 },
        ]);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(6);
        expect(result.threePutts).toBe(1);
        expect(result.penalties).toBe(1);
    });
});
