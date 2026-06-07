import { getSinFrequenciesSync, getSinFrequenciesForRoundsSync, getCompletedRoundIdsSync, initialize } from '../../database/db';
import * as SQLite from 'expo-sqlite';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
    openDatabaseSync: jest.fn(() => ({ getAllSync: mockGetAllSync, execSync: mockExecSync })),
}));

beforeAll(async () => {
    mockGetAllSync.mockReturnValue([]);
    mockExecAsync.mockResolvedValue(undefined);
    await initialize();
});

describe('getSinFrequenciesSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queriesHoleDeadlySinsTable', () => {
        mockGetAllSync.mockReturnValue([{ ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0 }]);
        getSinFrequenciesSync();
        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('HoleDeadlySins');
    });

    it('returnsAllZerosWhenNoData', () => {
        mockGetAllSync.mockReturnValue([{}]);
        const result = getSinFrequenciesSync();
        expect(result.ThreePutts).toBe(0);
        expect(result.DoubleBogeys).toBe(0);
        expect(result.BogeysPar5).toBe(0);
        expect(result.BogeysInside9Iron).toBe(0);
        expect(result.DoubleChips).toBe(0);
        expect(result.TroubleOffTee).toBe(0);
        expect(result.Penalties).toBe(0);
    });

    it('returnsSummedTotalsAcrossRounds', () => {
        mockGetAllSync.mockReturnValue([{
            ThreePutts: 5, DoubleBogeys: 3, BogeysPar5: 2,
            BogeysInside9Iron: 4, DoubleChips: 1, TroubleOffTee: 6, Penalties: 2,
        }]);
        const result = getSinFrequenciesSync();
        expect(result.ThreePutts).toBe(5);
        expect(result.DoubleBogeys).toBe(3);
        expect(result.BogeysPar5).toBe(2);
        expect(result.BogeysInside9Iron).toBe(4);
        expect(result.DoubleChips).toBe(1);
        expect(result.TroubleOffTee).toBe(6);
        expect(result.Penalties).toBe(2);
    });
});

describe('getSinFrequenciesForRoundsSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queriesHoleDeadlySinsFilteredByRoundIds', () => {
        mockGetAllSync.mockReturnValue([{ ThreePutts: 2, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0 }]);

        getSinFrequenciesForRoundsSync([1, 2, 3]);

        const [sql] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('HoleDeadlySins');
        expect(sql).toContain('1,2,3');
    });

    it('returnsAllZerosWhenRoundIdsEmpty', () => {
        const result = getSinFrequenciesForRoundsSync([]);

        expect(mockGetAllSync).not.toHaveBeenCalled();
        expect(result.ThreePutts).toBe(0);
        expect(result.Penalties).toBe(0);
    });

    it('returnsSummedTotalsForGivenRounds', () => {
        mockGetAllSync.mockReturnValue([{ ThreePutts: 3, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 2, TroubleOffTee: 0, Penalties: 1 }]);

        const result = getSinFrequenciesForRoundsSync([5, 6]);

        expect(result.ThreePutts).toBe(3);
        expect(result.DoubleChips).toBe(2);
        expect(result.Penalties).toBe(1);
    });
});

describe('getCompletedRoundIdsSync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returnsRoundIdsInDescendingOrderLimitedToCount', () => {
        mockGetAllSync.mockReturnValue([{ Id: 10 }, { Id: 9 }, { Id: 8 }]);

        const result = getCompletedRoundIdsSync(3);

        expect(result).toEqual([10, 9, 8]);
    });

    it('passesLimitToQuery', () => {
        mockGetAllSync.mockReturnValue([]);

        getCompletedRoundIdsSync(10);

        const [sql, params] = mockGetAllSync.mock.calls[0];
        expect(sql).toContain('Rounds');
        expect(params).toEqual([10]);
    });

    it('returnsEmptyArrayWhenNoRounds', () => {
        mockGetAllSync.mockReturnValue([]);

        const result = getCompletedRoundIdsSync(10);

        expect(result).toEqual([]);
    });
});
