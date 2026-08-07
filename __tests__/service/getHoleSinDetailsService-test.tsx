import { insertHoleSinDetailsService, getHoleSinDetailsService, getAllHoleSinDetailsService } from '../../service/DbService';

import { insertHoleSinDetails, deleteHoleSinDetailsByHole, getHoleSinDetails, getAllHoleSinDetails } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertHoleSinDetails: jest.fn(),
    deleteHoleSinDetailsByHole: jest.fn(),
    getHoleSinDetails: jest.fn(),
    getAllHoleSinDetails: jest.fn(),
}));

const mockInsert = insertHoleSinDetails as jest.Mock;
const mockDelete = deleteHoleSinDetailsByHole as jest.Mock;
const mockGet = getHoleSinDetails as jest.Mock;
const mockGetAll = getAllHoleSinDetails as jest.Mock;

describe('insertHoleSinDetailsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDelete.mockResolvedValue(true);
        mockInsert.mockResolvedValue(true);
    });

    it('deletes existing row before inserting', async () => {
        await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: 'Driver' });

        expect(mockDelete).toHaveBeenCalledWith(42, 7);
        expect(mockInsert).toHaveBeenCalled();
    });

    it('passes club name to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: 'Driver' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, 'Driver', undefined, undefined, undefined);
    });

    it('passes penalty type to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { penaltyType: 'Out of bounds' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, undefined, 'Out of bounds', undefined, undefined);
    });

    it('passes both fields to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: '3-wood', penaltyType: 'Water hazard' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, '3-wood', 'Water hazard', undefined, undefined);
    });

    it('passes bogeysInside9IronClub to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { bogeysInside9IronClub: 'Wedge' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, undefined, undefined, 'Wedge', undefined);
    });

    it('passes all three fields to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: '3-wood', penaltyType: 'Water hazard', bogeysInside9IronClub: 'Wedge' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, '3-wood', 'Water hazard', 'Wedge', undefined);
    });

    it('passes doubleChipsReason to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { doubleChipsReason: 'Chunked' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, undefined, undefined, undefined, 'Chunked');
    });

    it('passes all four fields to insert', async () => {
        await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: '3-wood', penaltyType: 'Water hazard', bogeysInside9IronClub: 'Wedge', doubleChipsReason: 'Short sided' });

        expect(mockInsert).toHaveBeenCalledWith(42, 7, '3-wood', 'Water hazard', 'Wedge', 'Short sided');
    });

    it('returns true on success', async () => {
        mockInsert.mockResolvedValue(true);

        const result = await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: 'Driver' });
        expect(result).toBe(true);
    });

    it('returns false when insert fails', async () => {
        mockInsert.mockResolvedValue(false);

        const result = await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: 'Driver' });
        expect(result).toBe(false);
    });

    it('calls delete first, then insert', async () => {
        const callOrder: string[] = [];
        mockDelete.mockImplementationOnce(() => {
            callOrder.push('delete');
            return Promise.resolve(true);
        });
        mockInsert.mockImplementationOnce(() => {
            callOrder.push('insert');
            return Promise.resolve(true);
        });

        await insertHoleSinDetailsService(42, 7, { troubleOffTeeClub: 'Driver' });
        expect(callOrder).toEqual(['delete', 'insert']);
    });
});

