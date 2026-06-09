import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import { getWindArrowRotation } from '@/service/WeatherService';

type Props = {
    directionFrom: number | null;
    speedMph: number | null;
    heading: number;
};

const WindIndicator = ({ directionFrom, speedMph, heading }: Props) => {
    const colours = useThemeColours();

    if (directionFrom === null || speedMph === null) return null;

    const rotation = getWindArrowRotation(directionFrom, heading);

    return (
        <View testID="wind-indicator" style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>

            <Text
                testID="wind-speed-text"
                style={{ color: colours.primary, fontSize: fontSizes.smallText, fontWeight: 'bold', marginLeft: 2 }}
            >
                {Math.round(speedMph)} m/h
            </Text>
            <View testID="wind-arrow" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
                <MaterialIcons name="navigation" size={18} color={colours.primary} />
            </View>
        </View>
    );
};

export default WindIndicator;
