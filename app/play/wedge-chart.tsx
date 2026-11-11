import { useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WedgeChart, { WedgeChartHandle } from '../../components/WedgeChart';
import WedgeChartReadList from '../../components/WedgeChartReadList';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import { getWedgeChartService, saveWedgeChartService, WedgeChartData, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import { useToggle } from '../../hooks/useToggle';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

export default function WedgeChartScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const router = useRouter();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const [data, setData] = useState(getWedgeChartService());
    const settings = getSettingsService();
    const chartIsEmpty = data.clubs.length === 0;
    const [showOnboarding, , setShowOnboarding] = useToggle(!settings.wedgeChartOnboardingSeen && chartIsEmpty);
    const [editing, setEditing] = useState(false);
    const chartRef = useRef<WedgeChartHandle>(null);

    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const currentSettings = getSettingsService();
        await saveSettingsService({ ...currentSettings, wedgeChartOnboardingSeen: true });
    };

    const handleSave = async (chartData: WedgeChartData) => {
        const saved = await saveWedgeChartService(chartData);
        if (saved) {
            setData(chartData);
            setEditing(false);
        }
        showResult(saved, 'Wedge chart saved', 'Failed to save wedge chart');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View testID="wedge-content" style={styles.wedgeChart.content}>
                {editing ? (
                    <View style={styles.wedgeChart.topBar}>
                        <TouchableOpacity
                            testID="wedge-cancel-button"
                            accessibilityRole="button"
                            onPress={() => setEditing(false)}
                            style={styles.wedgeChart.editButton}
                        >
                            <Text style={styles.wedgeChart.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.wedgeChart.title}>Wedge Chart</Text>
                        <TouchableOpacity
                            testID="wedge-done-button"
                            accessibilityRole="button"
                            onPress={() => chartRef.current?.save()}
                            style={styles.wedgeChart.doneButton}
                        >
                            <Text style={styles.wedgeChart.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.wedgeChart.topBar}>
                        <TouchableOpacity
                            testID="wedge-back-button"
                            accessibilityRole="button"
                            accessibilityLabel="Back"
                            onPress={() => router.back()}
                            style={styles.wedgeChart.backButton}
                        >
                            <MaterialIcons name="chevron-left" size={28} color={colours.black} />
                        </TouchableOpacity>
                        <Text style={styles.wedgeChart.title}>Wedge Chart</Text>
                        <TouchableOpacity
                            testID="wedge-edit-button"
                            accessibilityRole="button"
                            onPress={() => setEditing(true)}
                            style={styles.wedgeChart.editButton}
                        >
                            <Text style={styles.wedgeChart.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {editing ? (
                    <WedgeChart ref={chartRef} key={data.clubs.length} data={data} onSave={handleSave} units={settings.units} />
                ) : (
                    <>
                        <Text style={styles.wedgeChart.sectionLabel}>Carry by swing length</Text>
                        {chartIsEmpty ? (
                            <Text testID="wedge-empty" style={styles.wedgeChart.emptyText}>
                                No wedges yet. Tap Edit to add your wedges.
                            </Text>
                        ) : (
                            <WedgeChartReadList data={data} units={settings.units} />
                        )}
                    </>
                )}

                <Text style={styles.wedgeChart.footnote}>Carry distance, not total</Text>
                </View>

            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Wedge Chart"
                steps={ONBOARDING_STEPS.wedgeChart}
            />
        </GestureHandlerRootView>
    );
}
