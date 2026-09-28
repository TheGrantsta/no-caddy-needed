import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import WindDisplay from './WindDisplay';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    holePhase: 'score' | 'stats' | 'sinDetails' | 'putting';
    currentHole: number;
    isLastHole: boolean;
    skipStatsFlow: boolean;
    onPreviousHole: () => Promise<void>;
    onNextHole: () => Promise<void>;
    onEndRound: () => void;
    wind?: { directionFrom?: string; speedMph?: number };
    heading?: number;
}

export default function HoleNavigationControls({
    holePhase,
    currentHole,
    isLastHole,
    skipStatsFlow,
    onPreviousHole,
    onNextHole,
    onEndRound,
    wind,
    heading,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const localStyles = styles.playScreen;

    return (
        <View>
            <View style={localStyles.navigationButtonsContainer}>
                {holePhase === 'score' && currentHole > 1 && (
                    <TouchableOpacity
                        testID="previous-hole-button"
                        onPress={onPreviousHole}
                        style={localStyles.previousHoleButton}
                    >
                        <MaterialIcons name="skip-previous" size={18} color={colours.primary} />
                        <Text style={localStyles.previousHoleButtonText}>Previous</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    testID="next-hole-button"
                    onPress={onNextHole}
                    style={localStyles.nextHoleButton}
                >
                    <Text style={localStyles.nextHoleButtonText}>
                        {holePhase === 'putting' || (holePhase === 'score' && skipStatsFlow) ? (isLastHole ? 'Finish' : 'Next') : 'Next'}
                    </Text>
                    <MaterialIcons
                        name={(holePhase === 'putting' || (holePhase === 'score' && skipStatsFlow)) && isLastHole ? 'sports-score' : 'skip-next'}
                        size={18}
                        color={colours.background}
                    />
                </TouchableOpacity>
            </View>

            {holePhase === 'score' && (wind?.directionFrom || wind?.speedMph) && (
                <View style={styles.contentSection}>
                    <WindDisplay
                        directionFrom={wind?.directionFrom ?? null}
                        speedMph={wind?.speedMph ?? null}
                        heading={heading}
                        compact
                    />
                </View>
            )}

            {holePhase === 'score' && (
                <TouchableOpacity
                    testID="end-round-button"
                    onPress={onEndRound}
                    style={{ padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}
                >
                    <Text style={localStyles.endRoundLink}>End round</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
