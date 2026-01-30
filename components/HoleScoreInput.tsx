import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

type Props = {
    holeNumber: number;
    onScore: (holeNumber: number, score: number) => void;
};

const scoreOptions = [
    { value: -2, label: '-2' },
    { value: -1, label: '-1' },
    { value: 0, label: 'E' },
    { value: 1, label: '+1' },
    { value: 2, label: '+2' },
];

const HoleScoreInput = ({ holeNumber, onScore }: Props) => {
    return (
        <View style={localStyles.container}>
            <Text style={localStyles.holeText}>Hole {holeNumber}</Text>
            <View style={localStyles.buttonsRow}>
                {scoreOptions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        testID={`score-button-${option.value}`}
                        onPress={() => onScore(holeNumber, option.value)}
                        style={[
                            localStyles.scoreButton,
                            option.value < 0 && localStyles.underPar,
                            option.value === 0 && localStyles.evenPar,
                            option.value > 0 && localStyles.overPar,
                        ]}
                    >
                        <Text style={localStyles.scoreButtonText}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default HoleScoreInput;

const localStyles = StyleSheet.create({
    container: {
        padding: 15,
        alignItems: 'center',
    },
    holeText: {
        color: colours.yellow,
        fontSize: fontSizes.header,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
    },
    scoreButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    underPar: {
        backgroundColor: colours.green,
    },
    evenPar: {
        backgroundColor: colours.yellow,
    },
    overPar: {
        backgroundColor: colours.errorText,
    },
    scoreButtonText: {
        color: colours.white,
        fontSize: fontSizes.tableHeader,
        fontWeight: 'bold',
    },
});
