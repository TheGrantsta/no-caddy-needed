import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';
import SimulationAppBar from '@/components/SimulationAppBar';
import SimulationDistanceCard from '@/components/SimulationDistanceCard';
import SimulationShotTiles from '@/components/SimulationShotTiles';
import SimulationHoleBar from '@/components/SimulationHoleBar';

import { useStyles } from '@/hooks/useStyles';
import { useConfirmBeforeLeaving } from '@/hooks/useConfirmBeforeLeaving';
import { useThemeColours } from '@/context/ThemeContext';
import { usePuttingSimulation } from '@/hooks/usePuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useAppToast } from '@/hooks/useAppToast';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import EndRoundSheet from '@/components/EndRoundSheet';
import { resolveBand } from '@/utils/performanceBands';
import { useCallback, useEffect, useRef, useState, useLayoutEffect } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

// Putt-count tiles; the last tile stands for 4 or more putts
const PUTT_OPTIONS = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' },
];

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
    const navigation = useNavigation();
    const sim = usePuttingSimulation();
    const { showResult } = useAppToast();
    const hasSaved = useRef(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const { leave } = useConfirmBeforeLeaving(sim.phase === 'in-progress', () => setShowQuitConfirm(true));
    const [showEndSheet, setShowEndSheet] = useState(false);

    const totalPutts = sim.putts.reduce((sum, p) => sum + p, 0);
    // Holes entered so far, including the one on screen (its putt count is already recorded)
    const holesEntered = sim.holeNumber;
    const puttsEntered = sim.putts.slice(0, holesEntered).reduce((sum, p) => sum + p, 0);

    // The screen draws its own app bar, so the stack header is hidden
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleEndPress = useCallback(() => {
        if (sim.phase === 'complete') {
            leave();
            return;
        }
        setShowEndSheet(true);
    }, [sim.phase, leave]);

    // Save records the holes entered so far, then leaves the simulation
    const handleSaveProgress = useCallback(() => {
        setShowEndSheet(false);
        if (puttsEntered > 0) {
            insertDrillResultService('Putting Simulation', false, null, puttsEntered);
            showResult(true, 'Result saved', '');
        }
        leave();
    }, [puttsEntered, showResult, leave]);

    const handleDiscardProgress = useCallback(() => {
        setShowEndSheet(false);
        leave();
    }, [leave]);

    const handleConfirmQuit = useCallback(() => {
        setShowQuitConfirm(false);
        leave();
    }, [leave]);

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
            <SimulationAppBar
                title="Putting sim"
                onEnd={handleEndPress}
                hole={sim.phase === 'in-progress' ? { current: sim.holeNumber, total: sim.totalHoles } : undefined}
            />
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: 140 }]}
            >
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <SimulationDistanceCard label="PUTT FROM" distance={sim.currentDistance} unit="ft" />
                            <SimulationShotTiles
                                sectionLabel="PUTTS TAKEN"
                                options={PUTT_OPTIONS}
                                selected={sim.currentPutts}
                                onSelect={sim.setPutts}
                                testIDPrefix="putts-option"
                            />
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
                                    testID="quit-challenge-cancel-button"
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
            {sim.phase === 'in-progress' && (
                <SimulationHoleBar
                    holeNumber={sim.holeNumber}
                    totalHoles={sim.totalHoles}
                    onPrevious={sim.goToPreviousHole}
                    onNext={sim.goToNextHole}
                />
            )}
            <EndRoundSheet
                visible={showEndSheet}
                holeNumber={holesEntered}
                holesTotal={sim.totalHoles}
                title={`End simulation after hole ${holesEntered}?`}
                message={`You’ve entered ${holesEntered} of ${sim.totalHoles} holes. Saved results are added to your drill history.`}
                saveLabel="Save progress"
                discardLabel="Discard progress"
                onSave={handleSaveProgress}
                onDiscard={handleDiscardProgress}
                onKeepPlaying={() => setShowEndSheet(false)}
            />
        </GestureHandlerRootView>
    );
}
