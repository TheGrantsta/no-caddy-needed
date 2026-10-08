import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useUpAndDownSimulation } from '@/hooks/useUpAndDownSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useAppToast } from '@/hooks/useAppToast';
import ChallengeNumberPicker from '@/components/ChallengeNumberPicker';
import ChallengeNavButtons from '@/components/ChallengeNavButtons';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useCallback, useEffect, useRef } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; minPercentage: number; color: string }> = {
    pro: { label: 'PGA Pro', minPercentage: 80, color: '#00C851' },
    d1: { label: 'D1 College', minPercentage: 70, color: '#2D5A3D' },
    scratch: { label: 'Scratch', minPercentage: 60, color: '#4A7C59' },
    '5hcp': { label: '5 Handicap', minPercentage: 50, color: '#6B9B7F' },
    '10hcp': { label: '10 Handicap', minPercentage: 40, color: '#8CBBA4' },
    '15hcp': { label: '15 Handicap', minPercentage: 30, color: '#ADCFC9' },
};

export default function UpAndDownChallenge() {
    const styles = useStyles();
    const colours = useThemeColours();
    const sim = useUpAndDownSimulation();
    const { showResult } = useAppToast();
    const hasSaved = useRef(false);

    const handlePlayAgain = useCallback(() => {
        hasSaved.current = false;
        sim.reset();
    }, [sim]);

    const bandDefinitions = [
        { key: 'pro' as const, threshold: 80 },
        { key: 'd1' as const, threshold: 70 },
        { key: 'scratch' as const, threshold: 60 },
        { key: '5hcp' as const, threshold: 50 },
        { key: '10hcp' as const, threshold: 40 },
        { key: '15hcp' as const, threshold: 0 },
    ];

    const userBandKey = resolveBand(sim.successPercentage, bandDefinitions, 'gte');

    // Auto-save when round completes
    useEffect(() => {
        if (sim.phase === 'complete' && !hasSaved.current) {
            hasSaved.current = true;
            insertDrillResultService('Up-and-down Challenge', sim.upAndDownCount >= 5, null, sim.successPercentage);
            showResult(true, 'Result saved', '');
        }
    }, [sim.phase, sim.upAndDownCount, sim.successPercentage, showResult]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Hole {sim.holeNumber} of {sim.totalHoles}</Text>

                            {/* Main content container with padding */}
                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24, gap: 8 }}>
                                    <Text style={styles.subHeaderText}>Distance</Text>
                                    <Text style={styles.subHeaderText}>{sim.currentDistance} yd</Text>
                                </View>

                                <ChallengeNumberPicker
                                    value={sim.currentShots}
                                    onChange={sim.setShots}
                                    min={1}
                                    max={4}
                                    decreaseTestID="decrease-shots-button"
                                    increaseTestID="increase-shots-button"
                                    displayTestID="shots-count-display"
                                    formatValue={(v) => `${v} shot${v !== 1 ? 's' : ''}`}
                                />

                                <ChallengeNavButtons
                                    onPrevious={sim.goToPreviousHole}
                                    onNext={sim.goToNextHole}
                                    previousDisabled={sim.holeNumber === 1}
                                    isLastStep={sim.holeNumber === sim.totalHoles}
                                />
                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <ChallengeCompleteView
                            title="Challenge complete"
                            summary={
                                <View style={{ marginBottom: 8, paddingVertical: 16, paddingHorizontal: 12, backgroundColor: colours.background, borderRadius: 8, borderWidth: 1, borderColor: colours.primary }}>
                                    <Text style={[styles.normalText, { color: colours.primary, marginBottom: 8 }]}>Up-and-down rate</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.subHeaderText}>{sim.successPercentage}%</Text>
                                        <Text style={[styles.normalText, { color: colours.primary }]}>
                                            {sim.upAndDownCount} of {sim.totalHoles}
                                        </Text>
                                    </View>
                                </View>
                            }
                            bands={Object.entries(PERFORMANCE_BANDS)
                                .sort((a, b) => b[1].minPercentage - a[1].minPercentage)
                                .map(([key, band]) => ({
                                    key,
                                    label: band.label,
                                    thresholdLabel: `≥ ${band.minPercentage}%`,
                                    color: band.color,
                                }))}
                            userBandKey={userBandKey}
                            onPlayAgain={handlePlayAgain}
                        />
                    )}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
