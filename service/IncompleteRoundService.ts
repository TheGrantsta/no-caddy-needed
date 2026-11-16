import {
    deleteRoundHoleScoresService,
    deletePuttingStatsService,
    deleteHoleDeadlySinsService,
    deleteHoleSinDetailsService,
    getHolesPlayedForRoundService,
    deleteRoundService,
    recalculateRoundTotalService,
} from './DbService';

export type DeleteLastHoleResult = 'hole-deleted' | 'round-deleted' | 'failed';

// Removes everything saved for one hole of an unfinished round. If no holes are left, the round is deleted too.
export const deleteLastHoleService = async (roundId: number, holeNumber: number): Promise<DeleteLastHoleResult> => {
    const scoresDeleted = await deleteRoundHoleScoresService(roundId, holeNumber);
    if (!scoresDeleted) return 'failed';

    await deletePuttingStatsService(roundId, holeNumber);
    await deleteHoleDeadlySinsService(roundId, holeNumber);
    await deleteHoleSinDetailsService(roundId, holeNumber);

    if (getHolesPlayedForRoundService(roundId) > 0) {
        await recalculateRoundTotalService(roundId);
        return 'hole-deleted';
    }

    const roundDeleted = await deleteRoundService(roundId);
    return roundDeleted ? 'round-deleted' : 'failed';
};
