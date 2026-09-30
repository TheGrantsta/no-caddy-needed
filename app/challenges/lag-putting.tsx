import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

    // Auto-save when drill completes
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
                            <Text style={styles.headerText}>Putt {sim.puttNumber} of 6+</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                {sim.puttNumber === 1 ? (
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 32 }]}>
                                        Reach Tee 2 (7 paces)
                                    </Text>
                                ) : (
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 32 }]}>
                                        Stop before Tee 3, past ball {sim.puttNumber - 1}
                                    </Text>
                                )}

                                <Text style={[styles.normalText, { color: colours.gray, marginBottom: 16 }]}>
                                    Successful putts: {sim.score}
                                </Text>

                                <View style={[styles.navRow, { gap: 12, marginTop: 24 }]}>
                                    <TouchableOpacity
                                        testID="in-window-button"
                                        style={{
                                            flex: 1,
                                            backgroundColor: colours.primary,
                                            borderRadius: 8,
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onPress={sim.recordInWindow}
                                    >
                                        <Text style={[styles.normalText, { color: colours.white, fontWeight: '600' }]}>
                                            {sim.puttNumber === 1 ? 'Reached' : 'In window'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.navRow, { gap: 12, marginTop: 12 }]}>
                                    <TouchableOpacity
                                        testID="short-button"
                                        style={{
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: colours.primary,
                                            borderRadius: 8,
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onPress={sim.recordShortOfPrevious}
                                    >
                                        <Text style={[styles.normalText, { color: colours.primary, fontWeight: '600' }]}>
                                            {sim.puttNumber === 1 ? 'Short of Tee 2' : 'Short of ball'}
                                        </Text>
                                    </TouchableOpacity>
                                    {sim.puttNumber > 1 && (
                                        <TouchableOpacity
                                            testID="past-tee3-button"
                                            style={{
                                                flex: 1,
                                                borderWidth: 2,
                                                borderColor: colours.primary,
                                                borderRadius: 8,
                                                paddingVertical: 14,
                                                paddingHorizontal: 16,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={sim.recordPastTee3}
                                        >
                                            <Text style={[styles.normalText, { color: colours.primary, fontWeight: '600' }]}>
                                                Past Tee 3
                                            </Text>
                                        </TouchableOpacity>
                                    )}
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
