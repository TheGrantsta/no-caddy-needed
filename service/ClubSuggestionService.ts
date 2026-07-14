import { WedgeChartData, ClubDistance } from './DbService';

export type ClubSuggestion = {
    club: string;
    name: string;
    distance: number;
};

const TOLERANCE_YARDS = 5;
const ROLL_OUT_YARDS = 5;

/**
 * Find club suggestions from wedge chart based on adjusted yardage.
 * Returns exact match if within tolerance, or both clubs if yardage falls between them.
 */
export const findClubSuggestions = (adjustedYards: number, wedgeChartData: WedgeChartData): ClubSuggestion[] => {
    if (adjustedYards <= 0 || !wedgeChartData.clubs || wedgeChartData.clubs.length === 0) {
        return [];
    }

    const clubSuggestions: ClubSuggestion[] = [];
    for (const club of wedgeChartData.clubs) {
        for (const distance of club.distances) {
            const totalDistance = distance.distance + ROLL_OUT_YARDS;

            if (Math.abs(totalDistance - adjustedYards) <= TOLERANCE_YARDS) {
                clubSuggestions.push({ club: club.club, name: distance.name, distance: distance.distance });
            }
        }
    }

    return clubSuggestions;
};

export type ClubDistanceSuggestion = {
    club: string;
    distance: number;
};

/**
 * Find nearest club from distance chart as a fallback when wedge chart has no match.
 * Always returns the single closest club by carry distance, never a tolerance window like wedge suggestions.
 * Compares directly against raw CarryDistance with no roll-out adjustment — the Distances screen's
 * own caption emphasizes "carry distances NOT total distances" specifically because roll varies
 * far more across a full bag than across wedges.
 * On exact tie (equidistant), first club in array order wins (corresponds to longer club given DESC ordering).
 */
export const findNearestClubDistance = (
    adjustedYards: number,
    clubDistances: ClubDistance[]
): ClubDistanceSuggestion | null => {
    if (adjustedYards <= 0 || !clubDistances || clubDistances.length === 0) {
        return null;
    }

    let best: ClubDistance | null = null;
    let bestDiff = Infinity;
    for (const cd of clubDistances) {
        const diff = Math.abs(cd.CarryDistance - adjustedYards);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = cd;
        }
    }

    return best ? { club: best.Club, distance: best.CarryDistance } : null;
};
