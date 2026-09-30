import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useAppToast } from '@/hooks/useAppToast';
import { usePuttingSimulation } from '@/hooks/usePuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';

export default function PuttingSimulation() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { showResult } = useAppToast();
    const sim = usePuttingSimulation();

    const handleSave = async () => {
        const passed = sim.makesCount >= sim.expectedTourMakes;
        const success = await insertDrillResultService('Putting Simulation', passed, null, sim.makesCount);
        showResult(success, 'Result saved', 'Result not saved');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Hole {sim.holeNumber} of {sim.totalHoles}</Text>

                            {/* Main content container with padding */}
                            <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                                <Text style={[styles.normalText, { color: colours.gray, marginBottom: 8 }]}>Distance</Text>
                                <Text style={[styles.subHeaderText, { marginBottom: 24 }]}>{sim.currentDistance} ft</Text>

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
                                            Next
                                        </Text>
                                        <MaterialIcons name="chevron-right" size={24} color={colours.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}

                    {sim.phase === 'complete' && (
                        <>
                            <Text style={styles.headerText}>Round complete</Text>
                            <Text style={styles.normalText}>You made {sim.makesCount} of {sim.totalHoles}</Text>
                            <Text style={styles.normalText}>PGA Tour average: {sim.expectedTourMakes.toFixed(1)}</Text>
                            <TouchableOpacity
                                testID="save-button"
                                style={styles.onboardingOverlay.primaryButton}
                                onPress={handleSave}
                            >
                                <Text style={styles.onboardingOverlay.primaryButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="try-again-button"
                                style={styles.onboardingOverlay.secondaryButton}
                                onPress={sim.reset}
                            >
                                <Text style={styles.onboardingOverlay.secondaryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}
