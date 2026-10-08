import { useState } from 'react';
import { ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WedgeChart from '../../components/WedgeChart';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import WedgeChartHeader from '../../components/WedgeChartHeader';
import ClearWedgeChartButton from '../../components/ClearWedgeChartButton';
import ClearWedgeChartConfirmation from '../../components/ClearWedgeChartConfirmation';
import { getWedgeChartService, saveWedgeChartService, WedgeChartData, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import { useToggle } from '../../hooks/useToggle';

const ONBOARDING_STEPS = [
    { text: 'Your wedge chart helps you know exactly how far you hit each wedge with different swing lengths.' },
    { text: 'Add clubs (like PW, GW, SW, LW) and distance types (like Half, 3/4, Full) to build your chart.' },
    { text: 'Enter your carry distances for each combination to create a reference you can use on the course.' },
];

export default function WedgeChartScreen() {
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const [data, setData] = useState(getWedgeChartService());
    const settings = getSettingsService();
    const chartIsEmpty = data.clubs.length === 0;
    const [showOnboarding, , setShowOnboarding] = useToggle(!settings.wedgeChartOnboardingSeen && chartIsEmpty);
    const [showClearConfirm, , setShowClearConfirm] = useToggle(false);

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

    const handleClear = async () => {
        const emptyData = { distanceNames: [], clubs: [] };
        const saved = await saveWedgeChartService(emptyData);
        setShowClearConfirm(false);
        if (saved) {
            setData(emptyData);
        }
        showResult(saved, 'Wedge chart cleared', 'Failed to clear wedge chart');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <WedgeChartHeader onInfoPress={handleShowOnboarding} />

                <WedgeChart key={data.clubs.length} data={data} onSave={handleSave} units={settings.units} />

                {!chartIsEmpty && !showClearConfirm && (
                    <ClearWedgeChartButton onPress={() => setShowClearConfirm(true)} />
                )}

                {showClearConfirm && (
                    <ClearWedgeChartConfirmation
                        onCancel={() => setShowClearConfirm(false)}
                        onConfirm={handleClear}
                    />
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
