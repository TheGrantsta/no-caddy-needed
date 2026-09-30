import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useAppToast } from '@/hooks/useAppToast';
import { usePuttingSimulation } from '@/hooks/usePuttingSimulation';
import { insertDrillResultService } from '@/service/DbService';

export default function PuttingSimulation() {
    const styles = useStyles();
    const { showResult } = useAppToast();
    const sim = usePuttingSimulation();

    const handleSave = async () => {
        const passed = sim.makesCount >= sim.expectedTourMakes;
        const success = await insertDrillResultService('PGA Putting Simulation', passed, null, sim.makesCount);
        showResult(success, 'Result saved', 'Result not saved');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.container}>
                    {sim.phase === 'in-progress' && (
                        <>
                            <Text style={styles.headerText}>Hole {sim.holeNumber} of {sim.totalHoles}</Text>
                            <Text style={styles.subHeaderText}>{sim.currentDistance} ft</Text>
                            <View style={styles.navRow}>
                                <TouchableOpacity
                                    testID="made-button"
                                    style={styles.onboardingOverlay.primaryButton}
                                    onPress={() => sim.recordPutt(true)}
                                >
                                    <Text style={styles.onboardingOverlay.primaryButtonText}>Made</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="missed-button"
                                    style={styles.onboardingOverlay.secondaryButton}
                                    onPress={() => sim.recordPutt(false)}
                                >
                                    <Text style={styles.onboardingOverlay.secondaryButtonText}>Missed</Text>
                                </TouchableOpacity>
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
