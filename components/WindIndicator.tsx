import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { getWindArrowRotation } from '@/service/WeatherService';
import WindDisplay from '@/components/WindDisplay';

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

    return (
        <>
            <TouchableOpacity
                testID="wind-indicator"
                onPress={() => setExpanded(true)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}
            >
                <View testID="wind-pill-icon">
                    <MaterialIcons name="air" size={18} color={colours.primary} />
                </View>
                <Text
                    testID="wind-speed-text"
                    style={{ color: colours.primary, fontSize: fontSizes.smallText, fontWeight: 'bold', marginLeft: 2 }}
                >
                    {speed} mph
                </Text>
                <View testID="wind-arrow" style={{ marginLeft: 2, transform: [{ rotate: `${rotation}deg` }] }}>
                    <MaterialIcons name="straight" size={18} color={colours.primary} />
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
                        <WindDisplay directionFrom={directionFrom} speedMph={speedMph} heading={heading} />
                    </TouchableOpacity>
                </Modal>
            )}
        </>
    );
};

export default WindIndicator;
