import { getPuttingMakeRatesService, bucketPuttingDistance, PUTTING_DISTANCE_BUCKETS, formatPuttCount } from '../../service/DbService';
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
            expect(row.makeRate).toBe('-');
            expect(row.putts).toBe(0);
        });
    });

    it('counts first-putt attempts made when secondPuttDistance === 0', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 1, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5).toBeDefined();
        expect(bucket5!.makeRate).toBe('67%');
        expect(bucket5!.putts).toBe(3);
    });

    it('counts first-putt attempts missed when secondPuttDistance > 0', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 10, SecondPuttDistance: 2, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 1, ThreePutts: 0 },
            { FirstPuttDistance: 10, SecondPuttDistance: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket10).toBeDefined();
        expect(bucket10!.makeRate).toBe('33%');
        expect(bucket10!.putts).toBe(3);
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
        expect(bucket5!.makeRate).toBe('100%');
        expect(bucket5!.putts).toBe(1);
    });

    it('counts second-putt attempts made when ThreePutts !== 1', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, ThreePutts: 0 },
            { FirstPuttDistance: 5, SecondPuttDistance: 3, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket2 = result.find(r => r.distance === 2);
        const bucket3 = result.find(r => r.distance === 3);

        expect(bucket2!.makeRate).toBe('100%');
        expect(bucket2!.putts).toBe(1);
        expect(bucket3!.makeRate).toBe('100%');
        expect(bucket3!.putts).toBe(1);
    });

    it('counts second-putt attempts missed when ThreePutts === 1', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 2, ThreePutts: 1 },
            { FirstPuttDistance: 5, SecondPuttDistance: 2, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket2 = result.find(r => r.distance === 2);

        expect(bucket2!.makeRate).toBe('50%');
        expect(bucket2!.putts).toBe(2);
    });

    it('combines first-putt and second-putt attempts from the same distance bucket', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 5, SecondPuttDistance: 0, ThreePutts: 0 },
            { FirstPuttDistance: 7, SecondPuttDistance: 5, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.makeRate).toBe('100%');
        expect(bucket5!.putts).toBe(2);
    });

    it('includes a made second putt from a distance with no first-putt attempts', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { FirstPuttDistance: 20, SecondPuttDistance: 4, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket4 = result.find(r => r.distance === 4);

        expect(bucket4!.makeRate).toBe('100%');
        expect(bucket4!.putts).toBe(1);
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

        expect(bucket20!.makeRate).toBe('100%');
        expect(bucket25!.makeRate).toBe('100%');
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

        expect(bucket3!.makeRate).toBe('75%');
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

        expect(bucket5!.makeRate).toBe('100%');
        expect(bucket5!.putts).toBe(2);
        expect(bucket10!.makeRate).toBe('50%');
        expect(bucket10!.putts).toBe(2);
    });

    it('returns all 26 buckets in order', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([]);

        const result = getPuttingMakeRatesService();

        expect(result.map(r => r.distance)).toEqual(PUTTING_DISTANCE_BUCKETS);
    });

    it('filters by roundIds when provided', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThreePutts: 0 },
            { RoundId: 2, FirstPuttDistance: 5, SecondPuttDistance: 1, SecondPuttIsLong: 0, ThreePutts: 0 },
            { RoundId: 2, FirstPuttDistance: 5, SecondPuttDistance: 1, SecondPuttIsLong: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService(new Set([1]));
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.makeRate).toBe('100%');
        expect(bucket5!.putts).toBe(2);
    });

    it('aggregates all rows when roundIds is not provided', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThreePutts: 0 },
            { RoundId: 1, FirstPuttDistance: 5, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThreePutts: 0 },
            { RoundId: 2, FirstPuttDistance: 5, SecondPuttDistance: 1, SecondPuttIsLong: 0, ThreePutts: 0 },
            { RoundId: 2, FirstPuttDistance: 5, SecondPuttDistance: 1, SecondPuttIsLong: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService();
        const bucket5 = result.find(r => r.distance === 5);

        expect(bucket5!.makeRate).toBe('50%');
    });

    it('reproduces user scenario: 2-putt hole filtered to single round', () => {
        mockGetAllPuttingStatsWithThreePutts.mockReturnValue([
            { RoundId: 42, FirstPuttDistance: 20, SecondPuttDistance: 4, SecondPuttIsLong: 0, ThreePutts: 0 },
        ]);

        const result = getPuttingMakeRatesService(new Set([42]));
        const bucket4 = result.find(r => r.distance === 4);
        const bucket20 = result.find(r => r.distance === 20);
        const bucket10 = result.find(r => r.distance === 10);

        expect(bucket4!.makeRate).toBe('100%');
        expect(bucket4!.putts).toBe(1);
        expect(bucket20!.makeRate).toBe('0%');
        expect(bucket20!.putts).toBe(1);
        expect(bucket10!.makeRate).toBe('-');
        expect(bucket10!.putts).toBe(0);
    });
});

describe('formatPuttCount', () => {
    it('returns the count as a string when 0', () => {
        expect(formatPuttCount(0)).toBe('0');
    });

    it('returns the count as a string when 1', () => {
        expect(formatPuttCount(1)).toBe('1');
    });

    it('returns the count as a string when 99', () => {
        expect(formatPuttCount(99)).toBe('99');
    });

    it('returns "99+" when count is 100', () => {
        expect(formatPuttCount(100)).toBe('99+');
    });

    it('returns "99+" when count is greater than 100', () => {
        expect(formatPuttCount(250)).toBe('99+');
    });
});
