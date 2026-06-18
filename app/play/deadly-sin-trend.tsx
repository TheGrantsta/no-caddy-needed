import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { getAllDeadlySinsRoundsService, DeadlySinsRound } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';

const CHART_HEIGHT = 200;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 32;
const MAX_ROUNDS = 20;
const MAX_DATE_LABELS = 8;
const DATE_LABEL_WIDTH = 40;
const DOT_RADIUS = 4;
const ROLLING_WINDOW = 3;

// Integer tick values from 0..maxValue, stepping so we never show more than ~7 ticks.
function buildTicks(maxValue: number): number[] {
    if (maxValue <= 0) return [0];
    const step = maxValue <= 6 ? 1 : Math.ceil(maxValue / 6);
    const ticks: number[] = [];
    for (let v = 0; v <= maxValue; v += step) ticks.push(v);
    return ticks;
}

// Trailing rolling average over the last ROLLING_WINDOW rounds (fewer early on).
function rollingAverage(values: number[], window: number): number[] {
    return values.map((_, i) => {
        const start = Math.max(0, i - window + 1);
        const slice = values.slice(start, i + 1);
        return slice.reduce((sum, v) => sum + v, 0) / slice.length;
    });
}

const mean = (xs: number[]) => xs.reduce((sum, v) => sum + v, 0) / xs.length;

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
    const trend = rollingAverage(values, ROLLING_WINDOW);

    // Show at most MAX_DATE_LABELS dates, always keeping the first and most recent.
    const labelStep = Math.max(1, Math.ceil(rounds.length / MAX_DATE_LABELS));
    const showDateLabel = (i: number) => i % labelStep === 0 || i === rounds.length - 1;

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

                    {/* Rolling-average trend line, drawn beneath the lollipops. */}
                    {trend.slice(0, -1).map((_, i) => {
                        const x1 = slotCentre(i);
                        const x2 = slotCentre(i + 1);
                        const y1 = yForValue(trend[i]);
                        const y2 = yForValue(trend[i + 1]);
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx);
                        return (
                            <View
                                key={`trend-${i}`}
                                testID={`deadly-sin-trend-trend-${i}`}
                                style={[s.trendLine, {
                                    left: (x1 + x2) / 2 - length / 2,
                                    top: (y1 + y2) / 2 - 1,
                                    width: length,
                                    transform: [{ rotate: `${angle}rad` }],
                                }]}
                            />
                        );
                    })}

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
                        if (!showDateLabel(i)) return null;
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

export default function DeadlySinTrendScreen() {
    const { sinKey, label, filter } = useLocalSearchParams<{ sinKey: string; label: string; filter?: string }>();
    const styles = useStyles();
    const s = styles.deadlySinTrend;

    const allRounds = getAllDeadlySinsRoundsService();
    const limit = filter === '1' ? 1 : filter === '10' ? 10 : MAX_ROUNDS;
    const rounds = allRounds.slice().reverse().slice(-limit);

    const key = sinKey as keyof DeadlySinsRound;
    const narrative = buildTrendNarrative(rounds.map(r => r[key] as number), label);

    return (
        <GestureHandlerRootView style={styles.scrollContainer}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <Text testID="deadly-sin-trend-heading" style={s.heading}>{label}</Text>
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
        </GestureHandlerRootView>
    );
}
