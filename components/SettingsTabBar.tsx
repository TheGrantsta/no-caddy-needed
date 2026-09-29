import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    group: 'golf' | 'system';
    onGroupChange: (group: 'golf' | 'system') => void;
}

export default function SettingsTabBar({ group, onGroupChange }: Props) {
    const { colours } = useTheme();
    const styles = useStyles();

    return (
        <View style={styles.segmentedControlWrapper}>
            <View style={styles.segmentedControl}>
                {([
                    { key: 'golf', label: 'Golf', icon: 'golf-course' },
                    { key: 'system', label: 'System', icon: 'phone-iphone' },
                ] as const).map(({ key, label, icon }) => {
                    const isSelected = group === key;
                    return (
                        <TouchableOpacity
                            key={key}
                            testID={`settings-tab-${key}`}
                            onPress={() => onGroupChange(key)}
                            style={[styles.segment, isSelected ? styles.segmentSelected : null]}
                        >
                            <MaterialIcons name={icon} size={22} color={isSelected ? colours.white : colours.tertiary} />
                            <Text style={isSelected ? styles.segmentTextSelected : styles.segmentText}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
