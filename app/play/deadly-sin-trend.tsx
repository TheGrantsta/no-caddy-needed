import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { getAllDeadlySinsRoundsService, DeadlySinsRound } from '../../service/DbService';
import { DeadlySinCategory, sortDeadlySinsByFrequency } from '../../service/deadlySinCategories';
import { useStyles } from '../../hooks/useStyles';

const CHART_HEIGHT = 200;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 32;
const MAX_ROUNDS = 20;
const DATE_LABEL_WIDTH = 40;
const DOT_RADIUS = 4;

// Integer tick values from 0..maxValue, stepping so we never show more than ~7 ticks.
function buildTicks(maxValue: number): number[] {
    if (maxValue <= 0) return [0];
    const step = maxValue <= 6 ? 1 : Math.ceil(maxValue / 6);
    const ticks: number[] = [];
    for (let v = 0; v <= maxValue; v += step) ticks.push(v);
    return ticks;
}

const mean = (xs: number[]) => xs.reduce((sum, v) => sum + v, 0) / xs.length;

// Choose which date labels to render so no two overlap. The most recent round
// is always kept (clamped to the right edge); earlier labels are kept greedily
// only when they clear both the previous shown label and the reserved final one.
function selectDateLabelIndices(
    n: number,
    slotCentre: (i: number) => number,
    chartWidth: number,
    labelWidth: number,
): Set<number> {
    if (n <= 1) return new Set(n === 1 ? [0] : []);
    const leftFor = (i: number) =>
        Math.max(0, Math.min(slotCentre(i) - labelWidth / 2, chartWidth - labelWidth));
    const shown = new Set<number>([n - 1]);
    const lastLeft = leftFor(n - 1);
    let prevRight = -Infinity;
    for (let i = 0; i < n - 1; i++) {
        const left = leftFor(i);
        if (left >= prevRight && left + labelWidth <= lastLeft) {
            shown.add(i);
            prevRight = left + labelWidth;
        }
    }
    return shown;
}

// Plain-language read of what the (chronological) series suggests for this fault.
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

type BarChartProps = {
    rounds: DeadlySinsRound[];
    sinKey: keyof DeadlySinsRound;
};

