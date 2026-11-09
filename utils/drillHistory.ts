// Helpers for the Practice history list: how each challenge is named and iconed, how its date
// reads, and which week group it falls in

type DrillRecord = { Name: string; Created_At: string };

const CHALLENGE_DISPLAY: Record<string, { label: string; icon: string }> = {
    'Putting Simulation': { label: 'Putting sim', icon: 'adjust' },
    'Up-and-down Challenge': { label: 'Up-and-down', icon: 'flag' },
    'Short-Putting Ladder': { label: 'Short-putting ladder', icon: 'stairs' },
    'Lag Putting': { label: 'Lag putting', icon: 'trending-up' },
};

const GENERIC_ICON = 'sports-golf';

export const describeDrill = (name: string): { label: string; icon: string } =>
    CHALLENGE_DISPLAY[name] ?? { label: name, icon: GENERIC_ICON };

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// SQLite's CURRENT_TIMESTAMP stores UTC as 'YYYY-MM-DD HH:MM:SS', which not every JavaScript engine
// parses; rewrite it as ISO (with T and Z) before reading it. Returns null when it is not a date.
const SQLITE_UTC = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}(?::\d{2})?)$/;

export const parseDrillDate = (value: string): Date | null => {
    const trimmed = value.trim();
    const match = SQLITE_UTC.exec(trimmed);
    const normalised = match ? `${match[1]}T${match[2].length === 5 ? `${match[2]}:00` : match[2]}Z` : trimmed;
    const date = new Date(normalised);
    return Number.isNaN(date.getTime()) ? null : date;
};

// "Today" for drills from the same day, otherwise weekday, day and month (e.g. "Sat 7 Nov")
export const formatDrillDate = (value: string, now: Date): string => {
    const drillDate = parseDrillDate(value);
    if (!drillDate) {
        return '—';
    }
    if (startOfDay(drillDate).getTime() === startOfDay(now).getTime()) {
        return 'Today';
    }
    return drillDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

// "This week" is the last seven days including today; anything older is "previously"
export const groupDrillsByWeek = <T extends DrillRecord>(drills: T[], now: Date): { thisWeek: T[]; previously: T[] } => {
    const weekStart = startOfDay(now);
    weekStart.setDate(weekStart.getDate() - 6);

    const thisWeek: T[] = [];
    const previously: T[] = [];
    for (const drill of drills) {
        const drillDate = parseDrillDate(drill.Created_At);
        if (drillDate && drillDate.getTime() >= weekStart.getTime()) {
            thisWeek.push(drill);
        } else {
            previously.push(drill);
        }
    }
    return { thisWeek, previously };
};
