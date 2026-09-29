import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    onInfoPress: () => void;
}

export default function SettingsHeader({ onInfoPress }: Props) {
    const { colours } = useTheme();
    const styles = useStyles();

    return (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <TouchableOpacity testID="settings-info-button" onPress={onInfoPress}>
                    <MaterialIcons name="info-outline" size={26} color={colours.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerText, styles.marginTop]}>Settings</Text>
            </View>
        </View>
    );
}
