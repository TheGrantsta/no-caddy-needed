import { getUpAndDownRateService } from '../../service/DbService';
import { getAllPuttingStatsWithThreePutts } from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllPuttingStatsWithThreePutts: jest.fn(),
}));

const mockGetAllPuttingStatsWithThreePutts = getAllPuttingStatsWithThreePutts as jest.Mock;

const row = (overrides: Partial<{ RoundId: number; FirstPuttDistance: number; SecondPuttDistance: number; GreenInRegulation: number; ThreePutts: number }> = {}) => ({
    RoundId: 1,
    FirstPuttDistance: 10,
    SecondPuttDistance: 0,
    SecondPuttIsLong: 0,
    GreenInRegulation: 0,
    ThreePutts: 0,
    ...overrides,
});

describe('getUpAndDownRateService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shouldReturnDashWhenNoPuttingStatsExist', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        expect(getUpAndDownRateService()).toEqual({ rate: '-', upAndDowns: 0, attempts: 0 });
    });

    it('shouldReturnDashWhenEveryHoleWasHitInRegulation', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ GreenInRegulation: 1 }),
            row({ GreenInRegulation: 1, SecondPuttDistance: 2 }),
        ]);

        expect(getUpAndDownRateService()).toEqual({ rate: '-', upAndDowns: 0, attempts: 0 });
    });

    it('shouldCountMissedGreenOnePuttAsUpAndDown', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ GreenInRegulation: 0, SecondPuttDistance: 0 }),
        ]);

        expect(getUpAndDownRateService()).toEqual({ rate: '100%', upAndDowns: 1, attempts: 1 });
    });

    it('shouldNotCountMissedGreenTwoPuttAsUpAndDown', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ GreenInRegulation: 0, SecondPuttDistance: 3 }),
        ]);

        expect(getUpAndDownRateService()).toEqual({ rate: '0%', upAndDowns: 0, attempts: 1 });
    });

    it('shouldIgnoreGreensHitInRegulationWhenCountingOnePutts', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ GreenInRegulation: 1, SecondPuttDistance: 0 }),
            row({ GreenInRegulation: 0, SecondPuttDistance: 0 }),
        ]);

        expect(getUpAndDownRateService()).toEqual({ rate: '100%', upAndDowns: 1, attempts: 1 });
    });

    it('shouldRoundRateToNearestWholePercent', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ SecondPuttDistance: 0 }),
            row({ SecondPuttDistance: 2 }),
            row({ SecondPuttDistance: 2 }),
        ]);

        expect(getUpAndDownRateService()).toEqual({ rate: '33%', upAndDowns: 1, attempts: 3 });
    });

    it('shouldLimitCalculationToSelectedRoundsWhenFilterProvided', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ RoundId: 1, SecondPuttDistance: 0 }),
            row({ RoundId: 2, SecondPuttDistance: 2 }),
        ]);

        expect(getUpAndDownRateService(new Set([2]))).toEqual({ rate: '0%', upAndDowns: 0, attempts: 1 });
    });

    it('shouldExcludeHolesFromUnselectedRounds', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            row({ RoundId: 1, SecondPuttDistance: 0 }),
            row({ RoundId: 2, SecondPuttDistance: 0 }),
        ]);

        expect(getUpAndDownRateService(new Set([1]))).toEqual({ rate: '100%', upAndDowns: 1, attempts: 1 });
    });
});
