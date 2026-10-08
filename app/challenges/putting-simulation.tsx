import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { usePuttingSimulation } from '@/hooks/usePuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useAppToast } from '@/hooks/useAppToast';
import ChallengeNumberPicker from '@/components/ChallengeNumberPicker';
import ChallengeNavButtons from '@/components/ChallengeNavButtons';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const router = useRouter();
    const sim = usePuttingSimulation();
    const { showResult } = useAppToast();
    const hasSaved = useRef(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    const totalPutts = sim.putts.reduce((sum, p) => sum + p, 0);

    const handleBack = useCallback(() => {
        if (sim.phase === 'in-progress') {
            setShowQuitConfirm(true);
        } else {
            router.back();
        }
    }, [sim.phase, router]);

    const handleConfirmQuit = useCallback(() => {
        setShowQuitConfirm(false);
        router.back();
    }, [router]);

    const handlePlayAgain = useCallback(() => {
        hasSaved.current = false;
        sim.reset();
    }, [sim]);

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
            showResult(true, 'Result saved', '');
        }
    }, [sim.phase, sim.makesCount, sim.expectedTourMakes, totalPutts, showResult]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {/* Back button */}
                    {sim.phase !== 'complete' && (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={{ padding: 12, alignItems: 'flex-start', marginBottom: 8 }}
                            testID="back-button"
                        >
                            <Text style={{ color: colours.primary, fontWeight: '600' }}>← Back</Text>
                        </TouchableOpacity>
                    )}

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
                            onPlayAgain={handlePlayAgain}
                        />
                    )}

                    {/* Quit confirmation */}
                    {showQuitConfirm && (
                        <View style={{ gap: 16, marginTop: 20 }}>
                            <View style={{ alignItems: 'center', gap: 8 }}>
                                <Text style={[styles.headerText]}>Quit challenge?</Text>
                                <Text style={[styles.subHeaderText, { color: colours.text }]}>Your progress will not be saved</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                                <TouchableOpacity
                                    testID="cancel-quit-button"
                                    onPress={() => setShowQuitConfirm(false)}
                                    style={styles.mediumButton}
                                >
                                    <Text style={{ color: colours.white, fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="confirm-quit-button"
                                    onPress={handleConfirmQuit}
                                    style={[styles.mediumButton, { backgroundColor: colours.red }]}
                                >
                                    <Text style={{ color: colours.white, fontWeight: '600' }}>Quit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
