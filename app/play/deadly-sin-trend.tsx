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

    return (
        <View testID="deadly-sin-trend-chart" style={s.chartWrapper}>
            <View style={s.chartRow}>
                <View
                    style={[s.chartArea, { height: CHART_HEIGHT }]}
                    onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                >
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
                <View style={s.dateRow}>
                    {rounds.map((r, i) => (
                        <Text
                            key={`date-${i}`}
                            testID={`deadly-sin-trend-date-${i}`}
                            style={s.dateLabel}
                        >
                            {r.Created_At}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
}

export default function DeadlySinTrendScreen() {
    const { sinKey, label } = useLocalSearchParams<{ sinKey: string; label: string }>();
    const styles = useStyles();
    const s = styles.deadlySinTrend;

    const allRounds = getAllDeadlySinsRoundsService();
    const rounds = allRounds.slice().reverse().slice(-MAX_ROUNDS);

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
