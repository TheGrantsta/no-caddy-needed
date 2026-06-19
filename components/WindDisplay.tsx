import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { getWindArrowRotation, getWindEffect, MIN_NOTABLE_PCT } from '@/service/WeatherService';

type Props = {
    directionFrom: number | null;
    speedMph: number | null;
    heading: number;
};

/**
 * The wind read-out panel: target marker, a large compass arrow pointing downwind
 * relative to the device heading, the speed, and the distance/cross effect.
 * Shared by the WindIndicator modal overlay and the standalone Wind tool screen.
 */
const WindDisplay = ({ directionFrom, speedMph, heading }: Props) => {
    const colours = useThemeColours();

    if (directionFrom === null || speedMph === null) return null;

    const rotation = getWindArrowRotation(directionFrom, heading);
    const speed = Math.round(speedMph);

    const effect = getWindEffect(directionFrom, speedMph, heading);
    const pct = Math.round(effect.playsLongerPercent);
    const negligible = effect.category === 'calm' || Math.abs(pct) < MIN_NOTABLE_PCT;
    const effectText = negligible
        ? 'Plays about the same'
        : pct > 0
            ? `Plays ~${pct}% longer`
            : `Plays ~${Math.abs(pct)}% shorter`;

    return (
        <View
            style={{
                backgroundColor: colours.background,
                borderRadius: 16,
                paddingVertical: 32,
                paddingHorizontal: 48,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colours.primary,
            }}
        >
            <Text style={{ color: colours.primary, fontSize: fontSizes.normal, fontWeight: 'bold', marginBottom: 12 }}>
                Wind direction / speed
            </Text>
            <View testID="wind-target-marker" style={{ alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="golf-course" size={22} color={colours.primary} />
                <Text style={{ color: colours.primary, fontSize: fontSizes.smallestText, fontWeight: 'bold', opacity: 0.7 }}>
                    Target
                </Text>
            </View>
            <View testID="wind-arrow-large" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
                <MaterialIcons name="straight" size={120} color={colours.primary} />
            </View>
            <Text
                testID="wind-speed-text-large"
                style={{ color: colours.primary, fontSize: fontSizes.header, fontWeight: 'bold', marginTop: 16 }}
            >
                {speed} mph
            </Text>
            <Text
                testID="wind-effect-text"
                style={{ color: colours.primary, fontSize: fontSizes.normal, fontWeight: 'bold', marginTop: 12 }}
            >
                {effectText}
            </Text>
            {effect.crossDirection && (
                <Text
                    testID="wind-cross-text"
                    style={{ color: colours.primary, fontSize: fontSizes.smallText, marginTop: 4 }}
                >
                    Crosswind from the {effect.crossDirection}
                </Text>
            )}
            <Text
                testID="wind-aim-hint"
                style={{ color: colours.primary, fontSize: fontSizes.smallestText, opacity: 0.6, marginTop: 12 }}
            >
                Aim your phone at the target
            </Text>
        </View>
    );
};

export default WindDisplay;
