import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

interface Props {
    onInfoPress: () => void;
}

// Help button on the left and the title centred; changes save as they are made, so there is no Done button
export default function SettingsHeader({ onInfoPress }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.settingsSheet;

    return (
        <View style={s.headerRow}>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Show help"
                testID="settings-info-button"
                onPress={onInfoPress}
                style={s.circleButton}
            >
                <MaterialIcons name="info-outline" size={24} color={colours.black} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Settings</Text>
            <View style={s.headerSpacer} />
        </View>
    );
}
