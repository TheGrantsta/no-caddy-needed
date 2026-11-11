import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { useStyles } from '@/hooks/useStyles';
import { useConfirmBeforeLeaving } from '@/hooks/useConfirmBeforeLeaving';
import { useThemeColours } from '@/context/ThemeContext';
import { useUpAndDownSimulation } from '@/hooks/useUpAndDownSimulation';
import { insertDrillResultService, getSettingsService } from '@/service/DbService';
import { yardsToDisplayUnit, distanceUnitLabel } from '@/service/UnitsService';
import { useAppToast } from '@/hooks/useAppToast';
import SimulationAppBar from '@/components/SimulationAppBar';
import SimulationDistanceCard from '@/components/SimulationDistanceCard';
import SimulationShotTiles from '@/components/SimulationShotTiles';
import SimulationHoleBar from '@/components/SimulationHoleBar';
import EndRoundSheet from '@/components/EndRoundSheet';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; minPercentage: number; color: string }> = {
    pro: { label: 'PGA Pro', minPercentage: 80, color: '#00C851' },
    d1: { label: 'D1 College', minPercentage: 70, color: '#2D5A3D' },
    scratch: { label: 'Scratch', minPercentage: 60, color: '#4A7C59' },
    '5hcp': { label: '5 Handicap', minPercentage: 50, color: '#6B9B7F' },
    '10hcp': { label: '10 Handicap', minPercentage: 40, color: '#8CBBA4' },
    '15hcp': { label: '15 Handicap', minPercentage: 30, color: '#ADCFC9' },
};

// Shot-count tiles; the last tile stands for 4 or more shots
const SHOT_OPTIONS = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' },
];

// A hole counts as up-and-down when it was finished in two shots or fewer
const UP_AND_DOWN_MAX_SHOTS = 2;

export default function UpAndDownChallenge() {
    const styles = useStyles();
    const colours = useThemeColours();
    const navigation = useNavigation();
    const sim = useUpAndDownSimulation();
    const { units } = getSettingsService();
    const { showResult } = useAppToast();
    const hasSaved = useRef(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [showEndSheet, setShowEndSheet] = useState(false);
    const { leave } = useConfirmBeforeLeaving(sim.phase === 'in-progress', () => setShowQuitConfirm(true));

    // The screen draws its own app bar, so the stack header is hidden
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleConfirmQuit = () => {
        setShowQuitConfirm(false);
        leave();
    };

    const handlePlayAgain = () => {
        hasSaved.current = false;
        sim.reset();
    };

    const handleEndPress = () => {
        if (sim.phase === 'complete') {
            leave();
            return;
        }
        setShowEndSheet(true);
    };

    // Holes entered so far, including the one on screen (its shot count is already recorded)
    const holesEntered = sim.holeNumber;
    const shotsEntered = sim.shots.slice(0, holesEntered);
    const upAndDownsEntered = shotsEntered.filter(shots => shots <= UP_AND_DOWN_MAX_SHOTS).length;
    const rateEntered = Math.round((upAndDownsEntered / holesEntered) * 100);

    // Save records the holes entered so far as the up-and-down rate, then leaves
    const handleSaveProgress = () => {
        setShowEndSheet(false);
        insertDrillResultService('Up-and-down Challenge', false, null, rateEntered);
        showResult(true, 'Result saved', '');
        leave();
    };

    const handleDiscardProgress = () => {
        setShowEndSheet(false);
        leave();
    };

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
            <SimulationAppBar
                title="Up-and-down"
                onEnd={handleEndPress}
                hole={sim.phase === 'in-progress' ? { current: sim.holeNumber, total: sim.totalHoles } : undefined}
            />
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: 140 }]}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <SimulationDistanceCard
                                label="DISTANCE"
                                distance={yardsToDisplayUnit(sim.currentDistance, units)}
                                unit={distanceUnitLabel(units)}
                            />
                            <SimulationShotTiles
                                sectionLabel="SHOTS TAKEN"
                                options={SHOT_OPTIONS}
                                selected={sim.currentShots}
                                onSelect={sim.setShots}
                                testIDPrefix="shots-option"
                            />
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
