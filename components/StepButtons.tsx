import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

type PreviousProps = { label: string; testID: string; onPress: () => void };

// Steps back to the previous hole or level: a plain label with a chevron, no fill
export function PreviousStepButton({ label, testID, onPress }: PreviousProps) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.stepButton;

    return (
        <TouchableOpacity testID={testID} accessibilityRole="button" onPress={onPress} style={s.previous}>
            <MaterialIcons name="chevron-left" size={18} color={colours.primary} />
            <Text numberOfLines={1} style={s.previousText}>{label}</Text>
        </TouchableOpacity>
    );
}

type NextProps = { label: string; icon: string; testID: string; onPress: () => void };

// Steps forward to the next hole or level: a green pill with the icon after the label
export function NextStepButton({ label, icon, testID, onPress }: NextProps) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.stepButton;

    return (
        <TouchableOpacity
            testID={testID}
            accessibilityRole="button"
            onPress={onPress}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            style={s.next}
        >
            <Text numberOfLines={1} style={s.nextText}>{label}</Text>
            <MaterialIcons name={icon as any} size={16} color={colours.white} />
        </TouchableOpacity>
    );
}
