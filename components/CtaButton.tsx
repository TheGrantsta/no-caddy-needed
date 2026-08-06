import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
    testID?: string;
    style?: StyleProp<ViewStyle>;
};

export default function CtaButton({ label, icon, onPress, testID, style }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    return (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
            style={[styles.ctaButton, style]}
        >
            <MaterialIcons name={icon} size={20} color={colours.background} />
            <Text style={styles.ctaButtonText}>{label}</Text>
        </TouchableOpacity>
    );
}
