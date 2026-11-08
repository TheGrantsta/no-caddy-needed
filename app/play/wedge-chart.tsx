import { useState } from 'react';
import { ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WedgeChart from '../../components/WedgeChart';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import WedgeChartHeader from '../../components/WedgeChartHeader';
import { getWedgeChartService, saveWedgeChartService, WedgeChartData, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import { useToggle } from '../../hooks/useToggle';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

export default function WedgeChartScreen() {
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const [data, setData] = useState(getWedgeChartService());
    const settings = getSettingsService();
    const chartIsEmpty = data.clubs.length === 0;
    const [showOnboarding, , setShowOnboarding] = useToggle(!settings.wedgeChartOnboardingSeen && chartIsEmpty);

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
            setData(chartData);
        }
        showResult(saved, 'Wedge chart saved', 'Failed to save wedge chart');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <WedgeChartHeader onInfoPress={handleShowOnboarding} />

                <WedgeChart key={data.clubs.length} data={data} onSave={handleSave} units={settings.units} />

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
