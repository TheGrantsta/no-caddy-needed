import { deleteLastHoleService } from '../../service/IncompleteRoundService';
import {
    deleteRoundHoleScoresService,
    deletePuttingStatsService,
    deleteHoleDeadlySinsService,
    deleteHoleSinDetailsService,
    getHolesPlayedForRoundService,
    deleteRoundService,
    recalculateRoundTotalService,
} from '../../service/DbService';

jest.mock('../../service/DbService', () => ({
    deleteRoundHoleScoresService: jest.fn(),
    deletePuttingStatsService: jest.fn(),
    deleteHoleDeadlySinsService: jest.fn(),
    deleteHoleSinDetailsService: jest.fn(),
    getHolesPlayedForRoundService: jest.fn(),
    deleteRoundService: jest.fn(),
    recalculateRoundTotalService: jest.fn(),
}));

const mockDeleteScores = deleteRoundHoleScoresService as jest.Mock;
const mockDeletePutting = deletePuttingStatsService as jest.Mock;
const mockDeleteSins = deleteHoleDeadlySinsService as jest.Mock;
const mockDeleteSinDetails = deleteHoleSinDetailsService as jest.Mock;
const mockHolesPlayed = getHolesPlayedForRoundService as jest.Mock;
const mockDeleteRound = deleteRoundService as jest.Mock;
const mockRecalculate = recalculateRoundTotalService as jest.Mock;

describe('deleteLastHoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDeleteScores.mockResolvedValue(true);
        mockDeletePutting.mockResolvedValue(true);
        mockDeleteSins.mockResolvedValue(true);
        mockDeleteSinDetails.mockResolvedValue(true);
        mockDeleteRound.mockResolvedValue(true);
        mockRecalculate.mockResolvedValue(true);
    });

    it('shouldRemoveTheHoleScoresPuttingSinsAndSinDetailsForThatHole', async () => {
        mockHolesPlayed.mockReturnValue(2);

        await deleteLastHoleService(7, 10);

        expect(mockDeleteScores).toHaveBeenCalledWith(7, 10);
        expect(mockDeletePutting).toHaveBeenCalledWith(7, 10);
        expect(mockDeleteSins).toHaveBeenCalledWith(7, 10);
        expect(mockDeleteSinDetails).toHaveBeenCalledWith(7, 10);
    });

    it('shouldKeepTheRoundAndReportHoleDeletedWhenOtherHolesRemain', async () => {
        mockHolesPlayed.mockReturnValue(2);

        const result = await deleteLastHoleService(7, 10);

        expect(result).toBe('hole-deleted');
        expect(mockDeleteRound).not.toHaveBeenCalled();
    });

    it('shouldRecalculateTheRoundTotalWhenHolesRemain', async () => {
        mockHolesPlayed.mockReturnValue(2);

        await deleteLastHoleService(7, 10);

        expect(mockRecalculate).toHaveBeenCalledWith(7);
    });

    it('shouldDeleteTheRoundWhenNoHolesAreLeft', async () => {
        mockHolesPlayed.mockReturnValue(0);

        const result = await deleteLastHoleService(7, 1);

        expect(mockDeleteRound).toHaveBeenCalledWith(7);
        expect(result).toBe('round-deleted');
    });

    it('shouldReportFailedAndLeaveEverythingWhenTheScoreDeleteFails', async () => {
        mockDeleteScores.mockResolvedValue(false);
        mockHolesPlayed.mockReturnValue(1);

        const result = await deleteLastHoleService(7, 1);

        expect(result).toBe('failed');
        expect(mockDeletePutting).not.toHaveBeenCalled();
        expect(mockDeleteRound).not.toHaveBeenCalled();
    });

    it('shouldReportFailedWhenTheRoundCannotBeDeleted', async () => {
        mockHolesPlayed.mockReturnValue(0);
        mockDeleteRound.mockResolvedValue(false);

        const result = await deleteLastHoleService(7, 1);

        expect(result).toBe('failed');
    });
});
