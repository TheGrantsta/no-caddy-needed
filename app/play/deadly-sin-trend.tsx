import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { getAllDeadlySinsRoundsService, DeadlySinsRound } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';

const CHART_HEIGHT = 200;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 32;
const DOT_RADIUS = 5;
const MAX_ROUNDS = 20;
const MAX_DATE_LABELS = 8;
const DATE_LABEL_WIDTH = 40;

// Integer tick values from 0..maxValue, stepping so we never show more than ~7 ticks.
function buildTicks(maxValue: number): number[] {
    if (maxValue <= 0) return [0];
    const step = maxValue <= 6 ? 1 : Math.ceil(maxValue / 6);
    const ticks: number[] = [];
    for (let v = 0; v <= maxValue; v += step) ticks.push(v);
    return ticks;
}

type LineChartProps = {
    rounds: DeadlySinsRound[];
    sinKey: keyof DeadlySinsRound;
};

function LineChart({ rounds, sinKey }: LineChartProps) {
    const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 62);
    const styles = useStyles();
    const s = styles.deadlySinTrend;

    const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const values = rounds.map(r => r[sinKey] as number);
    const maxValue = Math.max(...values, 0);
    const yScale = maxValue > 0 ? plotHeight / (maxValue + 1) : 1;
    const xStep = chartWidth / Math.max(rounds.length - 1, 1);

    const xPos = (i: number) => i * xStep;
    const yPos = (i: number) => CHART_PADDING_TOP + plotHeight - values[i] * yScale;
    // Map an arbitrary value (e.g. a tick or the average) to a vertical position.
    const yForValue = (v: number) => CHART_PADDING_TOP + plotHeight - v * yScale;

    const ticks = buildTicks(maxValue);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;

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
                        testID="deadly-sin-trend-average-line"
                        style={[s.averageLine, { top: yForValue(average) }]}
                    />

                    <View
                        testID="deadly-sin-trend-y-axis"
                        style={[s.yAxis, { top: CHART_PADDING_TOP, height: plotHeight }]}
                    />
                    <View
                        testID="deadly-sin-trend-x-axis"
                        style={[s.xAxis, { top: CHART_PADDING_TOP + plotHeight }]}
                    />

                    {rounds.slice(0, -1).map((_, i) => {
                        const dx = xPos(i + 1) - xPos(i);
                        const dy = yPos(i + 1) - yPos(i);
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx);
                        return (
                            <View
                                key={`line-${i}`}
                                testID={`deadly-sin-trend-line-${i}`}
                                style={[s.line, {
                                    left: (xPos(i) + xPos(i + 1)) / 2 - length / 2,
                                    top: (yPos(i) + yPos(i + 1)) / 2 - 1,
                                    width: length,
                                    transform: [{ rotate: `${angle}rad` }],
                                }]}
                            />
                        );
                    })}

                    {rounds.map((_, i) => (
                        <React.Fragment key={`point-${i}`}>
                            <View
                                testID={`deadly-sin-trend-dot-${i}`}
                                style={[s.dot, {
                                    left: xPos(i) - DOT_RADIUS,
                                    top: yPos(i) - DOT_RADIUS,
                                }]}
                            />
                        </React.Fragment>
                    ))}
                </View>
            </View>

            <View style={s.xAxisRow}>
                <View style={s.yAxisLabelSpacer} />
                <View style={[s.dateRow, { height: 16 }]}>
                    {rounds.map((r, i) => {
                        if (!showDateLabel(i)) return null;
                        const centered = xPos(i) - DATE_LABEL_WIDTH / 2;
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

    return (
        <GestureHandlerRootView style={styles.scrollContainer}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <Text testID="deadly-sin-trend-heading" style={s.heading}>{label}</Text>
                {rounds.length === 0 ? (
                    <Text testID="deadly-sin-trend-empty" style={s.emptyText}>
                        No rounds recorded yet
                    </Text>
                ) : (
                    <LineChart rounds={rounds} sinKey={sinKey as keyof DeadlySinsRound} />
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}
