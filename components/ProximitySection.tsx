import React, { useMemo } from 'react';
import { Animated, Text, View } from 'react-native';
import PuttingProximityChart from './PuttingProximityChart';
import StatsEmptyState from './StatsEmptyState';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { getPuttingProximityService } from '../service/DbService';
import fontSizes from '../assets/font-sizes';
import AppSwitch from './AppSwitch';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    proximityThreePuttOnly: boolean;
    onProximityFilterChange: (value: boolean) => void;
    filteredRoundIds?: Set<number>;
    onStartRound?: () => void;
}

export default function ProximitySection({
    fadeAnim,
    slideAnim,
    proximityThreePuttOnly,
    onProximityFilterChange,
    filteredRoundIds,
    onStartRound,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    // Read once per change of filter or rounds, and used for both the empty check and the chart
    const proximity = useMemo(
        () => getPuttingProximityService(proximityThreePuttOnly, filteredRoundIds),
        [proximityThreePuttOnly, filteredRoundIds]
    );
    const hasProximityData = proximity.length > 0 && proximity.some((row) => row.shortPercent !== '-' || row.longPercent !== '-');

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {hasProximityData ? (
                <View testID="proximity-card" style={styles.deadlySinsChart.card}>
                    <Text testID="proximity-heading" style={[styles.subHeaderText, { padding: 0 }]}>Proximity</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text testID="proximity-filter-label" style={{ color: colours.black, fontSize: fontSizes.normal }}>
                            Show 3-putts only
                        </Text>
                        <AppSwitch
                            testID="proximity-filter-toggle"
                            value={proximityThreePuttOnly}
                            onValueChange={onProximityFilterChange}
                        />
                    </View>

                    <View style={{ marginTop: 12 }}>
                        <PuttingProximityChart data={proximity} />
                    </View>

                    <Text style={[styles.smallText, { marginTop: 12 }]}>
                        Where your missed first putts finish. "3-Putts Only" counts just the holes where you three-putted.
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.divider} />

                    {filteredRoundIds && filteredRoundIds.size === 0 ? (
                        <StatsEmptyState onStartRound={onStartRound} />
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 16 }}>
                                <Text testID="proximity-filter-label" style={{ color: colours.black, fontSize: fontSizes.normal }}>
                                    Show 3-putts only
                                </Text>
                                <AppSwitch
                                    testID="proximity-filter-toggle"
                                    value={proximityThreePuttOnly}
                                    onValueChange={onProximityFilterChange}
                                />
                            </View>
                            <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                                {proximityThreePuttOnly ? 'No 3-putts in selected rounds' : 'No putting data for selected rounds'}
                            </Text>
                        </>
                    )}
                </>
            )}
        </Animated.View>
    );
}
