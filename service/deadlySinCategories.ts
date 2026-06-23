import { DeadlySinsRound } from './DbService';

export type DeadlySinCategory = {
    key: keyof DeadlySinsRound;
    label: string;
};

export type DeadlySinCategoryTotal = DeadlySinCategory & {
    count: number;
};

// Canonical order of the seven Deadly Sins. Shared so the bar chart and the
// swipeable trend pager present (and tie-break) the sins identically.
export const DEADLY_SIN_CATEGORIES: DeadlySinCategory[] = [
    { key: 'TroubleOffTee', label: 'Trouble off tee' },
    { key: 'Penalties', label: 'Penalties' },
    { key: 'ThreePutts', label: '3-putts' },
    { key: 'BogeysInside9Iron', label: 'Bogeys inside 9-iron' },
    { key: 'DoubleChips', label: 'Double chips' },
    { key: 'DoubleBogeys', label: 'Double bogeys' },
    { key: 'BogeysPar5', label: 'Bogeys on par 5' },
];

// Total each sin across the given rounds and sort most-frequent first. JS sort is
// stable, so ties keep the canonical DEADLY_SIN_CATEGORIES order.
export const sortDeadlySinsByFrequency = (rounds: DeadlySinsRound[]): DeadlySinCategoryTotal[] =>
    DEADLY_SIN_CATEGORIES
        .map(({ key, label }) => ({
            key,
            label,
            count: rounds.reduce((sum, round) => sum + (round[key] as number), 0),
        }))
        .sort((a, b) => b.count - a.count);
