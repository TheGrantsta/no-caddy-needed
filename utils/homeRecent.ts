import { describeDrill, formatDrillDate, parseDrillDate } from './drillHistory';

export type RecentItem = {
    title: string;
    subtitle: string;
    icon: string;
    href: string;
    sortTime: number;
};

type RoundRecord = { CourseName: string | null; HolesPlayed: number; StartTime: string };
type DrillRecord = { Name: string; Score?: number | null; Timestamp?: string; Created_At?: string };

const RECENT_COUNT = 2;

// The Home screen's Recent list: the newest rounds and practice drills, merged and newest first
export const buildRecentItems = (rounds: RoundRecord[], drills: DrillRecord[], now: Date): RecentItem[] => {
    const roundItems: RecentItem[] = [];
    for (const round of rounds) {
        const started = parseDrillDate(round.StartTime);
        if (!started) continue;
        const holes = `${round.HolesPlayed} ${round.HolesPlayed === 1 ? 'hole' : 'holes'}`;
        roundItems.push({
            title: round.CourseName ?? 'Round',
            subtitle: `Round · ${holes} · ${formatDrillDate(round.StartTime, now)}`,
            icon: 'flag',
            href: '/perform',
            sortTime: started.getTime(),
        });
    }

    const drillItems: RecentItem[] = [];
    for (const drill of drills) {
        const stamp = drill.Timestamp ?? drill.Created_At ?? '';
        const when = parseDrillDate(stamp);
        if (!when) continue;
        const { label, icon } = describeDrill(drill.Name);
        const score = drill.Score !== undefined && drill.Score !== null ? ` · Score ${drill.Score}` : '';
        drillItems.push({
            title: label,
            subtitle: `Practice${score} · ${formatDrillDate(stamp, now)}`,
            icon,
            href: '/practice',
            sortTime: when.getTime(),
        });
    }

    return [...roundItems, ...drillItems]
        .sort((a, b) => b.sortTime - a.sortTime)
        .slice(0, RECENT_COUNT);
};
