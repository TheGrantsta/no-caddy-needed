import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

type Props = {
    holePar: number;
    threePuttSelected: boolean;
    onStatsChange: (firstPuttDistance: number, secondPuttDistance: number, secondPuttIsLong: boolean, thirdPuttDistance?: number, thirdPuttIsLong?: boolean) => void;
    initialFirstPutt?: number;
    initialSecondPutt?: number;
    initialSecondIsLong?: boolean;
    initialThirdPutt?: number;
    initialThirdIsLong?: boolean;
};

const PuttingStatsInput = ({
    holePar,
    threePuttSelected,
    onStatsChange,
    initialFirstPutt = 20,
    initialSecondPutt = 5,
    initialSecondIsLong = false,
    initialThirdPutt,
    initialThirdIsLong = false,
}: Props) => {
    const styles = useStyles();
    const [firstPutt, setFirstPutt] = useState(initialFirstPutt);
    const [secondPutt, setSecondPutt] = useState(initialSecondPutt);
    const [secondIsLong, setSecondIsLong] = useState(initialSecondIsLong);
    const [thirdPutt, setThirdPutt] = useState(initialThirdPutt ?? 3);
    const [thirdIsLong, setThirdIsLong] = useState(initialThirdIsLong);

    const updateStats = () => {
        onStatsChange(
            firstPutt,
            secondPutt,
            secondIsLong,
            threePuttSelected ? thirdPutt : undefined,
            threePuttSelected ? thirdIsLong : undefined
        );
    };

    const handleFirstPuttChange = (delta: number) => {
        const newValue = Math.max(1, Math.min(300, firstPutt + delta));
        setFirstPutt(newValue);
        updateStats();
    };

    const handleSecondPuttChange = (delta: number) => {
        const newValue = Math.max(1, Math.min(100, secondPutt + delta));
        setSecondPutt(newValue);
        updateStats();
    };

    const handleSecondIsLongChange = (value: boolean) => {
        setSecondIsLong(value);
        onStatsChange(firstPutt, secondPutt, value, threePuttSelected ? thirdPutt : undefined, threePuttSelected ? thirdIsLong : undefined);
    };

    const handleThirdPuttChange = (delta: number) => {
        const newValue = Math.max(1, Math.min(100, thirdPutt + delta));
        setThirdPutt(newValue);
        updateStats();
    };

    const handleThirdIsLongChange = (value: boolean) => {
        setThirdIsLong(value);
        updateStats();
    };

    return (
        <View style={[styles.holeScoreInput.container, { paddingVertical: 12 }]}>
            {/* First Putt */}
            <View style={styles.holeScoreInput.playerRow}>
                <Text style={styles.holeScoreInput.playerName}>1st Putt (ft)</Text>
                <View style={styles.holeScoreInput.stepperRow}>
                    <TouchableOpacity
                        testID="decrement-first-putt"
                        onPress={() => handleFirstPuttChange(-5)}
                        style={styles.holeScoreInput.stepperButton}
                    >
                        <Text style={styles.holeScoreInput.stepperButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text testID="first-putt-distance" style={styles.holeScoreInput.scoreText}>
                        {firstPutt}
                    </Text>
                    <TouchableOpacity
                        testID="increment-first-putt"
                        onPress={() => handleFirstPuttChange(5)}
                        style={styles.holeScoreInput.stepperButton}
                    >
                        <Text style={styles.holeScoreInput.stepperButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Second Putt */}
            <View style={styles.holeScoreInput.playerRow}>
                <Text style={styles.holeScoreInput.playerName}>2nd Putt (ft)</Text>
                <View style={styles.holeScoreInput.stepperRow}>
                    <TouchableOpacity
                        testID="decrement-second-putt"
                        onPress={() => handleSecondPuttChange(-1)}
                        style={styles.holeScoreInput.stepperButton}
                    >
                        <Text style={styles.holeScoreInput.stepperButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text testID="second-putt-distance" style={styles.holeScoreInput.scoreText}>
                        {secondPutt}
                    </Text>
                    <TouchableOpacity
                        testID="increment-second-putt"
                        onPress={() => handleSecondPuttChange(1)}
                        style={styles.holeScoreInput.stepperButton}
                    >
                        <Text style={styles.holeScoreInput.stepperButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Second Putt Direction Toggle */}
            <View style={[styles.holeScoreInput.playerRow, { marginBottom: 8 }]}>
                <Text style={styles.holeScoreInput.playerName}>2nd Putt</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        testID="second-putt-short"
                        onPress={() => handleSecondIsLongChange(false)}
                        style={[
                            styles.holeScoreInput.stepperButton,
                            !secondIsLong && styles.holeScoreInput.parButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.holeScoreInput.stepperButtonText,
                                !secondIsLong && styles.holeScoreInput.parButtonTextActive,
                            ]}
                        >
                            Short
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="second-putt-long"
                        onPress={() => handleSecondIsLongChange(true)}
                        style={[
                            styles.holeScoreInput.stepperButton,
                            secondIsLong && styles.holeScoreInput.parButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.holeScoreInput.stepperButtonText,
                                secondIsLong && styles.holeScoreInput.parButtonTextActive,
                            ]}
                        >
                            Long
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Third Putt (only if 3-putt selected) */}
            {threePuttSelected && (
                <>
                    <View style={styles.holeScoreInput.playerRow}>
                        <Text style={styles.holeScoreInput.playerName}>3rd Putt (ft)</Text>
                        <View style={styles.holeScoreInput.stepperRow}>
                            <TouchableOpacity
                                testID="decrement-third-putt"
                                onPress={() => handleThirdPuttChange(-1)}
                                style={styles.holeScoreInput.stepperButton}
                            >
                                <Text style={styles.holeScoreInput.stepperButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text testID="third-putt-distance" style={styles.holeScoreInput.scoreText}>
                                {thirdPutt}
                            </Text>
                            <TouchableOpacity
                                testID="increment-third-putt"
                                onPress={() => handleThirdPuttChange(1)}
                                style={styles.holeScoreInput.stepperButton}
                            >
                                <Text style={styles.holeScoreInput.stepperButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Third Putt Direction Toggle */}
                    <View style={styles.holeScoreInput.playerRow}>
                        <Text style={styles.holeScoreInput.playerName}>3rd Putt</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                testID="third-putt-short"
                                onPress={() => handleThirdIsLongChange(false)}
                                style={[
                                    styles.holeScoreInput.stepperButton,
                                    !thirdIsLong && styles.holeScoreInput.parButtonActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.holeScoreInput.stepperButtonText,
                                        !thirdIsLong && styles.holeScoreInput.parButtonTextActive,
                                    ]}
                                >
                                    Short
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                testID="third-putt-long"
                                onPress={() => handleThirdIsLongChange(true)}
                                style={[
                                    styles.holeScoreInput.stepperButton,
                                    thirdIsLong && styles.holeScoreInput.parButtonActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.holeScoreInput.stepperButtonText,
                                        thirdIsLong && styles.holeScoreInput.parButtonTextActive,
                                    ]}
                                >
                                    Long
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

export default PuttingStatsInput;
