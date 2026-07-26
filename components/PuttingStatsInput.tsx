import { useState } from 'react';
import { Text, TouchableOpacity, View, TextInput, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

type Props = {
    holePar: number;
    threePuttSelected: boolean;
    onStatsChange: (firstPuttDistance: number | undefined, secondPuttDistance: number, secondPuttIsLong: boolean, thirdPuttDistance?: number, thirdPuttIsLong?: boolean) => void;
    initialFirstPutt?: number;
    initialSecondPutt?: number;
    initialSecondIsLong?: boolean;
    initialThirdPutt?: number;
    initialThirdIsLong?: boolean;
    showFirstPuttError?: boolean;
};

const PuttingStatsInput = ({
    holePar,
    threePuttSelected,
    onStatsChange,
    initialFirstPutt,
    initialSecondPutt,
    initialSecondIsLong = false,
    initialThirdPutt,
    initialThirdIsLong = false,
    showFirstPuttError = false,
}: Props) => {
    const styles = useStyles();
    const colours = useThemeColours();
    const [firstPutt, setFirstPutt] = useState(initialFirstPutt !== undefined ? String(initialFirstPutt) : '');
    const [secondPutt, setSecondPutt] = useState(String(initialSecondPutt ?? 0));
    const [secondIsLong, setSecondIsLong] = useState(initialSecondIsLong);
    const [secondPuttMenuVisible, setSecondPuttMenuVisible] = useState(false);
    const [thirdPutt, setThirdPutt] = useState(String(initialThirdPutt ?? 3));
    const [thirdIsLong, setThirdIsLong] = useState(initialThirdIsLong);
    const [thirdPuttMenuVisible, setThirdPuttMenuVisible] = useState(false);

    const handleFirstPuttChange = (value: string) => {
        setFirstPutt(value);
        if (!value || value.trim() === '') {
            const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
            const third = Math.max(1, Math.min(100, parseInt(thirdPutt) || 3));
            onStatsChange(undefined, second, secondIsLong, threePuttSelected ? third : undefined, threePuttSelected ? thirdIsLong : undefined);
            return;
        }
        if (!isNaN(parseInt(value))) {
            const first = Math.max(0, Math.min(300, parseInt(value)));
            const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
            const third = Math.max(1, Math.min(100, parseInt(thirdPutt) || 3));
            onStatsChange(first, second, secondIsLong, threePuttSelected ? third : undefined, threePuttSelected ? thirdIsLong : undefined);
        }
    };

    const handleSecondPuttChange = (value: string) => {
        setSecondPutt(value);
        if (value && !isNaN(parseInt(value))) {
            const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(300, parseInt(firstPutt))) : undefined;
            const second = Math.max(0, Math.min(100, parseInt(value)));
            const third = Math.max(1, Math.min(100, parseInt(thirdPutt) || 3));
            onStatsChange(first, second, secondIsLong, threePuttSelected ? third : undefined, threePuttSelected ? thirdIsLong : undefined);
        }
    };

    const handleThirdPuttChange = (value: string) => {
        setThirdPutt(value);
        if (value && !isNaN(parseInt(value))) {
            const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(300, parseInt(firstPutt))) : undefined;
            const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
            const third = Math.max(1, Math.min(100, parseInt(value)));
            onStatsChange(first, second, secondIsLong, threePuttSelected ? third : undefined, threePuttSelected ? thirdIsLong : undefined);
        }
    };

    const handleSecondIsLongChange = (value: boolean) => {
        setSecondIsLong(value);
        setSecondPuttMenuVisible(false);
        const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(300, parseInt(firstPutt))) : undefined;
        const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
        const third = Math.max(1, Math.min(100, parseInt(thirdPutt) || 3));
        onStatsChange(first, second, value, threePuttSelected ? third : undefined, threePuttSelected ? thirdIsLong : undefined);
    };

    const handleThirdIsLongChange = (value: boolean) => {
        setThirdIsLong(value);
        setThirdPuttMenuVisible(false);
        const first = firstPutt && !isNaN(parseInt(firstPutt)) ? Math.max(0, Math.min(300, parseInt(firstPutt))) : undefined;
        const second = Math.max(0, Math.min(100, parseInt(secondPutt) || 0));
        const third = Math.max(1, Math.min(100, parseInt(thirdPutt) || 3));
        onStatsChange(first, second, secondIsLong, threePuttSelected ? third : undefined, threePuttSelected ? value : undefined);
    };

    return (
        <View style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
            {/* First Putt */}
            <View style={{ marginBottom: 16 }}>
                <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>1st Putt (ft)</Text>
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
                <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>2nd Putt (ft)</Text>
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
                    <TouchableOpacity
                        testID="second-putt-dropdown"
                        onPress={() => setSecondPuttMenuVisible(!secondPuttMenuVisible)}
                        style={{
                            borderWidth: 1,
                            borderColor: colours.primary,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            minWidth: 100,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text style={[styles.holeScoreInput.playerName, { marginBottom: 0, flex: 1 }]}>
                            {secondIsLong ? 'Long' : 'Short'}
                        </Text>
                        <MaterialIcons name={secondPuttMenuVisible ? 'expand-less' : 'expand-more'} size={20} color={colours.primary} />
                    </TouchableOpacity>
                    <Modal visible={secondPuttMenuVisible} transparent animationType="none">
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() => setSecondPuttMenuVisible(false)}
                        >
                            <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 200 }}>
                                <View
                                    style={{
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        marginHorizontal: 16,
                                        backgroundColor: colours.background,
                                        borderWidth: 1,
                                        borderColor: colours.primary,
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleSecondIsLongChange(false)}
                                        style={{
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            backgroundColor: !secondIsLong ? colours.primary : colours.background,
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.holeScoreInput.playerName,
                                                { marginBottom: 0, color: !secondIsLong ? colours.background : colours.primary },
                                            ]}
                                        >
                                            Short
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleSecondIsLongChange(true)}
                                        style={{
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            backgroundColor: secondIsLong ? colours.primary : colours.background,
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.holeScoreInput.playerName,
                                                { marginBottom: 0, color: secondIsLong ? colours.background : colours.primary },
                                            ]}
                                        >
                                            Long
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            </View>

            {/* Third Putt (only if 3-putt selected) */}
            {threePuttSelected ? (
                <View>
                    <Text style={[styles.holeScoreInput.playerName, { marginBottom: 8 }]}>3rd Putt (ft)</Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TextInput
                            testID="third-putt-input"
                            value={thirdPutt}
                            onChangeText={handleThirdPuttChange}
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
                            placeholder="3"
                            placeholderTextColor={colours.primary}
                        />
                        <TouchableOpacity
                            testID="third-putt-dropdown"
                            onPress={() => setThirdPuttMenuVisible(!thirdPuttMenuVisible)}
                            style={{
                                borderWidth: 1,
                                borderColor: colours.primary,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                                minWidth: 100,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text style={[styles.holeScoreInput.playerName, { marginBottom: 0, flex: 1 }]}>
                                {thirdIsLong ? 'Long' : 'Short'}
                            </Text>
                            <MaterialIcons name={thirdPuttMenuVisible ? 'expand-less' : 'expand-more'} size={20} color={colours.primary} />
                        </TouchableOpacity>
                        <Modal visible={thirdPuttMenuVisible} transparent animationType="none">
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => setThirdPuttMenuVisible(false)}
                            >
                                <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 360 }}>
                                    <View
                                        style={{
                                            borderRadius: 8,
                                            overflow: 'hidden',
                                            marginHorizontal: 16,
                                            backgroundColor: colours.background,
                                            borderWidth: 1,
                                            borderColor: colours.primary,
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => handleThirdIsLongChange(false)}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                backgroundColor: !thirdIsLong ? colours.primary : colours.background,
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.holeScoreInput.playerName,
                                                    { marginBottom: 0, color: !thirdIsLong ? colours.background : colours.primary },
                                                ]}
                                            >
                                                Short
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleThirdIsLongChange(true)}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                backgroundColor: thirdIsLong ? colours.primary : colours.background,
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.holeScoreInput.playerName,
                                                    { marginBottom: 0, color: thirdIsLong ? colours.background : colours.primary },
                                                ]}
                                            >
                                                Long
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                </View>
            ) : null}
        </View>
    );
};

export default PuttingStatsInput;
