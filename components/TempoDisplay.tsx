import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    tempo: number;
    onStep: (delta: number) => void;
}

// Large beats-per-minute readout with − and + buttons either side
export default function TempoDisplay({ tempo, onStep }: Props) {
    const colours = useThemeColours();
    const styles = useStyles();
    const s = styles.tempoTool;

    return (
        <View style={s.readoutRow}>
            <TouchableOpacity
                testID="tempo-decrease-button"
                accessibilityRole="button"
                accessibilityLabel="Decrease tempo"
                onPress={() => onStep(-6)}
                style={s.stepButton}
            >
                <MaterialIcons name="remove" size={28} color={colours.black} />
            </TouchableOpacity>
            <View style={s.readoutCentre}>
                <Text testID="tempo-bpm-value" style={s.readoutValue}>{tempo}</Text>
                <Text style={s.readoutUnit}>beats per minute</Text>
            </View>
            <TouchableOpacity
                testID="tempo-increase-button"
                accessibilityRole="button"
                accessibilityLabel="Increase tempo"
                onPress={() => onStep(6)}
                style={s.stepButton}
            >
                <MaterialIcons name="add" size={28} color={colours.black} />
            </TouchableOpacity>
        </View>
    );
}
