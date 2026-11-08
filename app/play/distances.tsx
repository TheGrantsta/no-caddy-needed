import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ClubDistanceList from '../../components/ClubDistanceList';
import ClubDistanceReadList from '../../components/ClubDistanceReadList';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import { getClubDistancesService, saveClubDistancesService, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useAppToast } from '../../hooks/useAppToast';
import { useToggle } from '../../hooks/useToggle';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

type Metric = 'carry' | 'total';

export default function DistancesScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.distancesScreen;
    const router = useRouter();
    const { landscapePadding } = useOrientation();
    const { showResult } = useAppToast();
    const [distances, setDistances] = useState(getClubDistancesService());
    const [editing, setEditing] = useState(false);
    const [metric, setMetric] = useState<Metric>('carry');
    const settings = getSettingsService();
    const distancesIsEmpty = distances.length === 0;
    const [showOnboarding, , setShowOnboarding] = useToggle(!settings.distancesOnboardingSeen && distancesIsEmpty);

    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const currentSettings = getSettingsService();
        await saveSettingsService({ ...currentSettings, distancesOnboardingSeen: true });
    };

    const handleSave = async (distances: { Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number }[]) => {
        const saved = await saveClubDistancesService(distances);
        if (saved) {
            setDistances(distances.map((d, i) => ({ ...d, Id: i + 1 })));
            setEditing(false);
        }
        showResult(saved, 'Clubs saved', 'Failed to save clubs');
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View style={s.topBar}>
                    <TouchableOpacity
                        testID="distances-back-button"
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                        onPress={() => router.back()}
                        style={s.circleButton}
                    >
                        <MaterialIcons name="chevron-left" size={28} color={colours.text} />
                    </TouchableOpacity>
                    <Text style={s.title}>Distances</Text>
                    <TouchableOpacity
                        testID="edit-distances-button"
                        accessibilityRole="button"
                        onPress={() => setEditing(!editing)}
                        style={s.editButton}
                    >
                        <Text style={s.editText}>{editing ? 'Done' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                {editing ? (
                    <>
                        <ClubDistanceList key={distances.length} distances={distances} onSave={handleSave} units={settings.units} />

                    </>
                ) : (
                    <>
                        <View style={s.segment}>
                            <TouchableOpacity
                                testID="metric-carry"
                                onPress={() => setMetric('carry')}
                                style={[s.segmentOption, metric === 'carry' && s.segmentOptionSelected]}
                            >
                                <Text style={s.segmentText}>Carry</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="metric-total"
                                onPress={() => setMetric('total')}
                                style={[s.segmentOption, metric === 'total' && s.segmentOptionSelected]}
                            >
                                <Text style={s.segmentText}>Total</Text>
                            </TouchableOpacity>
                        </View>

                        {distancesIsEmpty ? (
                            <Text testID="distances-empty" style={s.emptyText}>
                                No clubs yet. Tap Edit to add your clubs.
                            </Text>
                        ) : (
                            <ClubDistanceReadList distances={distances} metric={metric} units={settings.units} />
                        )}
                    </>
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
