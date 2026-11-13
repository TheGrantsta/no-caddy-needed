import { buildRoundSummary, SummarySins } from '../utils/roundSummary';
import { getDeadlySinsForRoundService, getMultiplayerScorecardService, getPuttingStatsService } from './DbService';

// The "Round saved" summary, read back from what was stored for the round. Null if the round has no scorecard.
export const buildSummaryForRoundService = (roundId: number, isScoreOnly: boolean) => {
    const scorecard = getMultiplayerScorecardService(roundId);
    if (!scorecard) return null;
    const holeNumbers = [...new Set(scorecard.holeScores.map(h => h.HoleNumber))];
    const putting = isScoreOnly ? [] : holeNumbers.flatMap(hole => {
        const saved = getPuttingStatsService(roundId, hole);
        if (!saved) return [];
        return [{
            hole,
            firstPutt: saved.FirstPuttDistance ?? undefined,
            secondPutt: saved.SecondPuttDistance ?? undefined,
            greenInRegulation: Boolean(saved.GreenInRegulation),
        }];
    });
    const totals = isScoreOnly ? null : getDeadlySinsForRoundService(roundId);
    const sins: SummarySins = totals ? {
        TroubleOffTee: totals.TroubleOffTee,
        Penalties: totals.Penalties,
        ThreePutts: totals.ThreePutts,
        BogeysInside9Iron: totals.BogeysInside9Iron,
        DoubleChips: totals.DoubleChips,
        DoubleBogeys: totals.DoubleBogeys,
        BogeysPar5: totals.BogeysPar5,
    } : {};
    return buildRoundSummary({
        courseName: scorecard.round.CourseName ?? 'Round',
        players: scorecard.players,
        holeScores: scorecard.holeScores,
        putting,
        sins,
        isScoreOnly,
    });
};
