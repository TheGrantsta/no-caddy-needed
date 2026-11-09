import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import CtaButton from './CtaButton';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';

interface Props {
    onGenerate: () => void;
    speechRecognitionAvailable: boolean;
    micActive: boolean;
    micDenied?: boolean;
    onMicToggle: () => void;
}

// Generate button beside a round microphone button that listens for "next"
export default function RandomNumberActions({
    onGenerate,
    speechRecognitionAvailable,
    micActive,
    micDenied = false,
    onMicToggle,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const s = styles.randomPage;

    return (
        <View>
            <View style={s.actionRow}>
                <View style={s.generateSlot}>
                    <CtaButton
                        testID="save-button"
                        label="Generate"
                        icon="shuffle"
                        onPress={onGenerate}
                    />
                </View>
                {speechRecognitionAvailable && (
                    <TouchableOpacity
                        testID="mic-button"
                        accessibilityRole="button"
                        accessibilityLabel={micActive ? 'Turn off microphone' : 'Turn on microphone'}
                        onPress={onMicToggle}
                        style={[s.micButton, micActive && s.micButtonActive]}
                    >
                        <MaterialIcons
                            name={micActive ? 'mic' : 'mic-none'}
                            size={28}
                            color={micActive ? colours.white : colours.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {speechRecognitionAvailable && micDenied && (
                <Text testID="mic-denied-message" style={s.micDeniedText}>
                    Microphone access is off; turn it on in Settings
                </Text>
            )}
        </View>
    );
}
