import React from 'react';
import { Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    tempo: number;
    onTempoChange: (value: number) => void;
}

export default function TempoSlider({ tempo, onTempoChange }: Props) {
    const colours = useThemeColours();
    const styles = useStyles();
    const localStyles = styles.tempoTool;

    return (
        <>
            <Slider
                style={[localStyles.slider]}
                minimumValue={60}
                maximumValue={120}
                step={6}
                value={tempo}
                onValueChange={onTempoChange}
                minimumTrackTintColor={colours.tertiary}
                maximumTrackTintColor={colours.primary}
                thumbTintColor={colours.primary}
            />

            {/* Labels */}
            <View style={localStyles.labelsContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <Text key={num} style={[localStyles.label]}>
                        {num === 1 ? 'slow' : num === 12 ? 'fast' : ' '}
                    </Text>
                ))}
            </View>
        </>
    );
}
