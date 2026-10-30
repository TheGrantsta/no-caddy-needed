import React from 'react';
import { Animated, Text, View } from 'react-native';
import DeadlySinsChart from './DeadlySinsChart';
import { useStyles } from '../hooks/useStyles';
import { getAllDeadlySinsRoundsService } from '../service/DbService';
import StatsEmptyState from './StatsEmptyState';

interface Props {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    roundsFilter: 1 | 10 | 'all';
    filteredRoundIds: Set<number>;
    onStartRound?: () => void;
}

export default function DeadlySinsSection({
    fadeAnim,
    slideAnim,
    roundsFilter,
    filteredRoundIds,
    onStartRound,
}: Props) {
    const styles = useStyles();

    const deadlySinsRounds = getAllDeadlySinsRoundsService();
    const filteredDeadlySinsRounds = roundsFilter === 'all'
        ? deadlySinsRounds
        : deadlySinsRounds.filter(r => r.RoundId != null && filteredRoundIds.has(r.RoundId as number));

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }], marginTop: 20 }]}>
            {filteredDeadlySinsRounds.length > 0 && !filteredDeadlySinsRounds.every(r => r.Total === 0) ? (
                <DeadlySinsChart rounds={filteredDeadlySinsRounds} filter={roundsFilter} />
            ) : (
                <>
                    <View style={styles.divider} />

                    {filteredDeadlySinsRounds.length === 0 ? (
                        <StatsEmptyState onStartRound={onStartRound} />
                    ) : (
                        <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                            No deadly sins data for selected rounds
                        </Text>
                    )}
                </>
            )}
        </Animated.View>
    );
}
