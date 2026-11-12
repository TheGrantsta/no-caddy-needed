import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';
import WindPopover from './WindPopover';
import { isFirstHoleOfRound, nextHoleInRound, previousHoleInRound } from '@/utils/holeOrder';
import { NextStepButton, PreviousStepButton } from './StepButtons';

interface Props {
    currentHole: number;
    // The hole the round started on; Previous and Next follow the play order from it
    startHole?: number;
    isLastHole: boolean;
    onPreviousHole: () => Promise<void>;
    onNextHole: () => Promise<void>;
    wind?: { directionFrom: number; speedMph: number } | null;
    heading?: number;
}

// The floating hole bar: previous hole on the left; on the right, the wind button (when wind is known)
// and the next hole. The wind button opens the wind pop-up above the bar.
export default function HoleNavigationControls({
    currentHole,
    startHole = 1,
    isLastHole,
    onPreviousHole,
    onNextHole,
    wind,
    heading = 0,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const localStyles = styles.playScreen;
    const [windOpen, setWindOpen] = useState(false);

    const hasWind = wind != null && wind.directionFrom != null && wind.speedMph != null;

    const bar = (
        <View testID="hole-nav-bar" style={styles.holeScreen.bottomBar}>
            <View style={localStyles.holeBarRow}>
                <View testID="hole-nav-left" style={localStyles.holeBarLeft}>
                    {!isFirstHoleOfRound(currentHole, startHole) ? (
                        <PreviousStepButton
                            testID="previous-hole-button"
                            label={`Hole ${previousHoleInRound(currentHole, startHole)}`}
                            onPress={onPreviousHole}
                        />
                    ) : null}
                </View>
                <View testID="hole-nav-centre" style={localStyles.holeBarCentre}>
                    {hasWind ? (
                        <TouchableOpacity
                            testID="wind-overlay-button"
                            accessibilityRole="button"
                            accessibilityLabel="Show wind"
                            onPress={() => setWindOpen(open => !open)}
                            style={localStyles.holeBarWindButton}
                        >
                            <MaterialIcons name="air" size={20} color={colours.primary} />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <View testID="hole-nav-right" style={localStyles.holeBarRight}>
                    <NextStepButton
                        testID="next-hole-button"
                        label={isLastHole ? 'Finish' : `Hole ${nextHoleInRound(currentHole, startHole)}`}
                        icon={isLastHole ? 'sports-score' : 'chevron-right'}
                        onPress={onNextHole}
                    />
                </View>
            </View>
        </View>
    );

    if (!hasWind || !windOpen) return bar;

    return (
        <Modal transparent animationType="fade" visible onRequestClose={() => setWindOpen(false)}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                    testID="wind-overlay-backdrop"
                    accessibilityRole="button"
                    activeOpacity={1}
                    onPress={() => setWindOpen(false)}
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.35)' }]}
                />
                <View style={{ marginBottom: 8 }}>
                    <WindPopover directionFrom={wind!.directionFrom} speedMph={wind!.speedMph} heading={heading} />
                </View>
                {bar}
            </View>
        </Modal>
    );
}
