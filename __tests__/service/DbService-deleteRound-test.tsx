import { deleteRoundService } from '../../service/DbService';
import { deleteRound } from '../../database/db';

jest.mock('../../database/db', () => ({
    deleteRound: jest.fn(),
}));

const mockDeleteRound = deleteRound as jest.Mock;

describe('deleteRoundService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls deleteRound with the round id', async () => {
        mockDeleteRound.mockResolvedValue(true);

        await deleteRoundService(42);

        expect(mockDeleteRound).toHaveBeenCalledWith(42);
    });

    it('returns true on success', async () => {
        mockDeleteRound.mockResolvedValue(true);

        const result = await deleteRoundService(1);

        expect(result).toBe(true);
    });

    it('returns false on failure', async () => {
        mockDeleteRound.mockResolvedValue(false);

        const result = await deleteRoundService(1);

        expect(result).toBe(false);
    });
});
