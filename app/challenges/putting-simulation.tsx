import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { usePuttingSimulation } from '@/hooks/usePuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';
import { useEffect, useRef } from 'react';

type PerformanceBand = 'pro' | 'd1' | 'scratch' | '5hcp' | '10hcp' | '15hcp';

interface BandInfo {
  label: string;
  maxPutts: number;
  color: string;
}

const PERFORMANCE_BANDS: Record<PerformanceBand, BandInfo> = {
  pro: { label: 'PGA Pro', maxPutts: 28, color: '#00C851' },
  d1: { label: 'D1 College', maxPutts: 31, color: '#2D5A3D' },
  scratch: { label: 'Scratch', maxPutts: 34, color: '#4A7C59' },
  '5hcp': { label: '5 Handicap', maxPutts: 37, color: '#6B9B7F' },
  '10hcp': { label: '10 Handicap', maxPutts: 40, color: '#8CBBA4' },
  '15hcp': { label: '15 Handicap', maxPutts: 999, color: '#ADCFC9' },
};

export default function PuttingSimulation() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const sim = usePuttingSimulation();
    const hasSaved = useRef(false);

    const totalPutts = sim.putts.reduce((sum, p) => sum + p, 0);

    const getPerformanceBand = (): PerformanceBand => {
        if (totalPutts <= 28) return 'pro';
        if (totalPutts <= 31) return 'd1';
        if (totalPutts <= 34) return 'scratch';
        if (totalPutts <= 37) return '5hcp';
        if (totalPutts <= 40) return '10hcp';
        return '15hcp';
    };

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

                                {/* Number picker for putts */}
                                <View style={[styles.navRow, { marginVertical: 24, justifyContent: 'center', alignItems: 'center' }]}>
                                    <TouchableOpacity
                                        testID="decrease-putts-button"
                                        onPress={() => sim.setPutts(sim.currentPutts - 1)}
                                        disabled={sim.currentPutts <= 1}
                                    >
                                        <MaterialIcons
                                            name="remove-circle"
                                            size={40}
                                            color={sim.currentPutts <= 1 ? colours.gray : colours.primary}
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 20 }}>
                                        <Text testID="putt-count-display" style={styles.headerText}>
                                            {sim.currentPutts} {sim.currentPutts === 1 ? 'putt' : 'putts'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        testID="increase-putts-button"
                                        onPress={() => sim.setPutts(sim.currentPutts + 1)}
                                        disabled={sim.currentPutts >= 5}
                                    >
                                        <MaterialIcons
                                            name="add-circle"
                                            size={40}
                                            color={sim.currentPutts >= 5 ? colours.gray : colours.primary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Navigation buttons - match Play section style */}
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
                                            sim.holeNumber === 1 && { opacity: 0.5 },
                                        ]}
                                        onPress={sim.goToPreviousHole}
                                        disabled={sim.holeNumber === 1}
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
                                        onPress={sim.goToNextHole}
                                    >
                                        <Text style={[styles.normalText, { color: colours.white, fontWeight: '600' }]}>
                                            {sim.holeNumber === sim.totalHoles ? 'Finish' : 'Next'}
                                        </Text>
                                        <MaterialIcons
                                            name={sim.holeNumber === sim.totalHoles ? 'check' : 'chevron-right'}
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
                            <Text style={styles.headerText}>Simulation complete</Text>

                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <View style={{ marginBottom: 32 }}>
                                    <Text style={[styles.normalText, { color: colours.gray, marginBottom: 8 }]}>Total putts</Text>
                                    <Text style={styles.subHeaderText}>{totalPutts}</Text>
                                </View>

                                {/* Performance bands */}
                                <Text style={[styles.normalText, { color: colours.gray, marginBottom: 16 }]}>Your level</Text>
                                {Object.entries(PERFORMANCE_BANDS).map(([key, band]) => {
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
                                                ≤ {band.maxPutts}
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
