import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import WindDisplay from './WindDisplay';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

interface Props {
    currentHole: number;
    isLastHole: boolean;
    onPreviousHole: () => Promise<void>;
    onNextHole: () => Promise<void>;
    wind?: { directionFrom?: string; speedMph?: number };
    heading?: number;
}

export default function HoleNavigationControls({
    currentHole,
    isLastHole,
    onPreviousHole,
    onNextHole,
    wind,
    heading,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const localStyles = styles.playScreen;

    return (
        <View>
            <View testID="hole-nav-bar" style={styles.holeScreen.bottomBar}>
            <View style={localStyles.navigationButtonsContainer}>
                {currentHole > 1 && (
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
                        {isLastHole ? 'Finish' : 'Next'}
                    </Text>
                    <MaterialIcons
                        name={isLastHole ? 'sports-score' : 'skip-next'}
                        size={18}
                        color={colours.background}
                    />
                </TouchableOpacity>
            </View>
            </View>

            {(wind?.directionFrom || wind?.speedMph) && (
                <View style={styles.contentSection}>
                    <WindDisplay
                        directionFrom={wind?.directionFrom ?? null}
                        speedMph={wind?.speedMph ?? null}
                        heading={heading}
                        compact
                    />
                </View>
            )}

        </View>
    );
}
