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
}));

const mockGetRoundById = getRoundById as jest.Mock;
const mockGetDeadlySinsForRound = getDeadlySinsForRound as jest.Mock;
const mockGetHolesPlayedForRound = require('../../database/db').getHolesPlayedForRound as jest.Mock;

describe('getRoundScoreBreakdownService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns putts as 2 * holesPlayed + threePutts when sins exist', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 2,
            Penalties: 1,
        });
        mockGetHolesPlayedForRound.mockReturnValue(18);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(18 * 2 + 2);
        expect(result.threePutts).toBe(2);
        expect(result.penalties).toBe(1);
    });

    it('returns putts as 2 * holesPlayed and penalties as 0 when sins is null', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue(null);
        mockGetHolesPlayedForRound.mockReturnValue(9);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(9 * 2);
        expect(result.threePutts).toBe(0);
        expect(result.penalties).toBe(0);
    });

    it('returns 0 putts when no holes played', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue(null);
        mockGetHolesPlayedForRound.mockReturnValue(0);

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
        mockGetHolesPlayedForRound.mockReturnValue(18);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(18 * 2);
        expect(result.threePutts).toBe(0);
        expect(result.penalties).toBe(2);
    });

    it('handles zero penalties', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 3,
            Penalties: 0,
        });
        mockGetHolesPlayedForRound.mockReturnValue(18);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(18 * 2 + 3);
        expect(result.threePutts).toBe(3);
        expect(result.penalties).toBe(0);
    });

    it('computes partial 9-hole round', () => {
        mockGetRoundById.mockReturnValue({ Created_At: '01/06' });
        mockGetDeadlySinsForRound.mockReturnValue({
            ThreePutts: 1,
            Penalties: 1,
        });
        mockGetHolesPlayedForRound.mockReturnValue(9);

        const result = getRoundScoreBreakdownService(1);

        expect(result.putts).toBe(9 * 2 + 1);
        expect(result.threePutts).toBe(1);
        expect(result.penalties).toBe(1);
    });
});
