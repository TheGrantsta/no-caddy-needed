import { hasSinDetails } from '../utils/deadlySins';
import {
    updateScorecardService,
    replaceHoleDeadlySinsService,
    replaceHoleSinDetailsService,
    deleteHoleSinDetailsService,
    insertPuttingStatsService,
    updateRoundStartTimeService,
    DeadlySinsValues,
    RoundHoleScore,
} from './DbService';

export type SinDetailsInput = {
    troubleOffTeeClub?: string;
    penaltyType?: string;
    bogeysInside9IronClub?: string;
    doubleChipsReason?: string;
};

// The hole the user opened in the edit sheet, if any
export type HoleEditInput = {
    holeNumber: number | null;
    sins: DeadlySinsValues | null;
    sinDetails: SinDetailsInput;
    hadPriorSinDetails: boolean;
    puttingStats: { firstPutt?: number; secondPutt?: number; secondIsLong: boolean; greenInRegulation: boolean } | null;
};

export type ScorecardSaveResult = 'saved' | 'missing-first-putt' | 'failed';

// Scores and pars that differ from the saved scorecard. A par is reported once per hole.
export const scorecardChangesFor = (original: RoundHoleScore[], edited: RoundHoleScore[]) => {
    const changes: { id: number; score: number }[] = [];
    edited.forEach(e => {
        const o = original.find(x => x.Id === e.Id);
        if (o && o.Score !== e.Score) {
            changes.push({ id: e.Id, score: e.Score });
        }
    });

    const parChanges: { holeNumber: number; holePar: number }[] = [];
    const processedHoles = new Set<number>();
    edited.forEach(e => {
        const o = original.find(x => x.Id === e.Id);
        if (o && o.HolePar !== e.HolePar && !processedHoles.has(e.HoleNumber)) {
            parChanges.push({ holeNumber: e.HoleNumber, holePar: e.HolePar });
            processedHoles.add(e.HoleNumber);
        }
    });

    return { changes, parChanges };
};

// Saves a scorecard edit. Nothing is written when the first putt is missing from putting
// that is being recorded, because a cleared field would otherwise be stored as a 0 ft putt.
export const saveScorecardEditsService = async (input: {
    roundId: number;
    original: RoundHoleScore[];
    edited: RoundHoleScore[];
    hole: HoleEditInput;
    newStartTime: Date | null;
}): Promise<ScorecardSaveResult> => {
    const { roundId, hole } = input;
    const holeNumber = hole.holeNumber;

    if (holeNumber !== null && hole.puttingStats && hole.puttingStats.firstPutt === undefined) {
        return 'missing-first-putt';
    }

    const { changes, parChanges } = scorecardChangesFor(input.original, input.edited);
    const success = await updateScorecardService(roundId, changes, parChanges);
    if (!success) return 'failed';

    if (holeNumber !== null && hole.sins !== null) {
        await replaceHoleDeadlySinsService(roundId, holeNumber, hole.sins);
        // Details are stored whenever a sin has them, even if the user has no clubs listed
        if (hasSinDetails(hole.sins)) {
            await replaceHoleSinDetailsService(roundId, holeNumber, {
                troubleOffTeeClub: hole.sinDetails.troubleOffTeeClub,
                penaltyType: hole.sinDetails.penaltyType,
                bogeysInside9IronClub: hole.sinDetails.bogeysInside9IronClub,
                doubleChipsReason: hole.sinDetails.doubleChipsReason,
            });
        } else if (hole.hadPriorSinDetails) {
            await deleteHoleSinDetailsService(roundId, holeNumber);
        }
    }

    if (holeNumber !== null && hole.puttingStats) {
        const stats = hole.puttingStats;
        await insertPuttingStatsService(roundId, holeNumber, stats.firstPutt ?? 0, stats.secondPutt ?? 0, stats.secondIsLong, undefined, undefined, stats.greenInRegulation);
    }

    if (input.newStartTime) {
        await updateRoundStartTimeService(roundId, input.newStartTime);
    }

    return 'saved';
};
