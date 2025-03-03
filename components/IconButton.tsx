import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    iconName: keyof typeof MaterialIcons.glyphMap;
    label: string;
    size: string;
};

export default function IconButton({ iconName, label, size }: Props) {
    const buttonStyles = [styles.iconButton, size === 'small' && styles.small, size === 'medium' && styles.medium, size === 'large' && styles.large];

    return (
        <View testID='container' style={buttonStyles}>
            <MaterialIcons name={iconName} size={48} color={colours.white} />
            <Text style={styles.iconButtonLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colours.border,
        borderWidth: 2,
        padding: 10,
        zIndex: 1,
    },
    small: {
        borderRadius: 10,
        width: 75,
        height: 75,
    },
    medium: {
        borderRadius: 20,
        width: 125,
        height: 125,
    },
    large: {
        borderRadius: 40,
        width: 175,
        height: 175,
    },
    iconButtonLabel: {
        fontSize: fontSizes.smallText,
        color: colours.white,
        marginTop: 24,
    },
});
