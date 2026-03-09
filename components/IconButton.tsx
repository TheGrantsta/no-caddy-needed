import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '../context/ThemeContext';

type Props = {
    iconName: keyof typeof MaterialIcons.glyphMap;
    label: string;
    size: string;
};

export default function IconButton({ iconName, label, size }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();

    const buttonStyles = [styles.iconButton.iconButton, size === 'small' && styles.iconButton.small, size === 'medium' && styles.iconButton.medium, size === 'large' && styles.iconButton.large];

    return (
        <View testID='container' style={buttonStyles}>
            <MaterialIcons name={iconName} size={48} color={colours.white} />
            <Text style={styles.iconButton.iconButtonLabel}>{label}</Text>
        </View>
    );
}
