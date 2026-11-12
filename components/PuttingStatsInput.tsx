import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';
import PuttDistancePicker from './PuttDistancePicker';
import AppSwitch from './AppSwitch';

const MAX_FIRST_PUTT_DISTANCE = 100;
const MAX_SECOND_PUTT_DISTANCE = 100;

type Props = {
    holePar: number;
    userScore?: number;
    threePuttSelected: boolean;
    onStatsChange: (firstPuttDistance: number | undefined, secondPuttDistance: number | undefined, secondPuttIsLong: boolean, greenInRegulation: boolean) => void;
    initialFirstPutt?: number;
    initialSecondPutt?: number;
    initialSecondIsLong?: boolean;
    initialGreenInRegulation?: boolean;
    showFirstPuttError?: boolean;
    showSecondPuttRequiredError?: boolean;
    onSecondPuttErrorChange?: (hasError: boolean) => void;
};

const PuttingStatsInput = ({
    holePar,
    userScore,
    threePuttSelected,
    onStatsChange,
    initialFirstPutt,
    initialSecondPutt,
    initialSecondIsLong = false,
    initialGreenInRegulation = false,
    showFirstPuttError = false,
    showSecondPuttRequiredError = false,
    onSecondPuttErrorChange,
}: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const [firstPutt, setFirstPutt] = useState(initialFirstPutt !== undefined ? String(initialFirstPutt) : '');
    const [secondPutt, setSecondPutt] = useState(initialSecondPutt !== undefined ? String(initialSecondPutt) : '');
    const [secondIsLong, setSecondIsLong] = useState(initialSecondIsLong);
    const [greenInRegulation, setGreenInRegulation] = useState(initialGreenInRegulation);
    // Once the user taps Yes/No, their choice for this hole wins over the automatic default
    const [greenInRegulationManuallySet, setGreenInRegulationManuallySet] = useState(false);

    // Two putts (both distances entered) with a score equal to par implies the green was hit in regulation.
    // Only applies when the score is known; otherwise the current value is left untouched.
    const emitStats = (first: number | undefined, second: number | undefined, secondIsLong: boolean) => {
        let gir = greenInRegulation;
        if (userScore !== undefined && !greenInRegulationManuallySet) {
            gir = first !== undefined && second !== undefined && userScore === holePar;
            setGreenInRegulation(gir);
        }
        onStatsChange(first, second, secondIsLong, gir);
    };

    // Initialize error state: if short second putt >= first putt
    const initializeError = () => {
        if (!initialSecondIsLong && initialFirstPutt !== undefined && initialSecondPutt !== undefined && initialSecondPutt > 0 && initialSecondPutt >= initialFirstPutt) {
            return true;
        }
        return false;
    };

    const [secondPuttError, setSecondPuttError] = useState(initializeError());

    useEffect(() => {
        onSecondPuttErrorChange?.(secondPuttError);
    }, [secondPuttError, onSecondPuttErrorChange]);

    const handleFirstPuttChange = (value: string) => {
        setFirstPutt(value);
        if (!value || value.trim() === '') {
            const second = secondPutt && !isNaN(parseInt(secondPutt)) ? Math.max(0, Math.min(MAX_SECOND_PUTT_DISTANCE, parseInt(secondPutt))) : undefined;
            setSecondPuttError(false);
            emitStats(undefined, second, secondIsLong);
            return;
        }
        if (!isNaN(parseInt(value))) {
            const first = Math.max(0, Math.min(MAX_FIRST_PUTT_DISTANCE, parseInt(value)));
            const second = secondPutt && !isNaN(parseInt(secondPutt)) ? Math.max(0, Math.min(MAX_SECOND_PUTT_DISTANCE, parseInt(secondPutt))) : undefined;

            // Re-validate: if second putt is marked Short and > 0, it must be strictly less than first putt
            if (!secondIsLong && second !== undefined && second > 0 && second >= first) {
                setSecondPuttError(true);
            } else {
                setSecondPuttError(false);
            }

            emitStats(first, second, secondIsLong);
        }
    };

    const handleSecondPuttChange = (value: string) => {
        setSecondPutt(value);
        if (!value) {
            // Blank field means undefined second putt
            const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(MAX_FIRST_PUTT_DISTANCE, parseInt(firstPutt))) : undefined;
            setSecondPuttError(false);
            emitStats(first, undefined, secondIsLong);
            return;
        }
        if (!isNaN(parseInt(value))) {
            const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(MAX_FIRST_PUTT_DISTANCE, parseInt(firstPutt))) : undefined;
            const second = Math.max(0, Math.min(MAX_SECOND_PUTT_DISTANCE, parseInt(value)));

            // Validation: if second putt > 0, first putt must also be > 0
            if (second > 0 && (first === undefined || first === 0)) {
                return;
            }

            // Validation: if second putt is marked Short and > 0, it must be strictly less than first putt
            if (!secondIsLong && first !== undefined && second > 0 && second >= first) {
                setSecondPuttError(true);
                return;
            }

            setSecondPuttError(false);
            emitStats(first, second, secondIsLong);
        }
    };


    const handleSecondIsLongChange = (value: boolean) => {
        const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(MAX_FIRST_PUTT_DISTANCE, parseInt(firstPutt))) : undefined;
        const second = secondPutt && !isNaN(parseInt(secondPutt)) ? Math.max(0, Math.min(MAX_SECOND_PUTT_DISTANCE, parseInt(secondPutt))) : undefined;

        // Validation: cannot switch to Short if second putt > 0 and >= first putt
        if (!value && first !== undefined && second !== undefined && second > 0 && second >= first) {
            setSecondPuttError(true);
            return;
        }

        setSecondPuttError(false);
        setSecondIsLong(value);
        emitStats(first, second, value);
    };

    const handleGreenInRegulationChange = (value: boolean) => {
        setGreenInRegulationManuallySet(true);
        setGreenInRegulation(value);
        const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(MAX_FIRST_PUTT_DISTANCE, parseInt(firstPutt))) : undefined;
        const second = secondPutt && !isNaN(parseInt(secondPutt)) ? Math.max(0, Math.min(MAX_SECOND_PUTT_DISTANCE, parseInt(secondPutt))) : undefined;
        onStatsChange(first, second, secondIsLong, value);
    };

    const errorText = (text: string, testID: string) => (
        <Text testID={testID} style={{ color: colours.errorText, fontSize: fontSizes.smallText, paddingHorizontal: 16, paddingBottom: 8 }}>
            {text}
        </Text>
    );

    return (
        <View>
            {threePuttSelected && (
                <View style={{ paddingHorizontal: 16, paddingTop: 12, alignItems: 'flex-start' }}>
                    <View style={{ backgroundColor: colours.primary, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 }}>
                        <Text testID="three-putt-indicator" style={{ color: colours.white, fontSize: fontSizes.smallestText, fontWeight: 'bold' }}>
                            3-putt
                        </Text>
                    </View>
                </View>
            )}

            {/* 1st putt */}
            <View style={styles.holeScreen.puttRow}>
                <Text testID="first-putt-label" style={styles.holeScreen.puttLabel}>1st putt</Text>
                <PuttDistancePicker
                    testID="first-putt-input"
                    value={firstPutt}
                    maxDistance={MAX_FIRST_PUTT_DISTANCE}
                    onChange={handleFirstPuttChange}
                    hasError={showFirstPuttError}
                />
                <Text style={styles.holeScreen.puttUnit}>ft</Text>
            </View>
            {showFirstPuttError && errorText('1st putt distance is required', 'first-putt-error')}

            <View style={styles.holeScreen.rowDivider} />

            {/* 2nd putt */}
            <View style={styles.holeScreen.puttRow}>
                <Text testID="second-putt-label" style={styles.holeScreen.puttLabel}>2nd putt</Text>
                <View style={styles.holeScreen.segment}>
                    <TouchableOpacity
                        testID="second-putt-toggle-short"
                        onPress={() => handleSecondIsLongChange(false)}
                        style={[styles.holeScreen.segmentOption, !secondIsLong && styles.holeScreen.segmentOptionActive]}
                    >
                        <Text style={[styles.holeScreen.segmentText, !secondIsLong && styles.holeScreen.segmentTextActive]}>Short</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        testID="second-putt-toggle-long"
                        onPress={() => handleSecondIsLongChange(true)}
                        style={[styles.holeScreen.segmentOption, secondIsLong && styles.holeScreen.segmentOptionActive]}
                    >
                        <Text style={[styles.holeScreen.segmentText, secondIsLong && styles.holeScreen.segmentTextActive]}>Long</Text>
                    </TouchableOpacity>
                </View>
                <PuttDistancePicker
                    testID="second-putt-input"
                    value={secondPutt}
                    maxDistance={MAX_SECOND_PUTT_DISTANCE}
                    onChange={handleSecondPuttChange}
                    hasError={secondPuttError || showSecondPuttRequiredError}
                />
                <Text style={styles.holeScreen.puttUnit}>ft</Text>
            </View>
            {secondPuttError && errorText('Short second putt must be shorter than first putt', 'second-putt-error')}
            {showSecondPuttRequiredError && errorText('2nd putt distance is required for a 3-putt', 'second-putt-required-error')}

            <View style={styles.holeScreen.rowDivider} />

            {/* Green in regulation */}
            <View style={styles.holeScreen.puttRow}>
                <Text testID="gir-label" style={styles.holeScreen.puttLabel}>Green in regulation</Text>
                <AppSwitch
                    testID="gir-switch"
                    value={greenInRegulation}
                    onValueChange={handleGreenInRegulationChange}
                />
            </View>
        </View>
    );
};

export default PuttingStatsInput;
