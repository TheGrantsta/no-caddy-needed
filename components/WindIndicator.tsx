import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { getWindArrowRotation, getWindEffect } from '@/service/WeatherService';

type Props = {
    directionFrom: number | null;
    speedMph: number | null;
    heading: number;
};

const WindIndicator = ({ directionFrom, speedMph, heading }: Props) => {
    const colours = useThemeColours();
    const [expanded, setExpanded] = useState(false);

    if (directionFrom === null || speedMph === null) return null;

    const rotation = getWindArrowRotation(directionFrom, heading);
    const speed = Math.round(speedMph);

    const effect = getWindEffect(directionFrom, speedMph, heading);
    const pct = Math.round(effect.playsLongerPercent);
    const effectText =
        effect.category === 'calm' || pct === 0
            ? 'Minimal distance effect'
            : pct > 0
                ? `Plays ~${pct}% longer`
                : `Plays ~${Math.abs(pct)}% shorter`;

    return (
        <>
            <TouchableOpacity
                testID="wind-indicator"
                onPress={() => setExpanded(true)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}
            >
                <Text
                    testID="wind-speed-text"
                    style={{ color: colours.primary, fontSize: fontSizes.smallText, fontWeight: 'bold', marginLeft: 2 }}
                >
                    {speed} m/h
                </Text>
                <View testID="wind-arrow" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
                    <MaterialIcons name="navigation" size={18} color={colours.primary} />
                </View>
                <View testID="wind-expand-hint" style={{ marginLeft: 4, opacity: 0.6 }}>
                    <MaterialIcons name="open-in-full" size={12} color={colours.primary} />
                </View>
            </TouchableOpacity>

            {expanded && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
                    <TouchableOpacity
                        testID="wind-overlay-backdrop"
                        activeOpacity={1}
                        onPress={() => setExpanded(false)}
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
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
                            <View testID="wind-arrow-large" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
                                <MaterialIcons name="navigation" size={120} color={colours.primary} />
                            </View>
                            <Text
                                testID="wind-speed-text-large"
                                style={{ color: colours.primary, fontSize: fontSizes.header, fontWeight: 'bold', marginTop: 16 }}
                            >
                                {speed} m/h
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
                    </TouchableOpacity>
                </Modal>
            )}
        </>
    );
};

export default WindIndicator;
