import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    testIDPrefix: string;
};

// Two or more choices shown as a grey track with the chosen one raised in white
const SettingsSegmentedControl = <T extends string>({ options, value, onChange, testIDPrefix }: Props<T>) => {
    const styles = useStyles();
    const s = styles.settingsSheet;

    return (
        <View style={s.segmentTrack}>
            {options.map(option => {
                const selected = option.value === value;
                return (
                    <TouchableOpacity
                        key={option.value}
                        testID={`${testIDPrefix}-${option.value}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => onChange(option.value)}
                        style={[s.segment, selected && s.segmentSelected]}
                    >
                        <Text style={[s.segmentText, selected && s.segmentTextSelected]}>{option.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default SettingsSegmentedControl;