function BarChart({ rounds, sinKey }: BarChartProps) {
    const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 62);
    const styles = useStyles();
    const s = styles.deadlySinTrend;

    const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const baseline = CHART_PADDING_TOP + plotHeight;
    const values = rounds.map(r => r[sinKey] as number);
    const maxValue = Math.max(...values, 0);
    const yScale = maxValue > 0 ? plotHeight / (maxValue + 1) : 1;

    // Each round occupies an equal-width slot; the lollipop is centred within it.
    const slotWidth = chartWidth / rounds.length;
    const slotCentre = (i: number) => slotWidth * (i + 0.5);
    // Map an arbitrary value (e.g. a tick or the rolling average) to a vertical position.
    const yForValue = (v: number) => CHART_PADDING_TOP + plotHeight - v * yScale;

    const ticks = buildTicks(maxValue);

    // Render only as many date labels as fit without overlapping.
    const shownDateLabels = selectDateLabelIndices(rounds.length, slotCentre, chartWidth, DATE_LABEL_WIDTH);

    return (
        <View testID="deadly-sin-trend-chart" style={s.chartWrapper}>
            <View style={s.chartRow}>
                <View style={s.yAxisLabels}>
                    {ticks.slice().reverse().map((v) => (
                        <Text
                            key={`y-label-${v}`}
                            testID={`deadly-sin-trend-y-label-${v}`}
                            style={[s.axisLabel, {
                                position: 'absolute',
                                right: 6,
                                top: yForValue(v) - 7,
                            }]}
                        >
                            {v}
                        </Text>
                    ))}
                </View>
                <View
                    style={[s.chartArea, { height: CHART_HEIGHT }]}
                    onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                >
                    {ticks.map((v) => (
                        <View
                            key={`gridline-${v}`}
                            testID={`deadly-sin-trend-gridline-${v}`}
                            style={[s.gridline, { top: yForValue(v) }]}
                        />
                    ))}

                    <View
                        testID="deadly-sin-trend-y-axis"
                        style={[s.yAxis, { top: CHART_PADDING_TOP, height: plotHeight }]}
                    />
                    <View
                        testID="deadly-sin-trend-x-axis"
                        style={[s.xAxis, { top: CHART_PADDING_TOP + plotHeight }]}
                    />

                    {/* Lollipops: a thin stem topped by a dot for each round. */}
                    {values.map((v, i) => {
                        const stemHeight = v * yScale;
                        const cx = slotCentre(i);
                        return (
                            <React.Fragment key={`point-${i}`}>
                                <View
                                    testID={`deadly-sin-trend-stem-${i}`}
                                    style={[s.stem, {
                                        left: cx - 1,
                                        top: baseline - stemHeight,
                                        height: stemHeight,
                                    }]}
                                />
                                <View
                                    testID={`deadly-sin-trend-dot-${i}`}
                                    style={[s.dot, {
                                        left: cx - DOT_RADIUS,
                                        top: yForValue(v) - DOT_RADIUS,
                                    }]}
                                />
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>

            <View style={s.xAxisRow}>
                <View style={s.yAxisLabelSpacer} />
                <View style={[s.dateRow, { height: 16 }]}>
                    {rounds.map((r, i) => {
                        if (!shownDateLabels.has(i)) return null;
                        const centered = slotCentre(i) - DATE_LABEL_WIDTH / 2;
                        const left = Math.max(0, Math.min(centered, chartWidth - DATE_LABEL_WIDTH));
                        return (
                            <Text
                                key={`date-${i}`}
                                testID={`deadly-sin-trend-date-${i}`}
                                numberOfLines={1}
                                style={[s.dateLabel, {
                                    position: 'absolute',
                                    width: DATE_LABEL_WIDTH,
                                    left,
                                }]}
                            >
                                {r.Created_At}
                            </Text>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

// One full-screen-width page: heading + chart (or empty state) + narrative for a single sin.
function SinTrendPage({ category, rounds, width }: { category: DeadlySinCategory; rounds: DeadlySinsRound[]; width: number }) {
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
                        <BarChart rounds={rounds} sinKey={key} />
                        <Text testID="deadly-sin-trend-narrative" style={s.narrative}>
                            {narrative}
                        </Text>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

export default function DeadlySinTrendScreen() {
    const { sinKey, filter } = useLocalSearchParams<{ sinKey: string; label: string; filter?: string }>();
    const styles = useStyles();
    const width = Dimensions.get('window').width;

    const allRounds = getAllDeadlySinsRoundsService();
    const limit = filter === '1' ? 1 : filter === '10' ? 10 : MAX_ROUNDS;
    const rounds = allRounds.slice().reverse().slice(-limit);

    // Pages follow the same frequency order shown in the Deadly Sins bar chart.
    const categories = sortDeadlySinsByFrequency(rounds);
    const initialIndex = Math.max(0, categories.findIndex(c => c.key === sinKey));
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const listRef = useRef<FlatList<typeof categories[number]>>(null);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        if (index !== activeIndex) setActiveIndex(index);
    };

    return (
        <GestureHandlerRootView style={styles.scrollContainer}>
            <FlatList
                testID="deadly-sin-trend-pager"
                ref={listRef}
                data={categories}
                keyExtractor={(c) => c.key as string}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                onMomentumScrollEnd={onScroll}
                renderItem={({ item }) => (
                    <SinTrendPage category={item} rounds={rounds} width={width} />
                )}
            />
            <View testID="deadly-sin-trend-indicators" style={styles.pagerDotRow}>
                {categories.map((c, i) => (
                    <View
                        key={c.key as string}
                        testID={`deadly-sin-trend-indicator-${i}`}
                        style={[styles.pagerDot, i === activeIndex && styles.pagerDotActive]}
                    />
                ))}
            </View>
        </GestureHandlerRootView>
    );
}
