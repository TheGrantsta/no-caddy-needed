import { getSinFrequenciesSync, initialize } from '../../database/db';
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
