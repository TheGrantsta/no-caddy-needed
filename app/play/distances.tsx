import { useState } from 'react';
import { ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ClubDistanceList from '../../components/ClubDistanceList';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import DistancesHeader from '../../components/DistancesHeader';
import ClearDistancesButton from '../../components/ClearDistancesButton';
import ClearDistancesConfirmation from '../../components/ClearDistancesConfirmation';
import { getClubDistancesService, saveClubDistancesService, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import { useToggle } from '../../hooks/useToggle';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

export default function DistancesScreen() {
    const styles = useStyles();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const [distances, setDistances] = useState(getClubDistancesService());
    const settings = getSettingsService();
    const distancesIsEmpty = distances.length === 0;
    const [showOnboarding, , setShowOnboarding] = useToggle(!settings.distancesOnboardingSeen && distancesIsEmpty);
    const [showClearConfirm, , setShowClearConfirm] = useToggle(false);

    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const currentSettings = getSettingsService();
        await saveSettingsService({ ...currentSettings, distancesOnboardingSeen: true });
    };

    const handleShowOnboarding = () => {
        setShowOnboarding(true);
    };

    const handleSave = async (distances: { Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number }[]) => {
        const saved = await saveClubDistancesService(distances);
        if (saved) {
            setDistances(distances.map((d, i) => ({ ...d, Id: i + 1 })));
        }
        showResult(saved, 'Clubs saved', 'Failed to save clubs');
    };

    const handleClear = async () => {
        const saved = await saveClubDistancesService([]);
        setShowClearConfirm(false);
        if (saved) {
            setDistances([]);
        }
        showResult(saved, 'Distances cleared', 'Failed to clear distances');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <DistancesHeader onInfoPress={handleShowOnboarding} />

                <ClubDistanceList key={distances.length} distances={distances} onSave={handleSave} units={settings.units} />

                {!distancesIsEmpty && !showClearConfirm && (
                    <ClearDistancesButton onPress={() => setShowClearConfirm(true)} />
                )}

                {showClearConfirm && (
                    <ClearDistancesConfirmation
                        onCancel={() => setShowClearConfirm(false)}
                        onConfirm={handleClear}
                    />
                )}
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Distances"
                steps={ONBOARDING_STEPS.distances}
            />
        </GestureHandlerRootView>
    );
}
