import { getPuttingMakeRatesService, bucketPuttingDistance, PUTTING_DISTANCE_BUCKETS } from '../../service/DbService';
import { getAllPuttingStatsWithThreePutts } from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllPuttingStatsWithThreePutts: jest.fn(),
}));

const mockGetAllPuttingStatsWithThreePutts = getAllPuttingStatsWithThreePutts as jest.Mock;

describe('bucketPuttingDistance', () => {
    it('returns null when distance is less than 1', () => {
        expect(bucketPuttingDistance(0)).toBeNull();
    });

    it('buckets distances 1-20 into their own single-foot buckets', () => {
        expect(bucketPuttingDistance(1)).toBe(1);
        expect(bucketPuttingDistance(10)).toBe(10);
        expect(bucketPuttingDistance(20)).toBe(20);
    });

    it('buckets distances into the largest bucket less than or equal to itself', () => {
        expect(bucketPuttingDistance(21)).toBe(20);
        expect(bucketPuttingDistance(24)).toBe(20);
        expect(bucketPuttingDistance(25)).toBe(25);
        expect(bucketPuttingDistance(26)).toBe(25);
    });

    it('buckets distances 25-50 correctly', () => {
        expect(bucketPuttingDistance(25)).toBe(25);
        expect(bucketPuttingDistance(30)).toBe(30);
        expect(bucketPuttingDistance(35)).toBe(35);
        expect(bucketPuttingDistance(40)).toBe(40);
        expect(bucketPuttingDistance(45)).toBe(45);
        expect(bucketPuttingDistance(50)).toBe(50);
    });

    it('buckets distances > 50 into the 50 bucket (open-ended)', () => {
        expect(bucketPuttingDistance(51)).toBe(50);
        expect(bucketPuttingDistance(100)).toBe(50);
        expect(bucketPuttingDistance(300)).toBe(50);
    });
});

describe('getPuttingMakeRatesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns all distance buckets with "-" when no data exists', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getPuttingMakeRatesService();

        expect(result).toHaveLength(PUTTING_DISTANCE_BUCKETS.length);
        result.forEach((row) => {
            expect(row.firstPuttMakeRate).toBe('-');
            expect(row.secondPuttMakeRate).toBe('-');
        });
    });

    it('calculates first-putt make rate: holed on first (secondPuttDistance === 0) counts as made', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 1, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5).toBeDefined();
        expect(bucket5!.firstPuttMakeRate).toBe('67%');
    });

    it('calculates first-putt miss rate: any secondPuttDistance > 0 counts as missed', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 10, SecondPuttDistance: 2, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 1, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket10).toBeDefined();
        expect(bucket10!.firstPuttMakeRate).toBe('33%');
    });

    it('only counts second putts when secondPuttDistance > 0', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 15, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 15, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 15, SecondPuttDistance: 5, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5).toBeDefined();
        expect(bucket5!.secondPuttMakeRate).toBe('100%');
    });

    it('counts second putt as made when ThreePutts !== 1', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 3, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket2 = result.find(r => r.distance === 2);
        const bucket3 = result.find(r => r.distance === 3);

        expect(bucket2!.secondPuttMakeRate).toBe('100%');
        expect(bucket3!.secondPuttMakeRate).toBe('100%');
    });

    it('counts second putt as missed when ThreePutts === 1', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, ThreePutts: 1 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket2 = result.find(r => r.distance === 2);

        expect(bucket2!.secondPuttMakeRate).toBe('50%');
    });

    it('buckets distances correctly', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 21, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 24, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 25, SecondPuttDistance: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket20 = result.find(r => r.distance === 20);
        const bucket25 = result.find(r => r.distance === 25);

        expect(bucket20!.firstPuttMakeRate).toBe('100%');
        expect(bucket25!.firstPuttMakeRate).toBe('100%');
    });

    it('rounds percentages correctly', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 3, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 3, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 3, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 3, SecondPuttDistance: 1, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket3 = result.find(r => r.distance === 3);

        expect(bucket3!.firstPuttMakeRate).toBe('75%');
    });

    it('handles multiple buckets with different make rates', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 1, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket5!.firstPuttMakeRate).toBe('100%');
        expect(bucket10!.firstPuttMakeRate).toBe('50%');
    });

    it('handles empty second-putt buckets', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.firstPuttMakeRate).toBe('100%');
        expect(bucket5!.secondPuttMakeRate).toBe('-');
    });

    it('returns all 26 buckets in order', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getPuttingMakeRatesService();

        expect(result.map(r => r.distance)).toEqual(PUTTING_DISTANCE_BUCKETS);
    });
});
