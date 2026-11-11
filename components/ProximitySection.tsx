import React from 'react';
import { Animated, Switch, Text, View } from 'react-native';
import PuttingProximityChart from './PuttingProximityChart';
import StatsEmptyState from './StatsEmptyState';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { getPuttingProximityService } from '../service/DbService';
import fontSizes from '../assets/font-sizes';

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

    const hasProximityData = (threePuttOnly: boolean, roundIds?: Set<number>): boolean => {
        const proximity = getPuttingProximityService(threePuttOnly, roundIds);
        return proximity.length > 0 && proximity.some((row) => row.shortPercent !== '-' || row.longPercent !== '-');
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View testID="proximity-card" style={styles.deadlySinsChart.card}>
                <Text testID="proximity-heading" style={[styles.subHeaderText, { padding: 0 }]}>Proximity</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text testID="proximity-filter-label" style={{ color: colours.black, fontSize: fontSizes.normal }}>
                        Show 3-putts only
                    </Text>
                    <Switch
                        testID="proximity-filter-toggle"
                        value={proximityThreePuttOnly}
                        onValueChange={onProximityFilterChange}
                        trackColor={{ false: colours.tertiary, true: colours.primary }}
                    />
                </View>

                {hasProximityData(proximityThreePuttOnly, filteredRoundIds) ? (
                    <>
                        <View style={{ marginTop: 12 }}>
                            <PuttingProximityChart data={getPuttingProximityService(proximityThreePuttOnly, filteredRoundIds)} />
                        </View>

                        <Text style={[styles.smallText, { marginTop: 12 }]}>
                            Where your missed first putts finish. "3-Putts Only" counts just the holes where you three-putted.
                        </Text>
                    </>
                ) : (
                    filteredRoundIds && filteredRoundIds.size === 0 ? (
                        <StatsEmptyState onStartRound={onStartRound} />
                    ) : (
                        <Text style={[styles.normalText, { marginTop: 12 }]}>
                            {proximityThreePuttOnly ? 'No 3-putts in selected rounds' : 'No putting data for selected rounds'}
                        </Text>
                    )
                )}
            </View>
        </Animated.View>
    );
}
