import React, { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { DeadlySinsRound } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';

const CHART_HEIGHT = 200;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 32;
const DATE_LABEL_WIDTH = 40;
const DOT_RADIUS = 4;

function buildTicks(maxValue: number): number[] {
    if (maxValue <= 0) return [0];
    const step = maxValue <= 6 ? 1 : Math.ceil(maxValue / 6);
    const ticks: number[] = [];
    for (let v = 0; v <= maxValue; v += step) ticks.push(v);
    return ticks;
}

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

type BarChartProps = {
    rounds: DeadlySinsRound[];
    sinKey: keyof DeadlySinsRound;
};

export default function DeadlySinBarChart({ rounds, sinKey }: BarChartProps) {
    const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 62);
    const styles = useStyles();
    const s = styles.deadlySinTrend;

    const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const baseline = CHART_PADDING_TOP + plotHeight;
    const values = rounds.map(r => r[sinKey] as number);
    const maxValue = Math.max(...values, 0);
    const yScale = maxValue > 0 ? plotHeight / (maxValue + 1) : 1;

    const slotWidth = chartWidth / rounds.length;
    const slotCentre = (i: number) => slotWidth * (i + 0.5);
    const yForValue = (v: number) => CHART_PADDING_TOP + plotHeight - v * yScale;

    const ticks = buildTicks(maxValue);
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
