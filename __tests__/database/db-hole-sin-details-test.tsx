import { insertHoleSinDetails, getHoleSinDetails, deleteHoleSinDetailsByHole, getAllHoleSinDetails, initialize } from '../../database/db';
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

describe('insertHoleSinDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('inserts into HoleSinDetails table', async () => {
        await insertHoleSinDetails(1, 1, 'Driver');

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('INSERT INTO HoleSinDetails');
    });

    it('binds RoundId, HoleNumber, and TroubleOffTeeClub', async () => {
        await insertHoleSinDetails(42, 7, 'Driver');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $RoundId: 42, $HoleNumber: 7, $TroubleOffTeeClub: 'Driver' })
        );
    });

    it('binds null when TroubleOffTeeClub is undefined', async () => {
        await insertHoleSinDetails(1, 1, undefined);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $TroubleOffTeeClub: null })
        );
    });

    it('binds PenaltyType when provided', async () => {
        await insertHoleSinDetails(42, 7, 'Driver', 'Out of bounds');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $PenaltyType: 'Out of bounds' })
        );
    });

    it('binds null when PenaltyType is undefined', async () => {
        await insertHoleSinDetails(42, 7, 'Driver', undefined);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $PenaltyType: null })
        );
    });

    it('binds both fields when both provided', async () => {
        await insertHoleSinDetails(42, 7, '3-wood', 'Water hazard');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                $RoundId: 42,
                $HoleNumber: 7,
                $TroubleOffTeeClub: '3-wood',
                $PenaltyType: 'Water hazard',
            })
        );
    });

    it('binds BogeysInside9IronClub when provided', async () => {
        await insertHoleSinDetails(42, 7, 'Driver', undefined, 'Wedge');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $BogeysInside9IronClub: 'Wedge' })
        );
    });

    it('binds null when BogeysInside9IronClub is undefined', async () => {
        await insertHoleSinDetails(42, 7, 'Driver', undefined, undefined);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $BogeysInside9IronClub: null })
        );
    });

    it('binds all three fields when all provided', async () => {
        await insertHoleSinDetails(42, 7, '3-wood', 'Water hazard', 'Wedge');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                $RoundId: 42,
                $HoleNumber: 7,
                $TroubleOffTeeClub: '3-wood',
                $PenaltyType: 'Water hazard',
                $BogeysInside9IronClub: 'Wedge',
            })
        );
    });

    it('binds DoubleChipsReason when provided', async () => {
        await insertHoleSinDetails(42, 7, 'Driver', undefined, undefined, 'Chunked');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $DoubleChipsReason: 'Chunked' })
        );
    });

    it('binds null when DoubleChipsReason is undefined', async () => {
        await insertHoleSinDetails(42, 7, 'Driver', undefined, undefined, undefined);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $DoubleChipsReason: null })
        );
    });

    it('binds all four fields when all provided', async () => {
        await insertHoleSinDetails(42, 7, '3-wood', 'Water hazard', 'Wedge', 'Short sided');

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                $RoundId: 42,
                $HoleNumber: 7,
                $TroubleOffTeeClub: '3-wood',
                $PenaltyType: 'Water hazard',
                $BogeysInside9IronClub: 'Wedge',
                $DoubleChipsReason: 'Short sided',
            })
        );
    });

    it('returns true on success', async () => {
        const result = await insertHoleSinDetails(1, 1, 'Driver');
        expect(result).toBe(true);
    });

    it('returns false when statement prepare fails', async () => {
        mockPrepareAsync.mockRejectedValueOnce(new Error('prepare failed'));

        const result = await insertHoleSinDetails(1, 1, 'Driver');
        expect(result).toBe(false);
    });

    it('returns false when statement execute fails', async () => {
        mockStatementExecuteAsync.mockRejectedValueOnce(new Error('execute failed'));

        const result = await insertHoleSinDetails(1, 1, 'Driver');
        expect(result).toBe(false);
    });
});

describe('getHoleSinDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls getAllSync with correct SQL and params', () => {
        getHoleSinDetails(42, 7);

        expect(mockGetAllSync).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM HoleSinDetails'),
            [42, 7]
        );
    });

    it('includes LIMIT 1 in the query', () => {
        getHoleSinDetails(1, 1);

        const sql = mockGetAllSync.mock.calls[0][0];
        expect(sql).toContain('LIMIT 1');
    });

    it('returns rows from getAllSync', () => {
        const mockRows = [{ Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: 'Driver' }];
        mockGetAllSync.mockReturnValueOnce(mockRows);

        const result = getHoleSinDetails(42, 7);
        expect(result).toEqual(mockRows);
    });

    it('returns empty array when no rows found', () => {
        mockGetAllSync.mockReturnValueOnce([]);

        const result = getHoleSinDetails(42, 7);
        expect(result).toEqual([]);
    });
});

describe('deleteHoleSinDetailsByHole', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrepareAsync.mockResolvedValue({
            executeAsync: mockStatementExecuteAsync,
            finalizeAsync: mockStatementFinalizeAsync,
        });
        mockStatementExecuteAsync.mockResolvedValue(undefined);
    });

    it('deletes from HoleSinDetails table', async () => {
        await deleteHoleSinDetailsByHole(1, 1);

        const sql = mockPrepareAsync.mock.calls[0][0];
        expect(sql).toContain('DELETE FROM HoleSinDetails');
    });

    it('binds RoundId and HoleNumber', async () => {
        await deleteHoleSinDetailsByHole(42, 7);

        expect(mockStatementExecuteAsync).toHaveBeenCalledWith(
            expect.objectContaining({ $RoundId: 42, $HoleNumber: 7 })
        );
    });

    it('returns true on success', async () => {
        const result = await deleteHoleSinDetailsByHole(1, 1);
        expect(result).toBe(true);
    });

    it('returns false when statement prepare fails', async () => {
        mockPrepareAsync.mockRejectedValueOnce(new Error('prepare failed'));

        const result = await deleteHoleSinDetailsByHole(1, 1);
        expect(result).toBe(false);
    });

    it('returns false when statement execute fails', async () => {
        mockStatementExecuteAsync.mockRejectedValueOnce(new Error('execute failed'));

        const result = await deleteHoleSinDetailsByHole(1, 1);
        expect(result).toBe(false);
    });
});

describe('getAllHoleSinDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls getAllSync with SELECT * FROM HoleSinDetails', () => {
        getAllHoleSinDetails();

        expect(mockGetAllSync).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM HoleSinDetails')
        );
    });

    it('returns rows from getAllSync', () => {
        const mockRows = [
            { Id: 1, RoundId: 1, HoleNumber: 1, TroubleOffTeeClub: 'Driver', PenaltyType: null, BogeysInside9IronClub: null },
            { Id: 2, RoundId: 1, HoleNumber: 2, TroubleOffTeeClub: null, PenaltyType: 'Out of bounds', BogeysInside9IronClub: null },
        ];
        mockGetAllSync.mockReturnValueOnce(mockRows);

        const result = getAllHoleSinDetails();
        expect(result).toEqual(mockRows);
    });

    it('returns empty array when no rows found', () => {
        mockGetAllSync.mockReturnValueOnce([]);

        const result = getAllHoleSinDetails();
        expect(result).toEqual([]);
    });
});
