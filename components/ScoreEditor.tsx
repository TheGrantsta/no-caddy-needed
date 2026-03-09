import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    holeNumber: number;
    playerName: string;
    score: number;
    onIncrement: () => void;
    onDecrement: () => void;
};

const ScoreEditor = ({ holeNumber, playerName, score, onIncrement, onDecrement }: Props) => {
    const styles = useStyles();
    const s = styles.scoreEditor;

    return (
        <View style={s.container}>
            <Text style={s.headerText}>Hole {holeNumber} - {playerName}</Text>
            <View style={s.stepperRow}>
                <TouchableOpacity
                    testID="score-editor-decrement"
                    onPress={onDecrement}
                    style={s.stepperButton}
                >
                    <Text style={s.stepperButtonText}>-</Text>
                </TouchableOpacity>
                <Text testID="score-editor-value" style={s.scoreText}>
                    {score}
                </Text>
                <TouchableOpacity
                    testID="score-editor-increment"
                    onPress={onIncrement}
                    style={s.stepperButton}
                >
                    <Text style={s.stepperButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ScoreEditor;
