import { getRoundFilterPreference, saveRoundFilterPreference } from '../database/db';
import { RoundFilter, parseRoundFilter, serializeRoundFilter } from '../utils/roundFilter';

// Reads the saved round filter. Missing, invalid or unreadable values fall back to 'all'.
export const getRoundFilterPreferenceService = (): RoundFilter => {
    try {
        return parseRoundFilter(getRoundFilterPreference() ?? undefined);
    } catch {
        return 'all';
    }
};

export const saveRoundFilterPreferenceService = (filter: RoundFilter): Promise<boolean> => {
    return saveRoundFilterPreference(serializeRoundFilter(filter));
};
