import React from 'react';
import { Animated, TextInput, View } from 'react-native';
import { AppSettings } from '@/service/DbService';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import SettingsSection from './SettingsSection';
import SettingsSwitchRow from './SettingsSwitchRow';

interface Props {
    settings: AppSettings;
    routineText: string;
    onRoutineTextChange: (text: string) => void;
    onRoutineTextSave: () => void;
    showRoutineInput: boolean;
    routineFadeAnim: Animated.Value;
    onPreShotEnabledChange: (value: boolean) => void;
    onScoreOnlyModeChange: (value: boolean) => void;
    onBadHoleReassuranceChange: (value: boolean) => void;
}

// Golf-play switches; turning on the pre-shot routine reveals the routine text box under it
export default function GolfSettings({
    settings,
    routineText,
    onRoutineTextChange,
    onRoutineTextSave,
    showRoutineInput,
    routineFadeAnim,
    onPreShotEnabledChange,
    onScoreOnlyModeChange,
    onBadHoleReassuranceChange,
}: Props) {
    const { colours } = useTheme();
    const styles = useStyles();
    const s = styles.settingsSheet;

    return (
        <SettingsSection title="GOLF">
            <SettingsSwitchRow
                label="Show pre-shot routine"
                value={settings.preShotReminderEnabled}
                onValueChange={onPreShotEnabledChange}
                testID="preshot-switch"
            />

            {showRoutineInput && (
                <Animated.View style={{ opacity: routineFadeAnim, paddingHorizontal: 16, paddingBottom: 12 }}>
                    <TextInput
                        testID="preshot-routine-input"
                        style={[styles.textInput, { height: undefined, minHeight: 110, textAlignVertical: 'top', paddingVertical: 10 }]}
                        value={routineText}
                        onChangeText={onRoutineTextChange}
                        onEndEditing={onRoutineTextSave}
                        multiline
                        placeholder="Your pre-shot routine"
                        placeholderTextColor={colours.tertiary}
                    />
                </Animated.View>
            )}

            <View style={s.rowDivider} />
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
