import React from 'react';
import { Animated, Text, TextInput, View } from 'react-native';
import { AppSettings } from '@/service/DbService';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';
import SettingsToggleRow from './SettingsToggleRow';

const PRESHOT = [
    { key: 'on', label: 'On', value: true },
    { key: 'off', label: 'Off', value: false },
];

const SCORE_ONLY = [
    { key: 'on', label: 'On', value: true },
    { key: 'off', label: 'Off', value: false },
];

const BAD_HOLE_REASSURANCE = [
    { key: 'on', label: 'On', value: true },
    { key: 'off', label: 'Off', value: false },
];

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

    return (
        <>
            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Show pre-shot routine</Text>
                </View>
                <SettingsToggleRow
                    options={PRESHOT.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.preShotReminderEnabled ? 'on' : 'off'}
                    onChange={(val) => onPreShotEnabledChange(val === 'on')}
                    testIDPrefix="preshot"
                />

                {showRoutineInput && (
                    <Animated.View style={{ opacity: routineFadeAnim }}>
                        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
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
                        </View>
                    </Animated.View>
                )}
            </View>

            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Score-only mode</Text>
                </View>
                <SettingsToggleRow
                    options={SCORE_ONLY.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.skipStatsFlowEnabled ? 'on' : 'off'}
                    onChange={(val) => onScoreOnlyModeChange(val === 'on')}
                    testIDPrefix="score-only"
                />
            </View>

            <View style={styles.contentSection}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.subHeaderText, { padding: 0 }]}>Bad hole reminder</Text>
                </View>
                <SettingsToggleRow
                    options={BAD_HOLE_REASSURANCE.map(({ key, label }) => ({ label, value: key }))}
                    value={settings.badHoleReassuranceEnabled ? 'on' : 'off'}
                    onChange={(val) => onBadHoleReassuranceChange(val === 'on')}
                    testIDPrefix="bad-hole-reassurance"
                />
            </View>
        </>
    );
}
