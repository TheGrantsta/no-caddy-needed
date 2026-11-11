import React from 'react';
import { Text, View } from 'react-native';
import { AppSettings } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';
import Dropdown from './Dropdown';
import SettingsSection from './SettingsSection';
import SettingsSegmentedControl from './SettingsSegmentedControl';
import SettingsSwitchRow from './SettingsSwitchRow';

const VOICES: { key: AppSettings['voice']; label: string }[] = [
    { key: 'female', label: 'Female' },
    { key: 'male', label: 'Male' },
    { key: 'neutral', label: 'Neutral' },
];

const UNITS: { value: AppSettings['units']; label: string }[] = [
    { value: 'yards', label: 'Yards' },
    { value: 'metres', label: 'Metres' },
];

interface Props {
    settings: AppSettings;
    onNotificationsChange: (value: boolean) => void;
    onSoundsChange: (value: boolean) => void;
    onVoiceChange: (voice: AppSettings['voice']) => void;
    onUnitsChange: (units: AppSettings['units']) => void;
}

// Sound and notification settings, then units
export default function SystemSettings({
    settings,
    onNotificationsChange,
    onSoundsChange,
    onVoiceChange,
    onUnitsChange,
}: Props) {
    const styles = useStyles();
    const s = styles.settingsSheet;
    const voiceLabel = VOICES.find(voice => voice.key === settings.voice)?.label ?? 'Female';

    return (
        <>
            <SettingsSection title="SOUND & NOTIFICATIONS">
                <SettingsSwitchRow
                    label="Notifications"
                    value={settings.notificationsEnabled}
                    onValueChange={onNotificationsChange}
                    testID="notifications-switch"
                />
                <View style={s.rowDivider} />
                <SettingsSwitchRow
                    label="Sounds"
                    value={settings.soundsEnabled}
                    onValueChange={onSoundsChange}
                    testID="sounds-switch"
                />
                <View style={s.rowDivider} />
                <View style={s.row}>
                    <Text style={s.rowLabel}>Voice</Text>
                    <Dropdown
                        listPresentation="inline"
                        options={VOICES.map(voice => voice.label)}
                        selectedOption={voiceLabel}
                        onSelectOption={(label) => {
                            const chosen = VOICES.find(voice => voice.label === label);
                            if (chosen) onVoiceChange(chosen.key);
                        }}
                        testIDPrefix="voice"
                    />
                </View>
            </SettingsSection>

            <SettingsSection
                title="UNITS"
                footnote="Applies to distances, wedge chart and wind. Putting stays in feet."
            >
                <View style={s.row}>
                    <Text style={s.rowLabel}>Distances</Text>
                    <View style={{ width: 180 }}>
                        <SettingsSegmentedControl
                            options={UNITS}
                            value={settings.units}
                            onChange={onUnitsChange}
                            testIDPrefix="units"
                        />
                    </View>
                </View>
            </SettingsSection>
        </>
    );
}
