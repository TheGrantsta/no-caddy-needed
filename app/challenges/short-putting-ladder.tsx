import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { useShortPuttingLadderSimulation } from '@/hooks/useShortPuttingLadderSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useEffect, useRef } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

interface BandInfo {
    label: string;
    maxAttempts: number;
    color: string;
}

const PERFORMANCE_BANDS: Record<PerformanceBand, BandInfo> = {
    '15hcp': { label: '15 Handicap', maxAttempts: Infinity, color: '#ADCFC9' },
    '10hcp': { label: '10 Handicap', maxAttempts: 18, color: '#8CBBA4' },
    '5hcp': { label: '5 Handicap', maxAttempts: 15, color: '#6B9B7F' },
    scratch: { label: 'Scratch', maxAttempts: 12, color: '#4A7C59' },
    d1: { label: 'D1 College', maxAttempts: 10, color: '#2D5A3D' },
    pro: { label: 'Pro', maxAttempts: 8, color: '#00C851' },
};

export default function ShortPuttingLadder() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const sim = useShortPuttingLadderSimulation();
    const hasSaved = useRef(false);

    const getPerformanceBand = (): PerformanceBand => {
        if (sim.totalAttempts <= 8) return 'pro';
        if (sim.totalAttempts <= 10) return 'd1';
        if (sim.totalAttempts <= 12) return 'scratch';
        if (sim.totalAttempts <= 15) return '5hcp';
        if (sim.totalAttempts <= 18) return '10hcp';
        return '15hcp';
    };

    // Auto-save when round completes
    useEffect(() => {
        if (sim.phase === 'complete' && !hasSaved.current) {
            hasSaved.current = true;
            insertDrillResultService('Short-Putting Ladder', sim.levelReached === 10, null, sim.totalAttempts);
        }
    }, [sim.phase, sim.levelReached, sim.totalAttempts]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Ladder Challenge</Text>

                            {/* Main content container with padding */}
                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24, gap: 8 }}>
                                    <Text style={styles.subHeaderText}>Distance</Text>
                                    <Text style={styles.subHeaderText}>{sim.currentLevel} ft</Text>
                                </View>

                                {/* Attempt counter */}
                                <View style={{ marginBottom: 32, paddingVertical: 16, paddingHorizontal: 12, backgroundColor: colours.background, borderRadius: 8 }}>
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 8 }]}>Attempts</Text>
                                    <Text style={styles.subHeaderText}>{sim.totalAttempts}</Text>
                                </View>

                                {/* Make/Miss buttons */}
                                <View style={[styles.navRow, { gap: 12, marginBottom: 24 }]}>
                                    <TouchableOpacity
                                        testID="miss-button"
                                        style={{
                                            flex: 1,
                                            backgroundColor: colours.background,
                                            borderWidth: 2,
                                            borderColor: colours.gray,
                                            borderRadius: 8,
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onPress={sim.recordMiss}
                                    >
                                        <Text style={[styles.normalText, { color: colours.gray, fontWeight: '600' }]}>
                                            Miss
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="make-button"
                                        style={{
                                            flex: 1,
                                            backgroundColor: colours.primary,
                                            borderRadius: 8,
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onPress={sim.recordMake}
                                    >
                                        <Text style={[styles.normalText, { color: colours.white, fontWeight: '600' }]}>
                                            Make
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Finish button */}
                                <TouchableOpacity
                                    testID="finish-button"
                                    style={[styles.onboardingOverlay.secondaryButton]}
                                    onPress={sim.finish}
                                >
                                    <Text style={styles.onboardingOverlay.secondaryButtonText}>Finish</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <>
                            <Text style={styles.headerText}>Challenge complete</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ marginBottom: 32, paddingVertical: 20, paddingHorizontal: 16, backgroundColor: colours.background, borderRadius: 8, borderWidth: 1, borderColor: colours.gray }}>
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 12 }]}>Final level</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.subHeaderText}>{sim.levelReached} ft</Text>
                                        <Text style={[styles.normalText, { color: colours.gray }]}>
                                            {sim.totalAttempts} {sim.totalAttempts === 1 ? 'attempt' : 'attempts'}
                                        </Text>
                                    </View>
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
                                                ≤ {band.maxAttempts === Infinity ? '18+' : band.maxAttempts}
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
