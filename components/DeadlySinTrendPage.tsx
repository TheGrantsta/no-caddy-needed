import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DeadlySinsRound } from '@/service/DbService';
import { DeadlySinCategory } from '@/service/deadlySinCategories';
import { useStyles } from '@/hooks/useStyles';
import DeadlySinBarChart from './DeadlySinBarChart';

const mean = (xs: number[]) => xs.reduce((sum, v) => sum + v, 0) / xs.length;

function buildTrendNarrative(values: number[], label: string): string {
    const noun = label.toLowerCase();
    const n = values.length;
    if (n === 0) return '';

    const total = values.reduce((sum, v) => sum + v, 0);
    const cleanCount = values.filter(v => v === 0).length;

    if (n === 1) {
        return total === 0
            ? `A clean round — no ${noun} in your most recent round.`
            : `${total} ${noun} in your most recent round.`;
    }

    if (total === 0) {
        return `No ${noun} across your last ${n} rounds — keep it up.`;
    }

    const half = Math.floor(n / 2);
    const earlier = mean(values.slice(0, half));
    const later = mean(values.slice(n - half));
    const delta = later - earlier;

    let direction: string;
    if (delta <= -0.5) {
        direction = `is trending down — your recent rounds are cleaner than earlier ones`;
    } else if (delta >= 0.5) {
        direction = `is creeping up — recent rounds are worse than earlier ones`;
    } else {
        direction = `is holding steady`;
    }

    const avgText = (total / n).toFixed(1);
    const cleanText = cleanCount > 0
        ? ` You kept it clean in ${cleanCount} of ${n} rounds.`
        : '';

    return `Your ${noun} ${direction}, averaging ${avgText} per round over the last ${n}.${cleanText}`;
}

type SinTrendPageProps = {
    category: DeadlySinCategory;
    rounds: DeadlySinsRound[];
    width: number;
};

export default function DeadlySinTrendPage({ category, rounds, width }: SinTrendPageProps) {
    const styles = useStyles();
    const s = styles.deadlySinTrend;
    const key = category.key;
    const narrative = buildTrendNarrative(rounds.map(r => r[key] as number), category.label);

    return (
        <View testID={`deadly-sin-trend-page-${key}`} style={{ width }}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <Text testID="deadly-sin-trend-heading" style={s.heading}>{category.label}</Text>
                {rounds.length === 0 ? (
                    <Text testID="deadly-sin-trend-empty" style={s.emptyText}>
                        No rounds recorded yet
                    </Text>
                ) : (
                    <>
                        <DeadlySinBarChart rounds={rounds} sinKey={key} />
                        <Text testID="deadly-sin-trend-narrative" style={s.narrative}>
                            {narrative}
                        </Text>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
