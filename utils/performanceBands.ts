export type BandComparator = 'gte' | 'lte';

export interface BandDefinition<K extends string> {
    key: K;
    threshold: number;
}

export function resolveBand<K extends string>(
    value: number,
    bands: BandDefinition<K>[],
    comparator: BandComparator
): K {
    for (const b of bands) {
        if (comparator === 'gte' ? value >= b.threshold : value <= b.threshold) {
            return b.key;
        }
    }
    return bands[bands.length - 1].key;
}
