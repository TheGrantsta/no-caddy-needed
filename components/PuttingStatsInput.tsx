import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

type Props = {
    holePar: number;
    threePuttSelected: boolean;
    onStatsChange: (firstPuttDistance: number | undefined, secondPuttDistance: number, secondPuttIsLong: boolean) => void;
    initialFirstPutt?: number;
    initialSecondPutt?: number;
    initialSecondIsLong?: boolean;
    showFirstPuttError?: boolean;
    onSecondPuttErrorChange?: (hasError: boolean) => void;
};

const PuttingStatsInput = ({
    holePar,
    threePuttSelected,
    onStatsChange,
    initialFirstPutt,
    initialSecondPutt,
    initialSecondIsLong = false,
    showFirstPuttError = false,
    onSecondPuttErrorChange,
}: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const [firstPutt, setFirstPutt] = useState(initialFirstPutt !== undefined ? String(initialFirstPutt) : '');
    const [secondPutt, setSecondPutt] = useState(String(initialSecondPutt ?? 0));
    const [secondIsLong, setSecondIsLong] = useState(initialSecondIsLong);

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
            const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
            onStatsChange(undefined, second, secondIsLong);
            return;
        }
        if (!isNaN(parseInt(value))) {
            const first = Math.max(0, Math.min(300, parseInt(value)));
            const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
            onStatsChange(first, second, secondIsLong);
        }
    };

    const handleSecondPuttChange = (value: string) => {
        setSecondPutt(value);
        if (value && !isNaN(parseInt(value))) {
            const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(300, parseInt(firstPutt))) : undefined;
            const second = Math.max(0, Math.min(100, parseInt(value)));

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
            onStatsChange(first, second, secondIsLong);
        }
    };


    const handleSecondIsLongChange = (value: boolean) => {
        const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(300, parseInt(firstPutt))) : undefined;
        const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));

        // Validation: cannot switch to Short if second putt > 0 and >= first putt
        if (!value && first !== undefined && second > 0 && second >= first) {
            setSecondPuttError(true);
            return;
        }

        setSecondPuttError(false);
        setSecondIsLong(value);
        onStatsChange(first, second, value);
    };

    return (
        <View style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
            {/* 3-putt Indicator */}
            {threePuttSelected && (
                <View style={{ marginBottom: 16, alignItems: 'flex-start' }}>
                    <View style={{ backgroundColor: colours.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}>
                        <Text testID="three-putt-indicator" style={{ color: colours.background, fontSize: 12, fontWeight: 'bold' }}>
                            3-putt
                        </Text>
                    </View>
                </View>
            )}

            {/* First Putt */}
            <View style={{ marginBottom: 16 }}>
                <Text testID="first-putt-label" style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>1st Putt (ft)</Text>
                <TextInput
                    testID="first-putt-input"
                    value={firstPutt}
                    onChangeText={handleFirstPuttChange}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={{
                        borderWidth: 1,
                        borderColor: colours.primary,
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        textAlign: 'center',
                        color: colours.primary,
                    }}
                    placeholder="e.g. 20"
                    placeholderTextColor={colours.primary}
                />
                {showFirstPuttError && (
                    <Text testID="first-putt-error" style={{ color: colours.errorText, fontSize: fontSizes.smallText, marginTop: 4 }}>
                        1st putt distance is required
                    </Text>
                )}
            </View>

            {/* Second Putt */}
            <View style={{ marginBottom: 16 }}>
                <Text testID="second-putt-label" style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>2nd Putt (ft)</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TextInput
                        testID="second-putt-input"
                        value={secondPutt}
                        onChangeText={handleSecondPuttChange}
                        keyboardType="number-pad"
                        maxLength={3}
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colours.primary,
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 16,
                            textAlign: 'center',
                            color: colours.primary,
                        }}
                        placeholder="0"
                        placeholderTextColor={colours.primary}
                    />
                    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: colours.primary, borderRadius: 8, overflow: 'hidden' }}>
                        <TouchableOpacity
                            testID="second-putt-toggle-short"
                            onPress={() => handleSecondIsLongChange(false)}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                backgroundColor: !secondIsLong ? colours.primary : colours.background,
                            }}
                        >
                            <Text
                                style={[
                                    styles.holeScoreInput.playerName,
                                    { marginBottom: 0, fontSize: 14, color: !secondIsLong ? colours.background : colours.primary },
                                ]}
                            >
                                Short
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="second-putt-toggle-long"
                            onPress={() => handleSecondIsLongChange(true)}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                backgroundColor: secondIsLong ? colours.primary : colours.background,
                            }}
                        >
                            <Text
                                style={[
                                    styles.holeScoreInput.playerName,
                                    { marginBottom: 0, fontSize: 14, color: secondIsLong ? colours.background : colours.primary },
                                ]}
                            >
                                Long
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {secondPuttError && (
                    <Text testID="second-putt-error" style={{ color: colours.errorText, fontSize: fontSizes.smallText, marginTop: 4 }}>
                        Short second putt must be shorter than first putt
                    </Text>
                )}
            </View>
        </View>
    );
};

export default PuttingStatsInput;
