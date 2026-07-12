import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import { getWindArrowRotation, getWindEffect, MIN_NOTABLE_PCT } from '@/service/WeatherService';
import { useWindVoice } from '@/hooks/useWindVoice';
import { getWedgeChartService } from '@/service/DbService';
import { findClubSuggestions } from '@/service/ClubSuggestionService';
import WedgeChartGrid from './WedgeChartGrid';

type Props = {
    directionFrom: number | null;
    speedMph: number | null;
    heading: number;
    /**
     * Compact mode for embedding in a page that already provides a heading:
     * drops the inner title, the "aim your phone" hint, and the modal-style card
     * border so the read-out sits directly on the page. Defaults to the full
     * (modal overlay) presentation.
     */
    compact?: boolean;
    /**
     * Disable the voice distance adjuster feature.
     */
    disableVoice?: boolean;
};

/**
 * The wind read-out panel: target marker, a large compass arrow pointing downwind
 * relative to the device heading, the speed, the source compass direction, and the
 * distance/cross effect. Shared by the WindIndicator modal overlay and the
 * standalone Wind tool screen (via `compact`).
 */
const WindDisplay = ({ directionFrom, speedMph, heading, compact = false, disableVoice = false }: Props) => {
    const colours = useThemeColours();
    const styles = useStyles();
    const [manualEntryOpen, setManualEntryOpen] = useState(false);
    const [manualEntryText, setManualEntryText] = useState('');

    const effect = directionFrom !== null && speedMph !== null
        ? getWindEffect(directionFrom, speedMph, heading)
        : null;

    const { isAvailable: voiceAvailable, isListening, adjustedYards, adjustedDisplayValue, distanceUnit, toggleListening, submitManualDistance } = useWindVoice(effect?.playsLongerPercent ?? 0);
    const voiceEnabled = voiceAvailable && !disableVoice;

    const handleToggleManualEntry = () => {
        setManualEntryOpen(open => !open);
        setManualEntryText('');
    };

    const handleManualSubmit = () => {
        const parsed = parseFloat(manualEntryText);
        if (!Number.isFinite(parsed) || parsed <= 0) return;
        submitManualDistance(parsed);
        setManualEntryOpen(false);
        setManualEntryText('');
    };

    const wedgeChartData = voiceEnabled && adjustedYards !== null ? getWedgeChartService() : null;
    const suggestedClubs = wedgeChartData
        ? findClubSuggestions(adjustedYards, wedgeChartData)
        : [];

    if (directionFrom === null || speedMph === null) return null;

    const rotation = getWindArrowRotation(directionFrom, heading);
    const speed = Math.round(speedMph);
    const pct = Math.round(effect!.playsLongerPercent);
    const negligible = effect!.category === 'calm' || Math.abs(pct) < MIN_NOTABLE_PCT;
    const effectText = negligible
        ? 'Plays about the same'
        : pct > 0
            ? `Plays ~${pct}% longer`
            : `Plays ~${Math.abs(pct)}% shorter`;

    return (
        <View
            testID="wind-display-container"
            style={[styles.windDisplay.card, compact ? styles.windDisplay.cardCompact : styles.windDisplay.cardFull]}
        >
            {!compact && (
                <Text
                    testID="wind-display-title"
                    style={styles.windDisplay.title}
                >
                    Wind direction / speed
                </Text>
            )}
            <View testID="wind-target-marker" style={styles.windDisplay.targetMarker}>
                <MaterialIcons name="golf-course" size={22} color={colours.primary} />
                <Text style={styles.windDisplay.targetLabel}>
                    Target
                </Text>
            </View>
            <View testID="wind-arrow-large" style={[styles.windDisplay.arrowWrapper, { transform: [{ rotate: `${rotation}deg` }] }]}>
                <MaterialIcons name="straight" size={110} color={colours.primary} />
            </View>
            <Text
                testID="wind-speed-text-large"
                style={styles.windDisplay.speedText}
            >
                {speed} mph
            </Text>
            <View style={styles.windDisplay.bottomSection}>
                {voiceEnabled && (
                    <View style={styles.windDisplay.voiceRow}>
                        <TouchableOpacity
                            testID="wind-voice-button"
                            style={[styles.windDisplay.voiceButton, isListening ? styles.windDisplay.voiceButtonActive : styles.windDisplay.voiceButtonInactive]}
                            onPress={toggleListening}
                        >
                            <MaterialIcons
                                name={isListening ? 'mic' : 'mic-off'}
                                size={20}
                                color={isListening ? colours.background : colours.primary}
                            />
                            <Text
                                style={[styles.windDisplay.voiceButtonText, isListening ? styles.windDisplay.voiceButtonTextActive : styles.windDisplay.voiceButtonTextInactive]}
                            >
                                {isListening ? 'Listening...' : 'Say the distance'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="wind-manual-entry-toggle"
                            style={styles.windDisplay.manualEntryToggle}
                            onPress={handleToggleManualEntry}
                        >
                            <Text style={styles.windDisplay.manualEntryToggleText}>
                                Enter manually
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                {voiceEnabled && manualEntryOpen && (
                    <View style={styles.windDisplay.manualEntryPanel}>
                        <TextInput
                            testID="wind-manual-entry-input"
                            style={styles.windDisplay.manualEntryInput}
                            keyboardType="decimal-pad"
                            value={manualEntryText}
                            onChangeText={setManualEntryText}
                            placeholder="Distance"
                            placeholderTextColor={colours.backgroundAlternate}
                            onSubmitEditing={handleManualSubmit}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            testID="wind-manual-entry-submit"
                            style={styles.windDisplay.manualEntrySubmit}
                            onPress={handleManualSubmit}
                        >
                            <Text style={styles.windDisplay.manualEntrySubmitText}>
                                Go
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                {!adjustedDisplayValue && (
                    <Text
                        testID="wind-effect-text"
                        style={[styles.windDisplay.effectText, { marginTop: voiceEnabled ? 12 : 0 }]}
                    >
                        {effectText}
                    </Text>
                )}
                <Text
                    testID="wind-adjusted-yards"
                    style={[styles.windDisplay.adjustedYardsText, { opacity: adjustedDisplayValue !== null ? 1 : 0 }]}
                >
                    {adjustedDisplayValue !== null ? `Play it as ${adjustedDisplayValue} ${distanceUnit}` : ' '}
                </Text>
                {suggestedClubs.length > 0 && wedgeChartData && (
                    <WedgeChartGrid data={wedgeChartData} suggestedClubs={suggestedClubs} unit={distanceUnit} />
                )}
            </View>
            {!compact && (
                <Text
                    testID="wind-aim-hint"
                    style={styles.windDisplay.aimHint}
                >
                    Aim your phone at the target
                </Text>
            )}
        </View>
    );
};

export default WindDisplay;
