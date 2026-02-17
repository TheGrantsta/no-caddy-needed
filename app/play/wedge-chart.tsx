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
import { t } from '@/assets/i18n/i18n';

const ONBOARDING_STEPS = [
    { text: t('wedgeChart.onboardingStep1') },
    { text: t('wedgeChart.onboardingStep2') },
    { text: t('wedgeChart.onboardingStep3') },
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
        showResult(saved, t('wedgeChart.saved'), t('wedgeChart.saveFailed'));
    };

    const handleClear = async () => {
        const saved = await saveWedgeChartService({ distanceNames: [], clubs: [] });
        setShowClearConfirm(false);
        showResult(saved, t('wedgeChart.cleared'), t('wedgeChart.clearFailed'));
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
                        <Text style={[styles.headerText, styles.marginTop]}>{t('wedgeChart.title')}</Text>
                    </View>
                    <Text style={[styles.normalText, styles.marginBottom]}>
                        {t('wedgeChart.subtitle')}
                    </Text>
                </View>
                <WedgeChart data={data} onSave={handleSave} />

                {!chartIsEmpty && !showClearConfirm && (
                    <TouchableOpacity
                        testID="clear-button"
                        onPress={() => setShowClearConfirm(true)}
                        style={{ padding: 12, alignItems: 'center', marginTop: 20 }}
                    >
                        <Text style={{ color: colours.errorText, fontSize: fontSizes.normal }}>{t('common.clearAll')}</Text>
                    </TouchableOpacity>
                )}

                {showClearConfirm && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                        <TouchableOpacity
                            testID="cancel-clear-button"
                            onPress={() => setShowClearConfirm(false)}
                            style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: colours.backgroundAlternate }}
                        >
                            <Text style={{ color: colours.text, fontSize: fontSizes.normal }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="confirm-clear-button"
                            onPress={handleClear}
                            style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: colours.errorText }}
                        >
                            <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>{t('common.confirmClear')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title={t('wedgeChart.onboardingTitle')}
                steps={ONBOARDING_STEPS}
            />
        </GestureHandlerRootView>
    );
}