describe('getHoleSinDetailsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when no rows found', () => {
        mockGet.mockReturnValue([]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result).toBeNull();
    });

    it('maps row to typed HoleSinDetails object', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: 'Driver', PenaltyType: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result).toEqual({
            Id: 1,
            RoundId: 42,
            HoleNumber: 7,
            TroubleOffTeeClub: 'Driver',
        });
    });

    it('maps PenaltyType from row', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null, PenaltyType: 'Out of bounds' },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.PenaltyType).toBe('Out of bounds');
    });

    it('converts null TroubleOffTeeClub to undefined', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null, PenaltyType: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.TroubleOffTeeClub).toBeUndefined();
    });

    it('converts null PenaltyType to undefined', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: 'Driver', PenaltyType: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.PenaltyType).toBeUndefined();
    });

    it('calls getHoleSinDetails with correct params', () => {
        mockGet.mockReturnValue([]);

        getHoleSinDetailsService(42, 7);
        expect(mockGet).toHaveBeenCalledWith(42, 7);
    });

    it('returns only the first row when multiple exist', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: 'Driver', PenaltyType: 'Water hazard', BogeysInside9IronClub: 'Wedge' },
            { Id: 2, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: '3-wood', PenaltyType: null, BogeysInside9IronClub: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.Id).toBe(1);
        expect(result?.TroubleOffTeeClub).toBe('Driver');
        expect(result?.PenaltyType).toBe('Water hazard');
        expect(result?.BogeysInside9IronClub).toBe('Wedge');
    });

    it('maps BogeysInside9IronClub from row', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: 'Wedge' },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.BogeysInside9IronClub).toBe('Wedge');
    });

    it('converts null BogeysInside9IronClub to undefined', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.BogeysInside9IronClub).toBeUndefined();
    });

    it('maps DoubleChipsReason from row', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null, DoubleChipsReason: 'Chunked' },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.DoubleChipsReason).toBe('Chunked');
    });

    it('converts null DoubleChipsReason to undefined', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null, DoubleChipsReason: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.DoubleChipsReason).toBeUndefined();
    });
});

describe('getAllHoleSinDetailsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls getAllHoleSinDetails', () => {
        mockGetAll.mockReturnValue([]);

        getAllHoleSinDetailsService();
        expect(mockGetAll).toHaveBeenCalled();
    });

    it('returns empty array when no rows found', () => {
        mockGetAll.mockReturnValue([]);

        const result = getAllHoleSinDetailsService();
        expect(result).toEqual([]);
    });

    it('maps rows to typed HoleSinDetails objects', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: 'Driver', PenaltyType: null, BogeysInside9IronClub: null },
            { Id: 2, RoundId: 42, HoleNumber: 2, TroubleOffTeeClub: null, PenaltyType: 'Out of bounds', BogeysInside9IronClub: null },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            Id: 1,
            RoundId: 42,
            HoleNumber: 1,
            TroubleOffTeeClub: 'Driver',
            PenaltyType: undefined,
            BogeysInside9IronClub: undefined,
        });
        expect(result[1]).toEqual({
            Id: 2,
            RoundId: 42,
            HoleNumber: 2,
            TroubleOffTeeClub: undefined,
            PenaltyType: 'Out of bounds',
            BogeysInside9IronClub: undefined,
        });
    });

    it('converts null TroubleOffTeeClub to undefined', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result[0].TroubleOffTeeClub).toBeUndefined();
    });

    it('converts null PenaltyType to undefined', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: 'Driver', PenaltyType: null, BogeysInside9IronClub: null },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result[0].PenaltyType).toBeUndefined();
    });

    it('converts null BogeysInside9IronClub to undefined', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result[0].BogeysInside9IronClub).toBeUndefined();
    });

    it('maps all fields correctly when all present', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: '3-wood', PenaltyType: 'Water hazard', BogeysInside9IronClub: 'Wedge', DoubleChipsReason: null },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result[0]).toEqual({
            Id: 1,
            RoundId: 42,
            HoleNumber: 1,
            TroubleOffTeeClub: '3-wood',
            PenaltyType: 'Water hazard',
            BogeysInside9IronClub: 'Wedge',
            DoubleChipsReason: undefined,
        });
    });

    it('maps DoubleChipsReason from row', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null, DoubleChipsReason: 'Chunked' },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result[0].DoubleChipsReason).toBe('Chunked');
    });

    it('converts null DoubleChipsReason to undefined', () => {
        mockGetAll.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 1, TroubleOffTeeClub: null, PenaltyType: null, BogeysInside9IronClub: null, DoubleChipsReason: null },
        ]);

        const result = getAllHoleSinDetailsService();
        expect(result[0].DoubleChipsReason).toBeUndefined();
    });
});
