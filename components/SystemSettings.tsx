import React from 'react';
import { Text, View } from 'react-native';
import { AppSettings } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';
import SettingsToggleRow from './SettingsToggleRow';

const NOTIFICATIONS = [
    { key: 'on', label: 'On', value: true },
    { key: 'off', label: 'Off', value: false },
];

const SOUNDS = [
    { key: 'on', label: 'On', value: true },
    { key: 'off', label: 'Off', value: false },
];

const VOICES: { key: AppSettings['voice']; label: string }[] = [
    { key: 'female', label: 'Female' },
    { key: 'male', label: 'Male' },
    { key: 'neutral', label: 'Neutral' },
];

const UNITS: { key: AppSettings['units']; label: string }[] = [
    { key: 'yards', label: 'Yards' },
    { key: 'metres', label: 'Metres' },
];

interface Props {
    settings: AppSettings;
    onNotificationsChange: (value: boolean) => void;
    onSoundsChange: (value: boolean) => void;
    onVoiceChange: (voice: AppSettings['voice']) => void;
    onUnitsChange: (units: AppSettings['units']) => void;
}

export default function SystemSettings({
    settings,
    onNotificationsChange,
    onSoundsChange,
    onVoiceChange,
    onUnitsChange,
}: Props) {
    const styles = useStyles();

    return (
        <>
            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Notifications</Text>
                </View>
                <SettingsToggleRow
                    options={NOTIFICATIONS.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.notificationsEnabled ? 'on' : 'off'}
                    onChange={(val) => onNotificationsChange(val === 'on')}
                    testIDPrefix="notifications"
                />
            </View>

            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Sounds</Text>
                </View>
                <SettingsToggleRow
                    options={SOUNDS.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.soundsEnabled ? 'on' : 'off'}
                    onChange={(val) => onSoundsChange(val === 'on')}
                    testIDPrefix="sounds"
                />
            </View>

            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Voice</Text>
                </View>
                <SettingsToggleRow
                    options={VOICES.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.voice}
                    onChange={onVoiceChange}
                    testIDPrefix="voice"
                />
            </View>

            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Units</Text>
                </View>
                <SettingsToggleRow
                    options={UNITS.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.units}
                    onChange={onUnitsChange}
                    testIDPrefix="units"
                />
            </View>
        </>
    );
}
