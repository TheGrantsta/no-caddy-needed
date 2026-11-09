import React from 'react';
import { Animated, Text, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { getPuttingMakeRatesService } from '../service/DbService';
import { formatPgaRate } from '../assets/pgaPuttingBenchmarks';
import StatsEmptyState from './StatsEmptyState';
import fontSizes from '../assets/font-sizes';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    filteredRoundIds?: Set<number>;
    onStartRound?: () => void;
}

// A percentage such as "75%" or "91%*" as a number; anything without a number (e.g. "-") is 0
const percentOf = (text: string): number => {
    const value = parseInt(text, 10);
    return Number.isFinite(value) ? value : 0;
};

// Putting make rates on a card like the Deadly sins chart: one row per distance, with a bar for the
// player's make rate and the PGA Tour rate beside it
export default function PuttingStatsSection({
    fadeAnim,
    slideAnim,
    filteredRoundIds,
    onStartRound,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.deadlySinsChart;

    const rates = getPuttingMakeRatesService(filteredRoundIds);
    const hasPersonalPuttingData = rates.some((row) => row.makeRate !== '-');

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {hasPersonalPuttingData ? (
                <View style={s.card}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Putting</Text>

                    <View style={{ marginTop: 12 }}>
                        {rates.map((row) => (
                            <View key={row.distance} testID={`putting-row-${row.distance}`} style={s.barContainer}>
                                <View testID={`putting-label-${row.distance}`} style={[s.labelContainer, { width: 64 }]}>
                                    <Text style={[s.label, { fontSize: fontSizes.normal }]}>{`${row.distance} ft`}</Text>
                                </View>
                                <View style={s.barWrapper}>
                                    <View
                                        testID={`putting-bar-${row.distance}`}
                                        style={[s.bar, { width: `${percentOf(row.makeRate)}%`, backgroundColor: colours.primary }]}
                                    />
                                    <View style={[s.barBackground, { width: `${100 - percentOf(row.makeRate)}%` }]} />
                                    <View
                                        testID={`putting-pga-marker-${row.distance}`}
                                        style={[styles.pgaMarker, { left: `${percentOf(formatPgaRate(row.distance))}%` }]}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.smallestText, { marginTop: 8 }]}>
                        Gold marker shows the PGA tour rates
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.divider} />

                    {filteredRoundIds && filteredRoundIds.size === 0 ? (
                        <StatsEmptyState onStartRound={onStartRound} />
                    ) : (
                        <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                            No putting data for selected rounds
                        </Text>
                    )}
                </>
            )}
        </Animated.View>
    );
}
