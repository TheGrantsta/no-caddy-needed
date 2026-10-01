import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useShortPuttingLadderSimulation } from '@/hooks/useShortPuttingLadderSimulation';
import { insertDrillResultService } from '@/service/DbService';
import ChallengeNumberPicker from '@/components/ChallengeNumberPicker';
import ChallengeNavButtons from '@/components/ChallengeNavButtons';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useEffect, useRef } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; maxAttempts: number; color: string }> = {
    pro: { label: 'Pro', maxAttempts: 11, color: '#00C851' },
    d1: { label: 'D1 College', maxAttempts: 13, color: '#2D5A3D' },
    scratch: { label: 'Scratch', maxAttempts: 15, color: '#4A7C59' },
    '5hcp': { label: '5 Handicap', maxAttempts: 17, color: '#6B9B7F' },
    '10hcp': { label: '10 Handicap', maxAttempts: 19, color: '#8CBBA4' },
    '15hcp': { label: '15 Handicap', maxAttempts: 100, color: '#ADCFC9' },
};

export default function ShortPuttingLadder() {
    const styles = useStyles();
    const colours = useThemeColours();
    const sim = useShortPuttingLadderSimulation();
    const hasSaved = useRef(false);

    const bandDefinitions = [
        { key: 'pro' as const, threshold: 11 },
        { key: 'd1' as const, threshold: 13 },
        { key: 'scratch' as const, threshold: 15 },
        { key: '5hcp' as const, threshold: 17 },
        { key: '10hcp' as const, threshold: 19 },
        { key: '15hcp' as const, threshold: 100 },
    ];

    const userBandKey = resolveBand(sim.totalAttempts, bandDefinitions, 'lte');

    // Auto-save when round completes
    useEffect(() => {
        if (sim.phase === 'complete' && !hasSaved.current) {
            hasSaved.current = true;
            insertDrillResultService('Short-Putting Ladder', sim.totalAttempts <= 11, null, sim.totalAttempts);
        }
    }, [sim.phase, sim.totalAttempts]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Level {sim.levelIndex + 1} of {sim.levelCount}</Text>

                            {/* Main content container with padding */}
                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24, gap: 8 }}>
                                    <Text style={styles.subHeaderText}>Distance</Text>
                                    <Text style={styles.subHeaderText}>{sim.currentLevel} ft</Text>
                                </View>

                                <Text style={[styles.subHeaderText, { marginBottom: 16 }]}>Putts</Text>
                                <ChallengeNumberPicker
                                    value={sim.currentResult}
                                    onChange={sim.setResult}
                                    min={1}
                                    max={10}
                                    decreaseTestID="decrease-result-button"
                                    increaseTestID="increase-result-button"
                                    displayTestID="result-display"
                                />

                                <ChallengeNavButtons
                                    onPrevious={sim.goToPreviousLevel}
                                    onNext={sim.levelIndex === sim.levelCount - 1 ? sim.finish : sim.goToNextLevel}
                                    previousDisabled={sim.levelIndex === 0}
                                    isLastStep={sim.levelIndex === sim.levelCount - 1}
                                />
                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <ChallengeCompleteView
                            title="Challenge complete"
                            summary={
                                <View style={{ marginBottom: 8, paddingVertical: 16, paddingHorizontal: 12, backgroundColor: colours.background, borderRadius: 8, borderWidth: 1, borderColor: colours.primary }}>
                                    <Text style={styles.subHeaderText}>Result</Text>
                                    <Text style={styles.subHeaderText}>Total attempts: {sim.totalAttempts}</Text>
                                </View>
                            }
                            bands={Object.entries(PERFORMANCE_BANDS)
                                .sort((a, b) => b[1].maxAttempts - a[1].maxAttempts)
                                .map(([key, band]) => ({
                                    key,
                                    label: band.label,
                                    thresholdLabel: `≤ ${band.maxAttempts === 100 ? '18+' : band.maxAttempts}`,
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
