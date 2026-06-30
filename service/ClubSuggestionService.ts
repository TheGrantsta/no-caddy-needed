import { WedgeChartData } from './DbService';

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
