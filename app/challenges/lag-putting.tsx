import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { useLagPuttingSimulation } from '@/hooks/useLagPuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useEffect, useRef } from 'react';

type PerformanceBand = 'beginner' | 'mid' | 'single' | 'scratch' | 'pro';

interface BandInfo {
    label: string;
    minScore: number;
    color: string;
}

const PERFORMANCE_BANDS: Record<PerformanceBand, BandInfo> = {
    beginner: { label: 'Beginner', minScore: 0, color: '#ADCFC9' },
    mid: { label: 'Mid Handicap', minScore: 2, color: '#8CBBA4' },
    single: { label: 'Single-digit', minScore: 3, color: '#6B9B7F' },
    scratch: { label: 'Scratch', minScore: 4, color: '#4A7C59' },
    pro: { label: 'Pro', minScore: 6, color: '#00C851' },
};

export default function LagPutting() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const sim = useLagPuttingSimulation();
    const hasSaved = useRef(false);

    const getPerformanceBand = (): PerformanceBand => {
        if (sim.score >= 6) return 'pro';
        if (sim.score >= 4) return 'scratch';
        if (sim.score >= 3) return 'single';
        if (sim.score >= 2) return 'mid';
        return 'beginner';
    };

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
                            <Text style={styles.headerText}>Lag Putting Drill</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <Text style={[styles.normalText, { color: colours.gray, marginBottom: 16 }]}>Total putts</Text>
                                <View style={[styles.navRow, { marginBottom: 32, justifyContent: 'center', alignItems: 'center' }]}>
                                    <TouchableOpacity
                                        testID="decrease-score-button"
                                        onPress={() => sim.setScore(sim.score - 1)}
                                        disabled={sim.score <= 0}
                                    >
                                        <MaterialIcons
                                            name="remove-circle"
                                            size={40}
                                            color={sim.score <= 0 ? colours.gray : colours.primary}
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 20 }}>
                                        <Text testID="score-display" style={styles.headerText}>
                                            {sim.score}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        testID="increase-score-button"
                                        onPress={() => sim.setScore(sim.score + 1)}
                                        disabled={sim.score >= 15}
                                    >
                                        <MaterialIcons
                                            name="add-circle"
                                            size={40}
                                            color={sim.score >= 15 ? colours.gray : colours.primary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    testID="submit-button"
                                    style={[styles.onboardingOverlay.primaryButton, { marginBottom: 32 }]}
                                    onPress={sim.submit}
                                >
                                    <Text style={styles.onboardingOverlay.primaryButtonText}>Finish</Text>
                                </TouchableOpacity>

                                <View style={{ paddingVertical: 16, paddingHorizontal: 12, backgroundColor: colours.background, borderRadius: 8 }}>
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 12 }]}>Task</Text>
                                    <Text style={[styles.normalText, { color: colours.text, marginBottom: 8 }]}>• Start at Tee 1</Text>
                                    <Text style={[styles.normalText, { color: colours.text, marginBottom: 8 }]}>• First putt must reach Tee 2 (~21 ft)</Text>
                                    <Text style={[styles.normalText, { color: colours.text, marginBottom: 8 }]}>• Each following putt must advance past the previous ball and stop before Tee 3 (~30 ft)</Text>
                                    <Text style={[styles.normalText, { color: colours.text }]}>• Count how many putts land successfully in sequence before one fails</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <>
                            <Text style={styles.headerText}>Challenge complete</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ marginBottom: 32, paddingVertical: 20, paddingHorizontal: 16, backgroundColor: colours.background, borderRadius: 8, borderWidth: 1, borderColor: colours.gray }}>
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 12 }]}>Result</Text>
                                    <Text style={styles.subHeaderText}>Score: {sim.score}</Text>
                                </View>

                                {/* Performance bands */}
                                <Text style={[styles.normalText, { color: colours.gray, marginBottom: 16 }]}>Your level</Text>
                                {Object.entries(PERFORMANCE_BANDS).reverse().map(([key, band]) => {
                                    const userBand = getPerformanceBand();
                                    const isUserBand = key === userBand;

                                    return (
                                        <View
                                            key={key}
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingVertical: 12,
                                                paddingHorizontal: 12,
                                                marginBottom: 8,
                                                backgroundColor: isUserBand ? band.color : 'transparent',
                                                borderRadius: 8,
                                                borderWidth: isUserBand ? 0 : 1,
                                                borderColor: colours.gray,
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.normalText,
                                                    {
                                                        color: isUserBand ? colours.white : colours.text,
                                                        fontWeight: isUserBand ? '600' : '400',
                                                    }
                                                ]}
                                            >
                                                {band.label}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.normalText,
                                                    {
                                                        color: isUserBand ? colours.white : colours.gray,
                                                        fontWeight: isUserBand ? '600' : '400',
                                                    }
                                                ]}
                                            >
                                                ≥ {band.minScore}
                                            </Text>
                                        </View>
                                    );
                                })}

                                {/* Play Again button */}
                                <TouchableOpacity
                                    testID="play-again-button"
                                    style={[styles.onboardingOverlay.primaryButton, { marginTop: 32 }]}
                                    onPress={sim.reset}
                                >
                                    <Text style={styles.onboardingOverlay.primaryButtonText}>Play Again</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
