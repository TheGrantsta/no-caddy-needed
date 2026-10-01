import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { useLagPuttingSimulation } from '@/hooks/useLagPuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import ChallengeNumberPicker from '@/components/ChallengeNumberPicker';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useEffect, useRef } from 'react';
import Chevrons from '@/components/Chevrons';

const setupPoints: string[] = ['Place tee 1 in the ground', 'Tee 2 21\' away', 'Tee 3 a further 9\' away'];

const howToPlayPoints: string[] = ['First putt must reach tee 2', 'Each following putt must advance past the previous ball & stop before tee 3', 'Count how many putts land successfully in sequence before one fails'];

type PerformanceBand = 'pro' | 'scratch' | 'single' | 'mid' | 'beginner';

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; minScore: number; color: string }> = {
    pro: { label: 'Pro', minScore: 6, color: '#00C851' },
    scratch: { label: 'Scratch', minScore: 4, color: '#4A7C59' },
    single: { label: 'Single-digit', minScore: 3, color: '#6B9B7F' },
    mid: { label: 'Mid Handicap', minScore: 2, color: '#8CBBA4' },
    beginner: { label: 'Beginner', minScore: 0, color: '#ADCFC9' },
};

export default function LagPutting() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const sim = useLagPuttingSimulation();
    const hasSaved = useRef(false);

    const bandDefinitions = [
        { key: 'pro' as const, threshold: 6 },
        { key: 'scratch' as const, threshold: 4 },
        { key: 'single' as const, threshold: 3 },
        { key: 'mid' as const, threshold: 2 },
        { key: 'beginner' as const, threshold: 0 },
    ];

    const userBandKey = resolveBand(sim.score, bandDefinitions, 'gte');

    // Auto-save when completing
    useEffect(() => {
        if (sim.phase === 'complete' && !hasSaved.current) {
            hasSaved.current = true;
            insertDrillResultService('Lag Putting', sim.score >= 6, null, sim.score);
        }
    }, [sim.phase, sim.score]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Lag Putting Challenge</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <Text style={styles.subHeaderText}>Total putts</Text>
                                <ChallengeNumberPicker
                                    value={sim.score}
                                    onChange={sim.setScore}
                                    min={0}
                                    max={15}
                                    decreaseTestID="decrease-score-button"
                                    increaseTestID="increase-score-button"
                                    displayTestID="score-display"
                                />

                                <TouchableOpacity
                                    testID="submit-button"
                                    style={[styles.onboardingOverlay.primaryButton, { marginBottom: 32 }]}
                                    onPress={sim.submit}
                                >
                                    <Text style={styles.onboardingOverlay.primaryButtonText}>Finish</Text>
                                </TouchableOpacity>

                                <Chevrons heading='Set up' points={setupPoints} />

                                <Chevrons heading='How to play' points={howToPlayPoints} />

                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <ChallengeCompleteView
                            title="Challenge complete"
                            summary={
                                <View style={{ marginBottom: 8, paddingVertical: 16, paddingHorizontal: 12, backgroundColor: colours.background, borderRadius: 8, borderWidth: 1, borderColor: colours.primary }}>
                                    <Text style={styles.subHeaderText}>Result</Text>
                                    <Text style={styles.subHeaderText}>Score: {sim.score}</Text>
                                </View>
                            }
                            bands={Object.entries(PERFORMANCE_BANDS)
                                .sort((a, b) => b[1].minScore - a[1].minScore)
                                .map(([key, band]) => ({
                                    key,
                                    label: band.label,
                                    thresholdLabel: `≥ ${band.minScore}`,
                                    color: band.color,
                                }))}
                            userBandKey={userBandKey}
                            onPlayAgain={sim.reset}
                        />
                    )}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
