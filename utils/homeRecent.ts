import { formatDrillDate, parseDrillDate } from './drillHistory';

export type RecentItem = {
    title: string;
    subtitle: string;
    icon: string;
    href: string;
    // The round to open from the Stats round list
    roundId: number;
    sortTime: number;
};

type RoundRecord = { Id: number; CourseName: string | null; HolesPlayed: number; StartTime: string };

const RECENT_COUNT = 3;

// The Home screen's Recent list: the newest rounds, newest first
export const buildRecentItems = (rounds: RoundRecord[], now: Date): RecentItem[] => {
    const items: RecentItem[] = [];
    for (const round of rounds) {
        const started = parseDrillDate(round.StartTime);
        if (!started) continue;
        const holes = `${round.HolesPlayed} ${round.HolesPlayed === 1 ? 'hole' : 'holes'}`;
        items.push({
            title: round.CourseName ?? 'Round',
            subtitle: `Round · ${holes} · ${formatDrillDate(round.StartTime, now)}`,
            icon: 'flag',
            href: '/perform',
            roundId: round.Id,
            sortTime: started.getTime(),
        });
    }

    return items
        .sort((a, b) => b.sortTime - a.sortTime)
        .slice(0, RECENT_COUNT);
};
