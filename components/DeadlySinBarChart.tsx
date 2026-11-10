import React, { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { DeadlySinsRound } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

const CHART_HEIGHT = 200;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 32;
const DATE_LABEL_WIDTH = 40;
const MAX_BAR_WIDTH = 22;
const STUB_HEIGHT = 4;
const HALO_PADDING = 4;

// Blend a hex colour over white so the halo is a solid tint rather than a translucent overlay
function tintOverWhite(hex: string, alpha: number): string {
    const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const mixed = channels.map(c => Math.round(c * alpha + 255 * (1 - alpha)));
    return `#${mixed.map(c => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
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

// One rounded bar per round, a short grey stub for a clean round, the latest round highlighted,
// a dashed line at the most recent maximum, and the 0 and maximum values on the right
export default function DeadlySinBarChart({ rounds, sinKey }: BarChartProps) {
    const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 62);
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.deadlySinTrend;

    const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const baseline = CHART_PADDING_TOP + plotHeight;
    const values = rounds.map(r => r[sinKey] as number);
    const maxValue = Math.max(...values, 0);
    const yScale = maxValue > 0 ? plotHeight / maxValue : 0;

    const slotWidth = chartWidth / rounds.length;
    const slotCentre = (i: number) => slotWidth * (i + 0.5);
    const barWidth = Math.min(MAX_BAR_WIDTH, slotWidth * 0.5);
    const yForValue = (v: number) => CHART_PADDING_TOP + plotHeight - v * yScale;

    const ticks = maxValue > 0 ? [0, maxValue] : [0];
    const shownDateLabels = selectDateLabelIndices(rounds.length, slotCentre, chartWidth, DATE_LABEL_WIDTH);
    const latestIndex = rounds.length - 1;

    return (
        <View testID="deadly-sin-trend-chart" style={s.chartWrapper}>
            <View style={[s.chartArea, { height: CHART_HEIGHT }]} onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
                {maxValue > 0 && (
                    <View
                        testID="deadly-sin-trend-max-line"
                        style={[s.maxLine, { top: yForValue(maxValue), borderColor: colours.tertiary + '66' }]}
                    />
                )}

                <View
                    testID="deadly-sin-trend-x-axis"
                    style={[s.xAxis, { top: baseline }]}
                />

                {values.map((v, i) => {
                    const cx = slotCentre(i);
                    if (v <= 0) {
                        return (
                            <View
                                key={`bar-${i}`}
                                testID={`deadly-sin-trend-stub-${i}`}
                                style={[s.barStub, {
                                    left: cx - barWidth / 2,
                                    top: baseline - STUB_HEIGHT,
                                    width: barWidth,
                                    height: STUB_HEIGHT,
                                    backgroundColor: colours.tertiary + '40',
                                }]}
                            />
                        );
                    }
                    const barHeight = v * yScale;
                    const isLatest = i === latestIndex;
                    return (
                        <React.Fragment key={`bar-${i}`}>
                            {isLatest && (
                                <View
                                    testID="deadly-sin-trend-halo"
                                    style={[s.barHalo, {
                                        left: Math.round(cx - barWidth / 2 - HALO_PADDING),
                                        top: Math.round(baseline - barHeight - HALO_PADDING),
                                        width: Math.round(barWidth + HALO_PADDING * 2),
                                        height: Math.round(barHeight + HALO_PADDING * 2),
                                        backgroundColor: tintOverWhite(colours.primary, 0.15),
                                    }]}
                                />
                            )}
                            <View
                                testID={`deadly-sin-trend-bar-${i}`}
                                style={[s.bar, {
                                    left: Math.round(cx - barWidth / 2),
                                    top: Math.round(baseline - barHeight),
                                    width: Math.round(barWidth),
                                    height: Math.round(barHeight),
                                    backgroundColor: colours.primary,
                                }]}
                            />
                        </React.Fragment>
                    );
                })}

                {ticks.map((v) => (
                    <Text
                        key={`y-label-${v}`}
                        testID={`deadly-sin-trend-y-label-${v}`}
                        style={[s.axisLabel, { position: 'absolute', right: 0, top: yForValue(v) - 9 }]}
                    >
                        {v}
                    </Text>
                ))}
            </View>

            <View style={s.xAxisRow}>
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
