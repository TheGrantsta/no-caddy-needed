import React from 'react';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import SettingsSection from './SettingsSection';

interface Props {
    onExportStats: () => void;
    exporting?: boolean;
    onRateApp: () => void;
}

// Export and rate actions on one card in the app's green, with the version number below
export default function SettingsFooter({ onExportStats, onRateApp, exporting = false }: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.settingsSheet;

    return (
        <>
            <SettingsSection>
                <TouchableOpacity
                    testID="export-stats-button"
                    accessibilityRole="button"
                    onPress={onExportStats}
                    disabled={exporting}
                    style={s.row}
                >
                    <MaterialIcons name="file-upload" size={22} color={colours.primary} />
                    <Text style={[s.actionText, { marginLeft: 12 }]}>
                        {exporting ? 'Preparing export…' : 'Export stats for AI coaching'}
                    </Text>
                </TouchableOpacity>
                <View style={s.rowDivider} />
                <TouchableOpacity testID="rate-app-button" accessibilityRole="button" onPress={onRateApp} style={s.row}>
                    <MaterialIcons name="star-outline" size={22} color={colours.primary} />
                    <Text style={[s.actionText, { marginLeft: 12 }]}>Rate my app</Text>
                </TouchableOpacity>
            </SettingsSection>

            <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
                <Text style={styles.normalText}>
                    Version {Constants.expoConfig?.version}
                </Text>
            </View>
        </>
    );
}
