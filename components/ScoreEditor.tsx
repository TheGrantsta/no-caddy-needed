import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColours } from '../context/ThemeContext';
import fontSizes from '../assets/font-sizes';
import { t } from '../assets/i18n/i18n';

type Props = {
    holeNumber: number;
    playerName: string;
    score: number;
    onIncrement: () => void;
    onDecrement: () => void;
};

const ScoreEditor = ({ holeNumber, playerName, score, onIncrement, onDecrement }: Props) => {
    const colours = useThemeColours();

    const localStyles = useMemo(() => StyleSheet.create({
        container: {
            padding: 15,
            alignItems: 'center',
        },
        headerText: {
            color: colours.yellow,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
            marginBottom: 15,
        },
        stepperRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        stepperButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colours.yellow,
            justifyContent: 'center',
            alignItems: 'center',
        },
        stepperButtonText: {
            color: colours.background,
            fontSize: fontSizes.subHeader,
            fontWeight: 'bold',
        },
        scoreText: {
            color: colours.text,
            fontSize: fontSizes.header,
            fontWeight: 'bold',
            marginHorizontal: 15,
            minWidth: 30,
            textAlign: 'center',
        },
    }), [colours]);

    return (
        <View style={localStyles.container}>
            <Text style={localStyles.headerText}>{t('scoreEditor.header', { holeNumber, playerName })}</Text>
            <View style={localStyles.stepperRow}>
                <TouchableOpacity
                    testID="score-editor-decrement"
                    onPress={onDecrement}
                    style={localStyles.stepperButton}
                >
                    <Text style={localStyles.stepperButtonText}>-</Text>
                </TouchableOpacity>
                <Text testID="score-editor-value" style={localStyles.scoreText}>
                    {score}
                </Text>
                <TouchableOpacity
                    testID="score-editor-increment"
                    onPress={onIncrement}
                    style={localStyles.stepperButton}
                >
                    <Text style={localStyles.stepperButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ScoreEditor;
