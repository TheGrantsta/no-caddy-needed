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
        const makes = sim.results.filter(r => r === 1).length;
        if (makes <= 8) return 'pro';
        if (makes <= 10) return 'd1';
        if (makes <= 12) return 'scratch';
        if (makes <= 15) return '5hcp';
        if (makes <= 18) return '10hcp';
        return '15hcp';
    };

    // Auto-save when round completes
    useEffect(() => {
        if (sim.phase === 'complete' && !hasSaved.current) {
            hasSaved.current = true;
            insertDrillResultService('Short-Putting Ladder', sim.totalMakes >= 5, null, sim.totalMakes);
        }
    }, [sim.phase, sim.totalMakes]);

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Level {sim.levelIndex + 1} of {sim.levelCount}</Text>

                            {/* Main content container with padding */}
                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24, gap: 8 }}>
                                    <Text style={styles.subHeaderText}>Distance</Text>
                                    <Text style={styles.subHeaderText}>{sim.currentLevel} ft</Text>
                                </View>

                                {/* Result picker for make/miss */}
                                <View style={[styles.navRow, { marginVertical: 24, justifyContent: 'center', alignItems: 'center' }]}>
                                    <TouchableOpacity
                                        testID="decrease-result-button"
                                        onPress={() => sim.setResult(0)}
                                        disabled={sim.currentResult === 0}
                                    >
                                        <MaterialIcons
                                            name="remove-circle"
                                            size={40}
                                            color={sim.currentResult === 0 ? colours.gray : colours.primary}
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 20 }}>
                                        <Text testID="result-display" style={styles.headerText}>
                                            {sim.currentResult === 1 ? 'Make' : 'Miss'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        testID="increase-result-button"
                                        onPress={() => sim.setResult(1)}
                                        disabled={sim.currentResult === 1}
                                    >
                                        <MaterialIcons
                                            name="add-circle"
                                            size={40}
                                            color={sim.currentResult === 1 ? colours.gray : colours.primary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Navigation buttons - match other challenges style */}
                                <View style={[styles.navRow, { gap: 12, marginTop: 24 }]}>
                                    <TouchableOpacity
                                        testID="previous-button"
                                        style={[
                                            {
                                                flex: 1,
                                                borderWidth: 2,
                                                borderColor: colours.primary,
                                                borderRadius: 8,
                                                paddingVertical: 14,
                                                paddingHorizontal: 16,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                gap: 8,
                                            },
                                            sim.levelIndex === 0 && { opacity: 0.5 },
                                        ]}
                                        onPress={sim.goToPreviousLevel}
                                        disabled={sim.levelIndex === 0}
                                    >
                                        <MaterialIcons name="chevron-left" size={24} color={colours.primary} />
                                        <Text style={[styles.normalText, { color: colours.primary, fontWeight: '600' }]}>
                                            Previous
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="next-button"
                                        style={{
                                            flex: 1,
                                            backgroundColor: colours.primary,
                                            borderRadius: 8,
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            gap: 8,
                                        }}
                                        onPress={sim.levelIndex === sim.levelCount - 1 ? sim.finish : sim.goToNextLevel}
                                    >
                                        <Text style={[styles.normalText, { color: colours.white, fontWeight: '600' }]}>
                                            {sim.levelIndex === sim.levelCount - 1 ? 'Finish' : 'Next'}
                                        </Text>
                                        <MaterialIcons
                                            name={sim.levelIndex === sim.levelCount - 1 ? 'check' : 'chevron-right'}
                                            size={24}
                                            color={colours.white}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <>
                            <Text style={styles.headerText}>Challenge complete</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ marginBottom: 32, paddingVertical: 20, paddingHorizontal: 16, backgroundColor: colours.background, borderRadius: 8, borderWidth: 1, borderColor: colours.gray }}>
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 12 }]}>Results</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.subHeaderText}>{sim.totalMakes} makes</Text>
                                        <Text style={[styles.normalText, { color: colours.gray }]}>
                                            {sim.results.length} {sim.results.length === 1 ? 'level' : 'levels'}
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
