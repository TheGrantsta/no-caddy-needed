import { challengeTierColours } from '@/assets/colours';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { useStyles } from '@/hooks/useStyles';
import { useConfirmBeforeLeaving } from '@/hooks/useConfirmBeforeLeaving';
import { useThemeColours } from '@/context/ThemeContext';
import { useShortPuttingLadderSimulation } from '@/hooks/useShortPuttingLadderSimulation';
import { insertDrillResultService } from '@/service/DbService';
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

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; maxAttempts: number; color: string }> = {
    pro: { label: 'Pro', maxAttempts: 11, color: challengeTierColours.pro },
    d1: { label: 'D1 College', maxAttempts: 13, color: challengeTierColours.d1 },
    scratch: { label: 'Scratch', maxAttempts: 15, color: challengeTierColours.scratch },
    '5hcp': { label: '5 Handicap', maxAttempts: 17, color: challengeTierColours.handicap5 },
    '10hcp': { label: '10 Handicap', maxAttempts: 19, color: challengeTierColours.handicap10 },
    '15hcp': { label: '15 Handicap', maxAttempts: 100, color: challengeTierColours.handicap15 },
};

// Attempt tiles; the last tile stands for 4 or more attempts
const ATTEMPT_OPTIONS = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' },
];

export default function ShortPuttingLadder() {
    const styles = useStyles();
    const colours = useThemeColours();
    const navigation = useNavigation();
    const sim = useShortPuttingLadderSimulation();
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

    // Levels entered so far, including the one on screen (its attempts are already recorded)
    const levelsEntered = sim.levelIndex + 1;
    const attemptsEntered = sim.results.slice(0, levelsEntered).reduce((sum, attempts) => sum + attempts, 0);

    // Save records the attempts so far, then leaves
    const handleSaveProgress = () => {
        setShowEndSheet(false);
        insertDrillResultService('Short-Putting Ladder', false, null, attemptsEntered);
        showResult(true, 'Result saved', '');
        leave();
    };

    const handleDiscardProgress = () => {
        setShowEndSheet(false);
        leave();
    };

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
            showResult(true, 'Result saved', '');
        }
    }, [sim.phase, sim.totalAttempts, showResult]);

    const isLastLevel = sim.levelIndex === sim.levelCount - 1;

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <SimulationAppBar
                title="Short putting"
                onEnd={handleEndPress}
                hole={sim.phase === 'in-progress' ? { current: levelsEntered, total: sim.levelCount } : undefined}
                unitLabel="Level"
            />
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: 140 }]}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <SimulationDistanceCard label="PUTT FROM" distance={sim.currentLevel} unit="ft" />
                            <SimulationShotTiles
                                sectionLabel="PUTTS TAKEN"
                                options={ATTEMPT_OPTIONS}
                                selected={sim.currentResult}
                                onSelect={sim.setResult}
                                testIDPrefix="attempts-option"
                            />
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
                            onPlayAgain={handlePlayAgain}
                        />
                    )}

                    {/* Quit confirmation */}
                    {showQuitConfirm && (
                        <View style={{ gap: 16, marginTop: 20 }}>
                            <View style={{ alignItems: 'center', gap: 8 }}>
                                <Text style={[styles.headerText]}>Quit challenge?</Text>
                                <Text style={[styles.subHeaderText, { color: colours.black }]}>Your progress will not be saved</Text>
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
                    holeNumber={levelsEntered}
                    totalHoles={sim.levelCount}
                    unitLabel="Level"
                    onPrevious={sim.goToPreviousLevel}
                    onNext={isLastLevel ? sim.finish : sim.goToNextLevel}
                />
            )}
            <EndRoundSheet
                visible={showEndSheet}
                holeNumber={levelsEntered}
                holesTotal={sim.levelCount}
                title={`End simulation after level ${levelsEntered}?`}
                message={`You’ve entered ${levelsEntered} of ${sim.levelCount} levels. Saved results are added to your drill history.`}
                saveLabel="Save progress"
                discardLabel="Discard progress"
                onSave={handleSaveProgress}
                onDiscard={handleDiscardProgress}
                onKeepPlaying={() => setShowEndSheet(false)}
            />
        </GestureHandlerRootView>
    );
}
