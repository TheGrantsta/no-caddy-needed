import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';

// Settings gear for the right of a green tab header; opens the Settings screen
export default function HeaderSettingsButton() {
    const colours = useThemeColours();
    const router = useRouter();

    return (
        <TouchableOpacity
            testID="header-settings-button"
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            style={{ marginRight: 16 }}
        >
            <MaterialIcons name="settings" size={24} color={colours.background} />
        </TouchableOpacity>
    );
}
