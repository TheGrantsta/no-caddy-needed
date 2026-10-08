import React from 'react';
import { Animated, Switch, Text, View } from 'react-native';
import PuttingProximityChart from './PuttingProximityChart';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import { getPuttingProximityService } from '../service/DbService';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    proximityThreePuttOnly: boolean;
    onProximityFilterChange: (value: boolean) => void;
    filteredRoundIds?: Set<number>;
}

export default function ProximitySection({
    fadeAnim,
    slideAnim,
    proximityThreePuttOnly,
    onProximityFilterChange,
    filteredRoundIds,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const hasProximityData = (threePuttOnly: boolean, roundIds?: Set<number>): boolean => {
        const proximity = getPuttingProximityService(threePuttOnly, roundIds);
        return proximity.length > 0 && proximity.some((row) => row.shortPercent !== '-' || row.longPercent !== '-');
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 20, gap: 8 }}>
                <Text testID="proximity-filter-label" style={{ color: colours.primary, fontSize: 16 }}>
                    Show 3-Putts Only
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
                    <PuttingProximityChart data={getPuttingProximityService(proximityThreePuttOnly, filteredRoundIds)} />

                    <Text style={[styles.normalText, styles.marginTop, { alignSelf: 'center' }]}>
                        Where your missed first putts finish
                    </Text>
                </>
            ) : (
                <>
                    <View style={styles.divider} />

                    <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                        {filteredRoundIds && filteredRoundIds.size === 0
                            ? 'Complete a round to see stats'
                            : proximityThreePuttOnly
                            ? 'No 3-putts in selected rounds'
                            : 'No putting data for selected rounds'}
                    </Text>
                </>
            )}
        </Animated.View>
    );
}
