import { getAllRoundHoleScoresDetailService, getAllHoleDeadlySinsDetailService, getAllPuttingStatsDetailService } from '../../service/DbService';
import * as db from '../../database/db';

jest.mock('../../database/db', () => ({
    getAllRoundHoleScoresWithContext: jest.fn(),
    getAllHoleDeadlySinsWithContext: jest.fn(),
    getAllPuttingStatsWithContext: jest.fn(),
}));

const mockGetAllRoundHoleScoresWithContext = db.getAllRoundHoleScoresWithContext as jest.Mock;
const mockGetAllHoleDeadlySinsWithContext = db.getAllHoleDeadlySinsWithContext as jest.Mock;
const mockGetAllPuttingStatsWithContext = db.getAllPuttingStatsWithContext as jest.Mock;

describe('Export service wrappers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllRoundHoleScoresDetailService', () => {
        it('returns mapped round hole scores with formatted dates', () => {
            mockGetAllRoundHoleScoresWithContext.mockReturnValue([
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 1, HolePar: 4, Score: 5 },
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 2, HolePar: 3, Score: 3 },
            ]);

            const result = getAllRoundHoleScoresDetailService();

            expect(mockGetAllRoundHoleScoresWithContext).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('RoundId', 1);
            expect(result[0]).toHaveProperty('HoleNumber', 1);
            expect(result[0]).toHaveProperty('Score', 5);
            expect(result[0]).toHaveProperty('HolePar', 4);
            expect(result[0]).toHaveProperty('CourseName', 'Pine Valley');
        });
    });

    describe('getAllHoleDeadlySinsDetailService', () => {
        it('returns mapped hole deadly sins with all sin columns', () => {
            mockGetAllHoleDeadlySinsWithContext.mockReturnValue([
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0 },
            ]);

            const result = getAllHoleDeadlySinsDetailService();

            expect(mockGetAllHoleDeadlySinsWithContext).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('RoundId', 1);
            expect(result[0]).toHaveProperty('HoleNumber', 1);
            expect(result[0]).toHaveProperty('ThreePutts', 1);
            expect(result[0]).toHaveProperty('TroubleOffTee', 0);
        });
    });

    describe('getAllPuttingStatsDetailService', () => {
        it('returns mapped putting stats with booleans for long/short flags', () => {
            mockGetAllPuttingStatsWithContext.mockReturnValue([
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 1, FirstPuttDistance: 8, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThirdPuttDistance: null, ThirdPuttIsLong: null },
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 2, FirstPuttDistance: 3, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThirdPuttDistance: 5, ThirdPuttIsLong: 1 },
            ]);

            const result = getAllPuttingStatsDetailService();

            expect(mockGetAllPuttingStatsWithContext).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('RoundId', 1);
            expect(result[0]).toHaveProperty('FirstPuttDistance', 8);
            expect(result[0]).toHaveProperty('SecondPuttIsLong', false);
            expect(result[1]).toHaveProperty('ThirdPuttDistance', 5);
            expect(result[1]).toHaveProperty('ThirdPuttIsLong', true);
        });
    });
});
