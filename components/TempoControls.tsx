import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useThemeColours } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/useStyles';

interface Props {
    isPlaying: boolean;
    onToggle: () => void;
}

// Large round Play / Stop button
export default function TempoControls({ isPlaying, onToggle }: Props) {
    const colours = useThemeColours();
    const styles = useStyles();
    const s = styles.tempoTool;

    return (
        <TouchableOpacity
            testID="tempo-toggle-button"
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Stop' : 'Play'}
            onPress={onToggle}
            style={s.playButton}
        >
            <MaterialIcons name={isPlaying ? 'stop' : 'play-arrow'} size={56} color={colours.white} />
        </TouchableOpacity>
    );
}
