import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import WedgeChart from '../../components/WedgeChart';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import { getWedgeChartService, saveWedgeChartService, WedgeChartData, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useToast } from 'react-native-toast-notifications';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
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
    const toast = useToast();
    const data = getWedgeChartService();
    const settings = getSettingsService();
    const chartIsEmpty = data.clubs.length === 0;
    const [showOnboarding, setShowOnboarding] = useState(!settings.wedgeChartOnboardingSeen && chartIsEmpty);

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

        if (saved) {
            toast.show('Wedge chart saved', {
                type: 'success',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.green, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
        } else {
            toast.show('Failed to save wedge chart', {
                type: 'danger',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.errorText, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
        }
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
