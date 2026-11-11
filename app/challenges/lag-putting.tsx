import { challengeTierColours } from '@/assets/colours';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStyles } from '@/hooks/useStyles';
import { useConfirmBeforeLeaving } from '@/hooks/useConfirmBeforeLeaving';
import { useThemeColours } from '@/context/ThemeContext';
import { useLagPuttingSimulation } from '@/hooks/useLagPuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useAppToast } from '@/hooks/useAppToast';
import SimulationAppBar from '@/components/SimulationAppBar';
import SimulationDistanceCard from '@/components/SimulationDistanceCard';
import Dropdown from '@/components/Dropdown';
import EndRoundSheet from '@/components/EndRoundSheet';
import ChallengeCompleteView from '@/components/ChallengeCompleteView';
import { resolveBand } from '@/utils/performanceBands';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import ExpandableInfoCard from '@/components/ExpandableInfoCard';

const setupPoints: string[] = ['Place tee 1 in the ground', 'Tee 2 21\' away', 'Tee 3 a further 9\' away'];

const howToPlayPoints: string[] = ['First putt must reach tee 2', 'Each following putt must stop past the previous ball & before tee 3', 'Count successful putts in sequence before one fails'];

type PerformanceBand = 'pro' | 'scratch' | 'single' | 'mid' | 'beginner';

// Total putts run 0–30
const SCORE_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i));

const PERFORMANCE_BANDS: Record<PerformanceBand, { label: string; minScore: number; color: string }> = {
    pro: { label: 'Pro', minScore: 6, color: challengeTierColours.pro },
    scratch: { label: 'Scratch', minScore: 4, color: challengeTierColours.scratch },
    single: { label: 'Single-digit', minScore: 3, color: challengeTierColours.handicap5 },
    mid: { label: 'Mid Handicap', minScore: 2, color: challengeTierColours.handicap10 },
    beginner: { label: 'Beginner', minScore: 0, color: challengeTierColours.handicap15 },
};

export default function LagPutting() {
    const styles = useStyles();
    const colours = useThemeColours();
    const navigation = useNavigation();
    const sim = useLagPuttingSimulation();
    const { bottom: bottomInset } = useSafeAreaInsets();
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

    // Save records the score chosen so far, then leaves
    const handleSaveScore = () => {
        setShowEndSheet(false);
        insertDrillResultService('Lag Putting', sim.score >= 6, null, sim.score);
        showResult(true, 'Result saved', '');
        leave();
    };

    const handleDiscardScore = () => {
        setShowEndSheet(false);
        leave();
    };

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
            showResult(true, 'Result saved', '');
        }
    }, [sim.phase, sim.score, showResult]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <SimulationAppBar title="Lag putting" onEnd={handleEndPress} />
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: 140 }]}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <SimulationDistanceCard label="TOTAL PUTTS" distance={sim.score} unit="putts" />
                            <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                                <Text style={styles.subHeaderText}>Total putts</Text>
                                <Dropdown
                                    options={SCORE_OPTIONS}
                                    selectedOption={String(sim.score)}
                                    onSelectOption={(value) => sim.setScore(Number(value))}
                                    testIDPrefix="score"
                                />
                            </View>

                            {/* Quit confirmation */}
                            {showQuitConfirm && (
                                <View style={{ gap: 16, marginTop: 20, marginHorizontal: 20 }}>
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

                            <View style={{ gap: 12, marginTop: 24 }}>
                                <ExpandableInfoCard icon="tune" title="Setup" points={setupPoints} testIDPrefix="setup" />
                                <ExpandableInfoCard icon="sports-golf" title="How to play" points={howToPlayPoints} testIDPrefix="how-to-play" />
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
                            onPlayAgain={handlePlayAgain}
                        />
                    )}
                </View>
            </ScrollView>

            {sim.phase === 'in-progress' && (
                <View style={[styles.simulation.submitBar, { bottom: 16 + bottomInset }]}>
                    <TouchableOpacity testID="submit-button" accessibilityRole="button" onPress={sim.submit} style={styles.simulation.submitButton}>
                        <Text style={styles.simulation.submitText}>Submit</Text>
                        <MaterialIcons name="check" size={20} color={colours.white} />
                    </TouchableOpacity>
                </View>
            )}
            <EndRoundSheet
                visible={showEndSheet}
                holeNumber={0}
                holesTotal={0}
                title="End lag putting?"
                message={`Your score of ${sim.score} putts hasn’t been submitted yet. Saved results are added to your drill history.`}
                saveLabel="Save score"
                discardLabel="Discard score"
                onSave={handleSaveScore}
                onDiscard={handleDiscardScore}
                onKeepPlaying={() => setShowEndSheet(false)}
            />
        </GestureHandlerRootView>
    );
}
