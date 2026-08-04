import { getPuttingProximityService, bucketProximityDistance, PROXIMITY_DISTANCE_BUCKETS } from '../../service/DbService';
import { getAllPuttingStatsWithThreePutts } from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllPuttingStatsWithThreePutts: jest.fn(),
}));

const mockGetAllPuttingStatsWithThreePutts = getAllPuttingStatsWithThreePutts as jest.Mock;

describe('bucketProximityDistance', () => {
    it('returns null when distance is less than 1', () => {
        expect(bucketProximityDistance(0)).toBeNull();
    });

    it('buckets distances 1-10 into their own single-foot buckets', () => {
        expect(bucketProximityDistance(1)).toBe(1);
        expect(bucketProximityDistance(5)).toBe(5);
        expect(bucketProximityDistance(10)).toBe(10);
    });

    it('uses ceiling-based bucketing: smallest bucket >= distance', () => {
        expect(bucketProximityDistance(11)).toBe(15);
        expect(bucketProximityDistance(14)).toBe(15);
        expect(bucketProximityDistance(15)).toBe(15);
        expect(bucketProximityDistance(16)).toBe(20);
        expect(bucketProximityDistance(20)).toBe(20);
        expect(bucketProximityDistance(21)).toBe(25);
    });

    it('caps distances > 50 into the 50 bucket (open-ended)', () => {
        expect(bucketProximityDistance(51)).toBe(50);
        expect(bucketProximityDistance(100)).toBe(50);
        expect(bucketProximityDistance(300)).toBe(50);
    });
});

describe('getPuttingProximityService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns all distance buckets with "-" when no data exists', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getPuttingProximityService();

        expect(result).toHaveLength(PROXIMITY_DISTANCE_BUCKETS.length);
        result.forEach((row) => {
            expect(row.shortPercent).toBe('-');
            expect(row.longPercent).toBe('-');
        });
    });

    it('only counts rows with SecondPuttDistance > 0 (first-putt misses)', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingProximityService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.shortPercent).toBe('100%');
        expect(bucket5!.longPercent).toBe('0%');
    });

    it('counts short vs long based on SecondPuttIsLong flag', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 10, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 3, SecondPuttIsLong: 1, ThreePutts: 0 },
        ]);

        const result = getPuttingProximityService();
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket10!.shortPercent).toBe('50%');
        expect(bucket10!.longPercent).toBe('50%');
    });

    it('uses ceiling-based bucketing to group distances', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 11, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 13, SecondPuttDistance: 2, SecondPuttIsLong: 1, ThreePutts: 0 },
            { FirstPuttDistance: 14, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingProximityService();
        const bucket15 = result.find(r => r.distance === 15);

        expect(bucket15!.shortPercent).toBe('67%');
        expect(bucket15!.longPercent).toBe('33%');
    });

    it('rounds percentages correctly', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 1, ThreePutts: 0 },
        ]);

        const result = getPuttingProximityService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.shortPercent).toBe('67%');
        expect(bucket5!.longPercent).toBe('33%');
    });

    it('handles multiple buckets with different proportions', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 3, SecondPuttIsLong: 1, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 3, SecondPuttIsLong: 1, ThreePutts: 0 },
        ]);

        const result = getPuttingProximityService();
        const bucket5 = result.find(r => r.distance === 5);
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket5!.shortPercent).toBe('100%');
        expect(bucket5!.longPercent).toBe('0%');
        expect(bucket10!.shortPercent).toBe('0%');
        expect(bucket10!.longPercent).toBe('100%');
    });

    it('returns all buckets in order', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getPuttingProximityService();

        expect(result.map(r => r.distance)).toEqual(PROXIMITY_DISTANCE_BUCKETS);
    });

    it('ignores ThreePutts flag (only processes first-putt misses)', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 1 },
        ]);

        const result = getPuttingProximityService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.shortPercent).toBe('100%');
    });

    it('filters to only 3-putts when threePuttOnly is true', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 1 },
        ]);

        const result = getPuttingProximityService(true);
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.shortPercent).toBe('100%');
        expect(bucket5!.longPercent).toBe('0%');
    });

    it('shows only 3-putt rows with threePuttOnly=true, excluding non-3-putt rows from same bucket', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 10, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 3, SecondPuttIsLong: 1, ThreePutts: 1 },
        ]);

        const result = getPuttingProximityService(true);
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket10!.shortPercent).toBe('0%');
        expect(bucket10!.longPercent).toBe('100%');
    });

    it('returns "-" for buckets with no 3-putt rows when threePuttOnly=true', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingProximityService(true);
        const bucket5 = result.find(r => r.distance === 5);
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket5!.shortPercent).toBe('-');
        expect(bucket5!.longPercent).toBe('-');
        expect(bucket10!.shortPercent).toBe('-');
        expect(bucket10!.longPercent).toBe('-');
    });

    it('default parameter (no args) behaves as threePuttOnly=false', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThreePutts: 1 },
        ]);

        const result = getPuttingProximityService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.shortPercent).toBe('100%');
    });
});
