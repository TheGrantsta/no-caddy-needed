import React from 'react';
import { View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    // Index of the beat currently sounding (0–3), or -1 when stopped
    activeBeat: number;
}

const BEATS_PER_BAR = 4;

// Four dots that light up in turn with each beat
export default function TempoBeatDots({ activeBeat }: Props) {
    const styles = useStyles();
    const s = styles.tempoTool;

    return (
        <View style={s.beatRow}>
            {Array.from({ length: BEATS_PER_BAR }, (_, beat) => (
                <View
                    key={beat}
                    testID={`tempo-beat-${beat}`}
                    style={[s.beatDot, beat === activeBeat && s.beatDotActive]}
                />
            ))}
        </View>
    );
}
