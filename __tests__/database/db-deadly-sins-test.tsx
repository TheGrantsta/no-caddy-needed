import { insertHoleDeadlySins, getDeadlySinsForRound, getAllDeadlySinsRoundTotals, getHoleDeadlySins, deleteHoleDeadlySinsByHole } from '../../database/db';
import * as SQLite from 'expo-sqlite';

const mockExecAsync = jest.fn();
const mockGetAllSync = jest.fn();
const mockExecSync = jest.fn();
const mockStatementExecuteAsync = jest.fn();
const mockStatementFinalizeAsync = jest.fn().mockResolvedValue(undefined);
const mockPrepareAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: mockExecAsync,
        prepareAsync: mockPrepareAsync,
    })),
    openDatabaseSync: jest.fn(() => ({
        getAllSync: mockGetAllSync,
        execSync: mockExecSync,
    })),
}));

const allFalse = {
    threePutts: false,
    doubleBogeys: false,
    bogeysPar5: false,
    bogeysInside9Iron: false,
    doubleChips: false,
    troubleOffTee: false,
    penalties: false,
};

describe('insertHoleDeadlySins', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('inserts into HoleDeadlySins table', async () => {
        await insertHoleDeadlySins(1, 1, allFalse);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('INSERT INTO HoleDeadlySins');
    });

    it('converts boolean true to 1 when executing', async () => {
        await insertHoleDeadlySins(1, 3, { ...allFalse, threePutts: true, bogeysInside9Iron: true });

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $ThreePutts: 1, $BogeysInside9Iron: 1 })
        );
    });

    it('converts boolean false to 0 when executing', async () => {
        await insertHoleDeadlySins(1, 1, allFalse);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $ThreePutts: 0, $Penalties: 0 })
        );
    });

    it('binds RoundId and HoleNumber', async () => {
        await insertHoleDeadlySins(42, 7, allFalse);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $RoundId: 42, $HoleNumber: 7 })
        );
    });

    it('returns true on success', async () => {
        const result = await insertHoleDeadlySins(1, 1, allFalse);

        expect(result).toBe(true);
    });

    it('returns false when prepareAsync throws', async () => {
        mockPrepareAsync.mockRejectedValue(new Error('DB error'));

        const result = await insertHoleDeadlySins(1, 1, allFalse);

        expect(result).toBe(false);
    });

    it('includes all seven sin columns in the SQL', async () => {
        await insertHoleDeadlySins(1, 1, allFalse);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('ThreePutts');
        expect(sql).toContain('DoubleBogeys');
        expect(sql).toContain('BogeysPar5');
        expect(sql).toContain('BogeysInside9Iron');
        expect(sql).toContain('DoubleChips');
        expect(sql).toContain('TroubleOffTee');
        expect(sql).toContain('Penalties');
    });

    it('finalizes statement after successful insert', async () => {
        await insertHoleDeadlySins(1, 1, allFalse);

        expect(mockStatementFinalizeAsync).toHaveBeenCalled();
    });
});

describe('getDeadlySinsForRound', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries HoleDeadlySins with SUM aggregation', () => {
        mockGetAllSync.mockReturnValue([]);

        getDeadlySinsForRound(1);

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('SUM(ThreePutts)');
        expect(sql).toContain('FROM HoleDeadlySins');
        expect(sql).toContain('WHERE RoundId = ?');
    });

    it('passes roundId as parameter', () => {
        mockGetAllSync.mockReturnValue([]);

        getDeadlySinsForRound(99);

        expect(mockGetAllSync).toHaveBeenCalledWith(expect.any(String), [99]);
    });

    it('returns aggregated row when data exists', () => {
        mockGetAllSync.mockReturnValue([
            { ThreePutts: 2, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, TroubleOffTee: 1, Penalties: 0 }
        ]);

        const result = getDeadlySinsForRound(1) as any;

        expect(result).not.toBeNull();
        expect(result.ThreePutts).toBe(2);
        expect(result.DoubleBogeys).toBe(1);
    });

    it('returns null when no rows returned', () => {
        mockGetAllSync.mockReturnValue([]);

        const result = getDeadlySinsForRound(1);

        expect(result).toBeNull();
    });

    it('returns null when SUM returns all nulls (no matching holes)', () => {
        mockGetAllSync.mockReturnValue([
            { ThreePutts: null, DoubleBogeys: null, BogeysPar5: null, BogeysInside9Iron: null, DoubleChips: null, TroubleOffTee: null, Penalties: null }
        ]);

        const result = getDeadlySinsForRound(1);

        expect(result).toBeNull();
    });

    it('returns row with all seven sin fields', () => {
        mockGetAllSync.mockReturnValue([
            { ThreePutts: 3, DoubleBogeys: 2, BogeysPar5: 1, BogeysInside9Iron: 1, DoubleChips: 0, TroubleOffTee: 2, Penalties: 1 }
        ]);

        const result = getDeadlySinsForRound(5) as any;

        expect(result.ThreePutts).toBe(3);
        expect(result.DoubleBogeys).toBe(2);
        expect(result.BogeysPar5).toBe(1);
        expect(result.BogeysInside9Iron).toBe(1);
        expect(result.DoubleChips).toBe(0);
        expect(result.TroubleOffTee).toBe(2);
        expect(result.Penalties).toBe(1);
    });
});

