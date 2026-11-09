import React from 'react';
import { Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    tempo: number;
    onTempoChange: (value: number) => void;
}

const TRACK_INACTIVE = '#E3E3E3';

// Slider between 60 and 120 bpm with Slow and Fast labels either side
export default function TempoSlider({ tempo, onTempoChange }: Props) {
    const colours = useThemeColours();
    const styles = useStyles();
    const s = styles.tempoTool;

    return (
        <View style={s.sliderRow}>
            <Text style={s.sliderLabel}>Slow</Text>
            <Slider
                style={s.slider}
                minimumValue={60}
                maximumValue={120}
                step={6}
                value={tempo}
                onValueChange={onTempoChange}
                minimumTrackTintColor={colours.primary}
                maximumTrackTintColor={TRACK_INACTIVE}
                thumbTintColor={colours.white}
            />
            <Text style={s.sliderLabel}>Fast</Text>
        </View>
    );
}
