import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColours } from '@/context/ThemeContext';
import { DeadlySinsRound } from '@/service/DbService';
import { DeadlySinCategory } from '@/service/deadlySinCategories';
import { useStyles } from '@/hooks/useStyles';
import DeadlySinBarChart from './DeadlySinBarChart';

const mean = (xs: number[]) => xs.reduce((sum, v) => sum + v, 0) / xs.length;

type TrendDirection = 'single' | 'clean' | 'down' | 'up' | 'steady';

// How the sin is moving: clean when it never happened, otherwise comparing the earlier and later halves
function trendDirection(values: number[]): TrendDirection {
    const n = values.length;
    if (n === 1) return 'single';
    const total = values.reduce((sum, v) => sum + v, 0);
    if (total === 0) return 'clean';

    const half = Math.floor(n / 2);
    const earlier = mean(values.slice(0, half));
    const later = mean(values.slice(n - half));
    const delta = later - earlier;
    if (delta <= -0.5) return 'down';
    if (delta >= 0.5) return 'up';
    return 'steady';
}

const STATUS_TEXT: Record<TrendDirection, string> = {
    single: '',
    clean: 'Clean streak',
    down: 'Trending down',
    up: 'Creeping up',
    steady: 'Holding steady',
};

function buildTrendNarrative(values: number[], label: string): string {
    const noun = label.toLowerCase();
    const n = values.length;
    if (n === 0) return '';

    const total = values.reduce((sum, v) => sum + v, 0);
    const cleanCount = values.filter(v => v === 0).length;
    const direction = trendDirection(values);

    if (direction === 'single') {
        return total === 0
            ? `A clean round — no ${noun} in your most recent round.`
            : `${total} ${noun} in your most recent round.`;
    }

    if (direction === 'clean') {
        return `No ${noun} across your last ${n} rounds — keep it up.`;
    }

    const movement = {
        down: 'is trending down — your recent rounds are cleaner than earlier ones',
        up: 'is creeping up — recent rounds are worse than earlier ones',
        steady: 'is holding steady',
    }[direction];

    const avgText = (total / n).toFixed(1);
    const cleanText = cleanCount > 0
        ? ` You kept it clean in ${cleanCount} of ${n} rounds.`
        : '';

    return `Your ${noun} ${movement}, averaging ${avgText} per round over the last ${n}.${cleanText}`;
}

type SinTrendPageProps = {
    category: DeadlySinCategory;
    rounds: DeadlySinsRound[];
    width: number;
};

export default function DeadlySinTrendPage({ category, rounds, width }: SinTrendPageProps) {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const s = styles.deadlySinTrend;
    const key = category.key;
    const values = rounds.map(r => r[key] as number);
    const n = values.length;
    const total = values.reduce((sum, v) => sum + v, 0);
    const cleanCount = values.filter(v => v === 0).length;
    const direction = trendDirection(values);

    return (
        <View testID={`deadly-sin-trend-page-${key}`} style={{ width }}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <View testID="deadly-sin-trend-title-row" style={s.pageHeader}>
                    <TouchableOpacity
                        testID="deadly-sin-trend-back-button"
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                        onPress={() => router.back()}
                        style={s.backButton}
                    >
                        <MaterialIcons name="chevron-left" size={28} color={colours.black} />
                    </TouchableOpacity>
                    <Text testID="deadly-sin-trend-heading" style={s.pageTitle}>{category.label}</Text>
                    <View style={s.backButtonSpacer} />
                </View>

                {n === 0 ? (
                    <Text testID="deadly-sin-trend-empty" style={s.emptyText}>
                        No rounds recorded yet
                    </Text>
                ) : (
                    <>
                        <Text style={s.averageLabel}>AVERAGE</Text>
                        <View testID="deadly-sin-trend-average-row" style={s.averageRow}>
                            <Text testID="deadly-sin-trend-average" style={s.averageValue}>{(total / n).toFixed(1)}</Text>
                            <Text style={s.averageUnit}>per round</Text>
                        </View>
                        <View testID="deadly-sin-trend-caption-row" style={s.captionRow}>
                            <Text testID="deadly-sin-trend-average-caption" style={s.averageCaption}>{`Last ${n} rounds`}</Text>
                            {direction !== 'single' && (
                                <View testID="deadly-sin-trend-status" style={s.statusPill}>
                                    <Text style={s.statusPillText}>{STATUS_TEXT[direction]}</Text>
                                </View>
                            )}
                        </View>

                        <View style={s.card}>
                            <DeadlySinBarChart rounds={rounds} sinKey={key} />
                        </View>

                        <Text style={s.sectionLabel}>HIGHLIGHTS</Text>
                        <View style={s.card}>
                            <Text testID="deadly-sin-trend-narrative" style={s.narrative}>
                                {buildTrendNarrative(values, category.label)}
                            </Text>
                            <View style={s.cleanRow}>
                                <Text style={s.cleanLabel}>Clean rounds</Text>
                                <View style={s.cleanTrack}>
                                    <View
                                        testID="deadly-sin-trend-clean-fill"
                                        style={[s.cleanFill, { width: `${(cleanCount / n) * 100}%` }]}
                                    />
                                </View>
                                <Text testID="deadly-sin-trend-clean-count" style={s.cleanCount}>
                                    {`${cleanCount} of ${n}`}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