describe('getAllDeadlySinsRoundTotals', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries HoleDeadlySins grouped by RoundId', () => {
        mockGetAllSync.mockReturnValue([]);

        getAllDeadlySinsRoundTotals();

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('FROM HoleDeadlySins');
        expect(sql).toContain('GROUP BY RoundId');
    });

    it('includes Total as sum of all sins', () => {
        mockGetAllSync.mockReturnValue([]);

        getAllDeadlySinsRoundTotals();

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('Total');
        expect(sql).toContain('SUM(');
    });

    it('orders by RoundId descending', () => {
        mockGetAllSync.mockReturnValue([]);

        getAllDeadlySinsRoundTotals();

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('ORDER BY RoundId DESC');
    });

    it('returns aggregated rows per round', () => {
        mockGetAllSync.mockReturnValue([
            { RoundId: 2, ThreePutts: 3, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, TroubleOffTee: 1, Penalties: 0, Total: 6 },
            { RoundId: 1, ThreePutts: 0, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0, Total: 0 },
        ]);

        const result = getAllDeadlySinsRoundTotals() as any[];

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(expect.objectContaining({ RoundId: 2, ThreePutts: 3, Total: 6 }));
        expect(result[1]).toEqual(expect.objectContaining({ RoundId: 1, Total: 0 }));
    });

    it('returns empty array when no data', () => {
        mockGetAllSync.mockReturnValue([]);

        const result = getAllDeadlySinsRoundTotals();

        expect(result).toEqual([]);
    });
});

describe('getHoleDeadlySins', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('queries HoleDeadlySins with RoundId and HoleNumber', () => {
        mockGetAllSync.mockReturnValue([]);

        getHoleDeadlySins(1, 3);

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('FROM HoleDeadlySins');
        expect(sql).toContain('WHERE RoundId = ?');
        expect(sql).toContain('HoleNumber = ?');
    });

    it('passes roundId and holeNumber as parameters', () => {
        mockGetAllSync.mockReturnValue([]);

        getHoleDeadlySins(42, 7);

        expect(mockGetAllSync).toHaveBeenCalledWith(expect.any(String), [42, 7]);
    });

    it('returns row when data exists', () => {
        mockGetAllSync.mockReturnValue([
            { ThreePutts: 1, DoubleBogeys: 0, BogeysPar5: 0, BogeysInside9Iron: 1, DoubleChips: 0, TroubleOffTee: 0, Penalties: 0 },
        ]);

        const result = getHoleDeadlySins(1, 3) as any;

        expect(result).not.toBeNull();
        expect(result.ThreePutts).toBe(1);
        expect(result.BogeysInside9Iron).toBe(1);
    });

    it('returns null when no rows returned', () => {
        mockGetAllSync.mockReturnValue([]);

        const result = getHoleDeadlySins(1, 3);

        expect(result).toBeNull();
    });

    it('returns all seven sin fields', () => {
        mockGetAllSync.mockReturnValue([
            { ThreePutts: 1, DoubleBogeys: 1, BogeysPar5: 0, BogeysInside9Iron: 0, DoubleChips: 1, TroubleOffTee: 0, Penalties: 1 },
        ]);

        const result = getHoleDeadlySins(5, 9) as any;

        expect(result.ThreePutts).toBe(1);
        expect(result.DoubleBogeys).toBe(1);
        expect(result.BogeysPar5).toBe(0);
        expect(result.BogeysInside9Iron).toBe(0);
        expect(result.DoubleChips).toBe(1);
        expect(result.TroubleOffTee).toBe(0);
        expect(result.Penalties).toBe(1);
    });
});

describe('deleteHoleDeadlySinsByHole', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('deletes from HoleDeadlySins by RoundId and HoleNumber', async () => {
        await deleteHoleDeadlySinsByHole(1, 3);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('DELETE FROM HoleDeadlySins');
        expect(sql).toContain('RoundId');
        expect(sql).toContain('HoleNumber');
    });

    it('binds RoundId and HoleNumber parameters', async () => {
        await deleteHoleDeadlySinsByHole(42, 7);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $RoundId: 42, $HoleNumber: 7 })
        );
    });

    it('returns true on success', async () => {
        const result = await deleteHoleDeadlySinsByHole(1, 1);

        expect(result).toBe(true);
    });

    it('returns false when prepareAsync throws', async () => {
        mockPrepareAsync.mockRejectedValue(new Error('DB error'));

        const result = await deleteHoleDeadlySinsByHole(1, 1);

        expect(result).toBe(false);
    });

    it('finalizes statement after successful delete', async () => {
        await deleteHoleDeadlySinsByHole(1, 1);

        expect(mockStatementFinalizeAsync).toHaveBeenCalled();
    });
});
