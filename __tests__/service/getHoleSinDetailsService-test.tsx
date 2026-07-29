import { insertHoleSinDetailsService, getHoleSinDetailsService } from '../../service/DbService';

import { insertHoleSinDetails, deleteHoleSinDetailsByHole, getHoleSinDetails } from '../../database/db';

jest.mock('../../database/db', () => ({
    insertHoleSinDetails: jest.fn(),
    deleteHoleSinDetailsByHole: jest.fn(),
    getHoleSinDetails: jest.fn(),
}));

const mockInsert = insertHoleSinDetails as jest.Mock;
const mockDelete = deleteHoleSinDetailsByHole as jest.Mock;
const mockGet = getHoleSinDetails as jest.Mock;

describe('insertHoleSinDetailsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDelete.mockResolvedValue(true);
        mockInsert.mockResolvedValue(true);
    });

    it('deletes existing row before inserting', async () => {
        await insertHoleSinDetailsService(42, 7, 'Driver');

        expect(mockDelete).toHaveBeenCalledWith(42, 7);
        expect(mockInsert).toHaveBeenCalled();
    });

    it('passes club name to insert', async () => {
        await insertHoleSinDetailsService(42, 7, 'Driver');

        expect(mockInsert).toHaveBeenCalledWith(42, 7, 'Driver');
    });

    it('passes undefined when no club provided', async () => {
        await insertHoleSinDetailsService(42, 7, undefined);

        expect(mockInsert).toHaveBeenCalledWith(42, 7, undefined);
    });

    it('returns true on success', async () => {
        mockInsert.mockResolvedValue(true);

        const result = await insertHoleSinDetailsService(42, 7, 'Driver');
        expect(result).toBe(true);
    });

    it('returns false when insert fails', async () => {
        mockInsert.mockResolvedValue(false);

        const result = await insertHoleSinDetailsService(42, 7, 'Driver');
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

        await insertHoleSinDetailsService(42, 7, 'Driver');
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
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: 'Driver' },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result).toEqual({
            Id: 1,
            RoundId: 42,
            HoleNumber: 7,
            TroubleOffTeeClub: 'Driver',
        });
    });

    it('converts null TroubleOffTeeClub to undefined', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: null },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.TroubleOffTeeClub).toBeUndefined();
    });

    it('calls getHoleSinDetails with correct params', () => {
        mockGet.mockReturnValue([]);

        getHoleSinDetailsService(42, 7);
        expect(mockGet).toHaveBeenCalledWith(42, 7);
    });

    it('returns only the first row when multiple exist', () => {
        mockGet.mockReturnValue([
            { Id: 1, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: 'Driver' },
            { Id: 2, RoundId: 42, HoleNumber: 7, TroubleOffTeeClub: '3-wood' },
        ]);

        const result = getHoleSinDetailsService(42, 7);
        expect(result?.Id).toBe(1);
        expect(result?.TroubleOffTeeClub).toBe('Driver');
    });
});
