import { getAllRoundHoleScoresWithContext, getAllHoleDeadlySinsWithContext, getAllPuttingStatsWithContext, initialize } from '../../database/db';

const mockGetAllSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: jest.fn(),
        prepareSync: jest.fn(),
    })),
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn().mockResolvedValue(undefined),
        prepareAsync: jest.fn(),
        getAllSync: mockGetAllSync,
        execSync: jest.fn(),
    })),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    await initialize();
});

describe('Export database queries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAllSync.mockClear();
    });

    describe('getAllRoundHoleScoresWithContext', () => {
        it('returns all hole scores with round context and filters to user only', () => {
            mockGetAllSync.mockReturnValue([
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 1, HolePar: 4, Score: 5 },
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 2, HolePar: 3, Score: 3 },
            ]);

            const result = getAllRoundHoleScoresWithContext();

            expect(mockGetAllSync).toHaveBeenCalled();
            const sqlArg = mockGetAllSync.mock.calls[0][0];
            expect(sqlArg.toUpperCase()).toContain('ROUNDHOLESCORES');
            expect(sqlArg.toUpperCase()).toContain('ROUNDPLAYERS');
            expect(sqlArg.toUpperCase()).toContain('ROUNDS');
            expect(sqlArg.toUpperCase()).toContain('ISUSER = 1');
            expect(sqlArg.toUpperCase()).toContain('ISCOMPLETED = 1');
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('RoundId', 1);
            expect(result[0]).toHaveProperty('HoleNumber', 1);
            expect(result[0]).toHaveProperty('Score', 5);
        });
    });

    describe('getAllHoleDeadlySinsWithContext', () => {
        it('returns hole-level deadly sins with round context', () => {
            mockGetAllSync.mockReturnValue([
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 1, ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0 },
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 2, ThreePutts: 0, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0 },
            ]);

            const result = getAllHoleDeadlySinsWithContext();

            expect(mockGetAllSync).toHaveBeenCalled();
            const sqlArg = mockGetAllSync.mock.calls[0][0];
            expect(sqlArg.toUpperCase()).toContain('HOLEDEADLYSINS');
            expect(sqlArg.toUpperCase()).toContain('ROUNDS');
            expect(sqlArg.toUpperCase()).toContain('ISCOMPLETED = 1');
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('RoundId', 1);
            expect(result[0]).toHaveProperty('HoleNumber', 1);
            expect(result[0]).toHaveProperty('ThreePutts', 1);
        });
    });

    describe('getAllPuttingStatsWithContext', () => {
        it('returns full putting stats with round context and all columns', () => {
            mockGetAllSync.mockReturnValue([
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 1, FirstPuttDistance: 8, SecondPuttDistance: 2, SecondPuttIsLong: 0, ThirdPuttDistance: null, ThirdPuttIsLong: null },
                { RoundId: 1, CourseName: 'Pine Valley', Created_At: '2026-07-20', HoleNumber: 2, FirstPuttDistance: 3, SecondPuttDistance: 0, SecondPuttIsLong: 0, ThirdPuttDistance: null, ThirdPuttIsLong: null },
            ]);

            const result = getAllPuttingStatsWithContext();

            expect(mockGetAllSync).toHaveBeenCalled();
            const sqlArg = mockGetAllSync.mock.calls[0][0];
            expect(sqlArg.toUpperCase()).toContain('PUTTINGSTATS');
            expect(sqlArg.toUpperCase()).toContain('ROUNDS');
            expect(sqlArg.toUpperCase()).toContain('HOLENUMBER');
            expect(sqlArg.toUpperCase()).toContain('FIRSTPUTTDISTANCE');
            expect(sqlArg.toUpperCase()).toContain('SECONDPUTTDISTANCE');
            expect(sqlArg.toUpperCase()).toContain('THIRDPUTTDISTANCE');
            expect(sqlArg.toUpperCase()).toContain('ISCOMPLETED = 1');
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('RoundId', 1);
            expect(result[0]).toHaveProperty('HoleNumber', 1);
            expect(result[0]).toHaveProperty('FirstPuttDistance', 8);
            expect(result[0]).toHaveProperty('ThirdPuttDistance');
        });
    });
});
