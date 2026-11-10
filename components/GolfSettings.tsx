import React from 'react';
import { View } from 'react-native';
import { AppSettings } from '@/service/DbService';
import { useStyles } from '@/hooks/useStyles';
import SettingsSection from './SettingsSection';
import SettingsSwitchRow from './SettingsSwitchRow';

interface Props {
    settings: AppSettings;
    onScoreOnlyModeChange: (value: boolean) => void;
    onBadHoleReassuranceChange: (value: boolean) => void;
}

// Golf-play switches
export default function GolfSettings({
    settings,
    onScoreOnlyModeChange,
    onBadHoleReassuranceChange,
}: Props) {
    const styles = useStyles();
    const s = styles.settingsSheet;

    return (
        <SettingsSection title="GOLF">
            <SettingsSwitchRow
                label="Score-only mode"
                value={settings.skipStatsFlowEnabled}
                onValueChange={onScoreOnlyModeChange}
                testID="score-only-switch"
            />

            <View style={s.rowDivider} />
            <SettingsSwitchRow
                label="Bad hole reminder"
                value={settings.badHoleReassuranceEnabled}
                onValueChange={onBadHoleReassuranceChange}
                testID="bad-hole-reassurance-switch"
            />
        </SettingsSection>
    );
}
