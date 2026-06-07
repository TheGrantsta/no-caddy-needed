import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

const parOptions = [3, 4, 5];

type Props = {
    holeNumber: number;
    playerName: string;
    score: number;
    holePar: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onParChange: (par: number) => void;
};

const ScoreEditor = ({ holeNumber, playerName, score, holePar, onIncrement, onDecrement, onParChange }: Props) => {
    const styles = useStyles();
    const s = styles.scoreEditor;

    return (
        <View style={s.container}>
            <Text style={s.headerText}>#{holeNumber} - {playerName}</Text>
            <View style={s.parRow}>
                {parOptions.map(p => (
                    <TouchableOpacity
                        key={p}
                        testID={`score-editor-par-${p}`}
                        onPress={() => onParChange(p)}
                        style={[s.parButton, holePar === p && s.parButtonActive]}
                    >
                        <Text style={[s.parButtonText, holePar === p && s.parButtonTextActive]}>
                            Par {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
