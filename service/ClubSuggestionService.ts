import { WedgeChartData } from './DbService';

export type ClubSuggestion = {
    club: string;
    distance: number;
    matchType: 'exact' | 'between';
};

const TOLERANCE_YARDS = 3;

/**
 * Find club suggestions from wedge chart based on adjusted yardage.
 * Returns exact match if within tolerance, or both clubs if yardage falls between them.
 */
export const findClubSuggestions = (adjustedYards: number, wedgeChartData: WedgeChartData): ClubSuggestion[] => {
    if (adjustedYards <= 0 || !wedgeChartData.clubs || wedgeChartData.clubs.length === 0) {
        return [];
    }

    // Flatten all club distances into a single list with club name
    const allDistances: ClubSuggestion[] = [];
    for (const club of wedgeChartData.clubs) {
        for (const distance of club.distances) {
            allDistances.push({
                club: club.club,
                distance: distance.distance,
                matchType: 'exact',
            });
        }
    }

    if (allDistances.length === 0) {
        return [];
    }

    // Sort by distance descending (longest first)
    allDistances.sort((a, b) => b.distance - a.distance);

    // Find exact match within tolerance
    const exactMatch = allDistances.find(d => Math.abs(d.distance - adjustedYards) <= TOLERANCE_YARDS);
    if (exactMatch) {
        return [{ ...exactMatch, matchType: 'exact' }];
    }

    // Find the closest club longer than the yardage
    const longer = allDistances.reduce<ClubSuggestion | null>((closest, current) => {
        if (current.distance <= adjustedYards) return closest;
        if (!closest) return current;
        return Math.abs(current.distance - adjustedYards) < Math.abs(closest.distance - adjustedYards) ? current : closest;
    }, null);

    // Find the closest club shorter than the yardage
    const shorter = allDistances.reduce<ClubSuggestion | null>((closest, current) => {
        if (current.distance >= adjustedYards) return closest;
        if (!closest) return current;
        return Math.abs(adjustedYards - current.distance) < Math.abs(adjustedYards - closest.distance) ? current : closest;
    }, null);

    if (longer && shorter) {
        return [
            { ...longer, matchType: 'between' },
            { ...shorter, matchType: 'between' },
        ];
    }

    return [];
};
