import { Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { getWindArrowRotation, getWindEffect, MIN_NOTABLE_PCT } from '@/service/WeatherService';
import { useWindVoice } from '@/hooks/useWindVoice';
import { getWedgeChartService } from '@/service/DbService';
import { findClubSuggestions } from '@/service/ClubSuggestionService';

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

    const effect = directionFrom !== null && speedMph !== null
        ? getWindEffect(directionFrom, speedMph, heading)
        : null;

    const { isAvailable: voiceAvailable, isListening, adjustedYards, toggleListening } = useWindVoice(effect?.playsLongerPercent ?? 0);
    const voiceEnabled = voiceAvailable && !disableVoice;

    const suggestedClubs = voiceEnabled && adjustedYards !== null
        ? findClubSuggestions(adjustedYards, getWedgeChartService())
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
            style={{
                backgroundColor: colours.background,
                borderRadius: 16,
                paddingVertical: compact ? 8 : 32,
                paddingHorizontal: compact ? 0 : 48,
                alignItems: 'center',
                borderWidth: compact ? 0 : 1,
                borderColor: colours.primary,
            }}
        >
            {!compact && (
                <Text
                    testID="wind-display-title"
                    style={{ color: colours.primary, fontSize: fontSizes.normal, fontWeight: 'bold', marginBottom: 12 }}
                >
                    Wind direction / speed
                </Text>
            )}
            <View testID="wind-target-marker" style={{ alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="golf-course" size={22} color={colours.primary} />
                <Text style={{ color: colours.primary, fontSize: fontSizes.smallestText, fontWeight: 'bold', opacity: 0.7 }}>
                    Target
                </Text>
            </View>
            <View testID="wind-arrow-large" style={{ marginTop: 4, transform: [{ rotate: `${rotation}deg` }] }}>
                <MaterialIcons name="straight" size={110} color={colours.primary} />
            </View>
            <Text
                testID="wind-speed-text-large"
                style={{ color: colours.primary, fontSize: fontSizes.header, fontWeight: 'bold', marginTop: 8 }}
            >
                {speed} mph
            </Text>
            <View style={{ marginTop: 16, width: '100%', alignItems: 'center' }}>
                {voiceEnabled && (
                    <TouchableOpacity
                        testID="wind-voice-button"
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: isListening ? colours.primary : 'transparent',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colours.primary,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            opacity: isListening ? 0.9 : 1,
                        }}
                        onPress={toggleListening}
                    >
                        <MaterialIcons
                            name={isListening ? 'mic' : 'mic-off'}
                            size={20}
                            color={isListening ? colours.background : colours.primary}
                        />
                        <Text
                            style={{
                                color: isListening ? colours.background : colours.primary,
                                fontSize: fontSizes.smallText,
                                fontWeight: 'bold',
                            }}
                        >
                            {isListening ? 'Listening...' : 'Say the yardage'}
                        </Text>
                    </TouchableOpacity>
                )}
                {!adjustedYards && (
                    <Text
                        testID="wind-effect-text"
                        style={{ color: colours.primary, fontSize: fontSizes.normal, fontWeight: 'bold', marginTop: voiceEnabled ? 12 : 0 }}
                    >
                        {effectText}
                    </Text>
                )}
                <Text
                    testID="wind-adjusted-yards"
                    style={{
                        color: colours.primary,
                        fontSize: fontSizes.normal,
                        fontWeight: 'bold',
                        marginTop: 12,
                        opacity: adjustedYards !== null ? 1 : 0,
                        minHeight: fontSizes.normal * 1.5,
                    }}
                >
                    {adjustedYards !== null ? `Play it as ${adjustedYards} yards` : ' '}
                </Text>
                {suggestedClubs.length > 0 && (
                    <Text
                        testID="wind-club-suggestions"
                        style={{
                            color: colours.primary,
                            fontSize: fontSizes.normal,
                            fontWeight: 'bold',
                            marginTop: 8,
                        }}
                    >
                        Try {suggestedClubs.map(c => c.club).join(' or ')}
                    </Text>
                )}
            </View>
            {!compact && (
                <Text
                    testID="wind-aim-hint"
                    style={{ color: colours.primary, fontSize: fontSizes.smallestText, opacity: 0.6, marginTop: 12 }}
                >
                    Aim your phone at the target
                </Text>
            )}
        </View>
    );
};

export default WindDisplay;
