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
    onMicToggle: () => void;
}

export default function RandomNumberActions({
    onGenerate,
    speechRecognitionAvailable,
    micActive,
    onMicToggle,
}: Props) {
    const styles = useStyles();
    const colours = useThemeColours();
    const localStyles = styles.randomTool;

    return (
        <View style={[styles.marginTop, styles.container]}>
            <CtaButton
                testID="save-button"
                label="Generate"
                icon="shuffle"
                onPress={onGenerate}
            />

            {speechRecognitionAvailable && (
                <TouchableOpacity
                    testID="mic-button"
                    style={[localStyles.micButton, micActive && localStyles.micButtonActive]}
                    onPress={onMicToggle}
                >
                    <Text style={[localStyles.actionButtonText, micActive ? { color: colours.background } : { color: colours.text }]}>
                        Say "next"
                    </Text>
                    <MaterialIcons
                        name={micActive ? 'mic' : 'mic-off'}
                        size={28}
                        color={micActive ? colours.background : colours.text}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}
