import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type Props = {
    value: number;
    onChange: (next: number) => void;
    min: number;
    max: number;
    decreaseTestID: string;
    increaseTestID: string;
    displayTestID: string;
    formatValue?: (value: number) => string;
};

export default function ChallengeNumberPicker({
    value,
    onChange,
    min,
    max,
    decreaseTestID,
    increaseTestID,
    displayTestID,
    formatValue,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const isAtMin = value <= min;
    const isAtMax = value >= max;

    return (
        <View style={[styles.navRow, { marginVertical: 24, justifyContent: 'center', alignItems: 'center' }]}>
            <TouchableOpacity
                testID={decreaseTestID}
                onPress={() => onChange(value - 1)}
                disabled={isAtMin}
            >
                <MaterialIcons
                    name="remove-circle"
                    size={40}
                    color={isAtMin ? colours.tertiary : colours.primary}
                />
            </TouchableOpacity>
            <View style={{ marginHorizontal: 20 }}>
                <Text testID={displayTestID} style={styles.headerText}>
                    {formatValue ? formatValue(value) : String(value)}
                </Text>
            </View>
            <TouchableOpacity
                testID={increaseTestID}
                onPress={() => onChange(value + 1)}
                disabled={isAtMax}
            >
                <MaterialIcons
                    name="add-circle"
                    size={40}
                    color={isAtMax ? colours.tertiary : colours.primary}
                />
            </TouchableOpacity>
        </View>
    );
}
