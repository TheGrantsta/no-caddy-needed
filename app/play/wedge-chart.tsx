import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import WedgeChart from '../../components/WedgeChart';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import { getWedgeChartService, saveWedgeChartService, WedgeChartData, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import fontSizes from '@/assets/font-sizes';

const ONBOARDING_STEPS = [
    { text: 'Your wedge chart helps you know exactly how far you hit each wedge with different swing lengths.' },
    { text: 'Add clubs (like PW, GW, SW, LW) and distance types (like Half, 3/4, Full) to build your chart.' },
    { text: 'Enter your carry distances for each combination to create a reference you can use on the course.' },
];

export default function WedgeChartScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const data = getWedgeChartService();
    const settings = getSettingsService();
    const chartIsEmpty = data.clubs.length === 0;
    const [showOnboarding, setShowOnboarding] = useState(!settings.wedgeChartOnboardingSeen && chartIsEmpty);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const currentSettings = getSettingsService();
        await saveSettingsService({ ...currentSettings, wedgeChartOnboardingSeen: true });
    };

    const handleShowOnboarding = () => {
        setShowOnboarding(true);
    };

    const handleSave = async (chartData: WedgeChartData) => {
        const saved = await saveWedgeChartService(chartData);
        showResult(saved, 'Wedge chart saved', 'Failed to save wedge chart');
    };

    const handleClear = async () => {
        const saved = await saveWedgeChartService({ distanceNames: [], clubs: [] });
        setShowClearConfirm(false);
        showResult(saved, 'Wedge chart cleared', 'Failed to clear wedge chart');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View style={styles.headerContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity
                            testID="info-button"
                            onPress={handleShowOnboarding}
                        >
                            <MaterialIcons name="info-outline" size={24} color={colours.yellow} />
                        </TouchableOpacity>
                        <Text style={[styles.headerText, styles.marginTop]}>Wedge chart</Text>
                    </View>
                    <Text style={[styles.normalText, styles.marginBottom]}>
                        Your wedge carry distances
                    </Text>
                </View>
                <WedgeChart data={data} onSave={handleSave} />

                {!chartIsEmpty && !showClearConfirm && (
                    <TouchableOpacity
                        testID="clear-button"
                        onPress={() => setShowClearConfirm(true)}
                        style={{ padding: 12, alignItems: 'center', marginTop: 20 }}
                    >
                        <Text style={{ color: colours.errorText, fontSize: fontSizes.normal }}>Clear all</Text>
                    </TouchableOpacity>
                )}

                {showClearConfirm && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                        <TouchableOpacity
                            testID="cancel-clear-button"
                            onPress={() => setShowClearConfirm(false)}
                            style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: colours.backgroundAlternate }}
                        >
                            <Text style={{ color: colours.text, fontSize: fontSizes.normal }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="confirm-clear-button"
                            onPress={handleClear}
                            style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: colours.errorText }}
                        >
                            <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Confirm clear</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Wedge Chart"
                steps={ONBOARDING_STEPS}
            />
        </GestureHandlerRootView>
    );
}
