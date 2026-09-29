import React from 'react';
import CtaButton from './CtaButton';

interface Props {
    isPlaying: boolean;
    onToggle: () => void;
}

export default function TempoControls({ isPlaying, onToggle }: Props) {
    return (
        <CtaButton
            testID="tempo-toggle-button"
            label={isPlaying ? 'Stop' : 'Play'}
            icon={isPlaying ? 'stop' : 'play-arrow'}
            onPress={onToggle}
        />
    );
}
