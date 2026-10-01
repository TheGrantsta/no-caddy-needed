import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { usePuttingSimulation } from '@/hooks/usePuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import ChallengeNumberPicker from '@/components/ChallengeNumberPicker';
import ChallengeNavButtons from '@/components/ChallengeNavButtons';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useEffect, useRef } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; maxPutts: number; color: string }> = {
    pro: { label: 'PGA Pro', maxPutts: 29, color: '#00C851' },
    d1: { label: 'D1 College', maxPutts: 30, color: '#2D5A3D' },
    scratch: { label: 'Scratch', maxPutts: 31, color: '#4A7C59' },
    '5hcp': { label: '5 Handicap', maxPutts: 32, color: '#6B9B7F' },
    '10hcp': { label: '10 Handicap', maxPutts: 34, color: '#8CBBA4' },
    '15hcp': { label: '15 Handicap', maxPutts: 36, color: '#ADCFC9' },
};

export default function PuttingSimulation() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const sim = usePuttingSimulation();
    const hasSaved = useRef(false);

    const totalPutts = sim.putts.reduce((sum, p) => sum + p, 0);

    const bandDefinitions = [
        { key: 'pro' as const, threshold: 28 },
        { key: 'd1' as const, threshold: 31 },
        { key: 'scratch' as const, threshold: 34 },
        { key: '5hcp' as const, threshold: 37 },
        { key: '10hcp' as const, threshold: 40 },
        { key: '15hcp' as const, threshold: 100 },
    ];

    const userBandKey = resolveBand(totalPutts, bandDefinitions, 'lte');

    // Auto-save when round completes
    useEffect(() => {
        if (sim.phase === 'complete' && !hasSaved.current) {
            hasSaved.current = true;
            const passed = sim.makesCount >= sim.expectedTourMakes;
            insertDrillResultService('Putting Simulation', passed, null, totalPutts);
        }
    }, [sim.phase, sim.makesCount, sim.expectedTourMakes, totalPutts]);

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
                                    <Text style={styles.subHeaderText}>{sim.currentDistance} ft</Text>
                                </View>

                                <ChallengeNumberPicker
                                    value={sim.currentPutts}
                                    onChange={sim.setPutts}
                                    min={1}
                                    max={5}
                                    decreaseTestID="decrease-putts-button"
                                    increaseTestID="increase-putts-button"
                                    displayTestID="putt-count-display"
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
                            title="Simulation complete"
                            summary={
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={styles.subHeaderText}>Total putts</Text>
                                    <Text style={styles.subHeaderText}>{totalPutts}</Text>
                                </View>
                            }
                            bands={Object.entries(PERFORMANCE_BANDS).map(([key, band]) => ({
                                key,
                                label: band.label,
                                thresholdLabel: `≤ ${band.maxPutts}`,
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
